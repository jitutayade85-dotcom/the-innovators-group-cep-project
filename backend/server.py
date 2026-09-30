# server.py — FastAPI backend for Surakshit Digital (cyber safety app).
# All routes live under /api so the Expo app can reach them through the proxy.

import json
import logging
import os
import re
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import List

import requests
from bson import ObjectId
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage
from fastapi import APIRouter, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import Response
from motor.motor_asyncio import AsyncIOMotorClient
from starlette.concurrency import run_in_threadpool
from starlette.middleware.cors import CORSMiddleware

from models import (
    Alert,
    Helpline,
    Lesson,
    Profile,
    ProfileIn,
    ScamCheckIn,
)
from seed_data import SEED_LESSONS, SEED_ALERTS, SEED_HELPLINES

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# --- Mongo connection (never change the source of these values) ---
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Emergent Object Storage — the app never talks to storage directly.
# It uploads a photo to OUR backend; we store it and stream it back.
# The EMERGENT_LLM_KEY (used to authenticate to storage) stays server-side.
# ---------------------------------------------------------------------------
STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "surakshit-digital"
_storage_key: str | None = None


def init_storage() -> str:
    """Call once; returns a reusable storage key (idempotent)."""
    global _storage_key
    if _storage_key:
        return _storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    return _storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data,
        timeout=120,
    )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str) -> tuple[bytes, str]:
    key = init_storage()
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key},
        timeout=60,
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


# ---------------------------------------------------------------------------
# Seed: insert starter content once, only when a collection is empty.
# This keeps the app useful on first launch (and offline later via caching).
# ---------------------------------------------------------------------------
async def seed_if_empty():
    seeds = {
        "lessons": SEED_LESSONS,
        "alerts": SEED_ALERTS,
        "helplines": SEED_HELPLINES,
    }
    for name, docs in seeds.items():
        col = db[name]
        if await col.count_documents({}) == 0:
            await col.insert_many([dict(d) for d in docs])
            logger.info("Seeded %d documents into %s", len(docs), name)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await seed_if_empty()
    try:
        await run_in_threadpool(init_storage)  # warm the storage key
    except Exception as e:
        logger.warning("Object storage init skipped: %s", e)
    yield
    client.close()


app.router.lifespan_context = lifespan


# ---------------------------------------------------------------------------
# Content endpoints (the app caches responses locally for offline use)
# ---------------------------------------------------------------------------
@api_router.get("/")
async def root():
    return {"message": "Surakshit Digital API is running"}


@api_router.get("/lessons", response_model=List[Lesson], response_model_by_alias=False)
async def get_lessons():
    docs = await db.lessons.find().sort("order", 1).to_list(200)
    return [Lesson.from_mongo(d) for d in docs]


@api_router.get("/lessons/{lesson_id}", response_model=Lesson, response_model_by_alias=False)
async def get_lesson(lesson_id: str):
    try:
        oid = ObjectId(lesson_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Lesson not found")
    doc = await db.lessons.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return Lesson.from_mongo(doc)


@api_router.get("/alerts", response_model=List[Alert], response_model_by_alias=False)
async def get_alerts():
    docs = await db.alerts.find().sort("published_at", -1).to_list(200)
    return [Alert.from_mongo(d) for d in docs]


@api_router.get("/helplines", response_model=List[Helpline], response_model_by_alias=False)
async def get_helplines():
    docs = await db.helplines.find().sort("order", 1).to_list(200)
    return [Helpline.from_mongo(d) for d in docs]


# ---------------------------------------------------------------------------
# Profile (no login: identified by a device_id generated on the phone).
# ---------------------------------------------------------------------------
@api_router.get("/profile/{device_id}", response_model=Profile, response_model_by_alias=False)
async def get_profile(device_id: str):
    doc = await db.profiles.find_one({"device_id": device_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Profile not found")
    return Profile.from_mongo(doc)


@api_router.post("/profile", response_model=Profile, response_model_by_alias=False)
async def upsert_profile(body: ProfileIn):
    now = datetime.now(timezone.utc).isoformat()
    update = body.model_dump()
    update["updated_at"] = now
    result = await db.profiles.find_one_and_update(
        {"device_id": body.device_id},
        {"$set": update, "$setOnInsert": {"created_at": now}},
        upsert=True,
        return_document=True,
    )
    return Profile.from_mongo(result)


# ---------------------------------------------------------------------------
# Photo upload -> Emergent Object Storage. Returns the stored path; the app
# saves that path on the profile and displays it via GET /files/{path}.
# ---------------------------------------------------------------------------
@api_router.post("/upload")
async def upload_photo(device_id: str = Form(...), file: UploadFile = File(...)):
    data = await file.read()
    if len(data) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Photo too large (max 5MB)")
    ext = (file.filename or "photo.jpg").rsplit(".", 1)[-1].lower()
    if ext not in {"jpg", "jpeg", "png", "webp", "heic"}:
        ext = "jpg"
    path = f"{APP_NAME}/uploads/{device_id}/{uuid.uuid4()}.{ext}"
    content_type = file.content_type or "image/jpeg"
    try:
        await run_in_threadpool(put_object, path, data, content_type)
    except Exception as e:
        logger.error("upload failed: %s", e)
        raise HTTPException(status_code=502, detail="Could not save photo")
    return {"path": path, "url": f"/api/files/{path}"}


@api_router.get("/files/{path:path}")
async def serve_file(path: str):
    try:
        content, content_type = await run_in_threadpool(get_object, path)
    except Exception as e:
        logger.error("serve_file failed for %s: %s", path, e)
        raise HTTPException(status_code=404, detail="File not found")
    return Response(content=content, media_type=content_type)


# ---------------------------------------------------------------------------
# AI scam checker — the LLM call happens HERE on the server.
# No API key ever ships inside the mobile app.
# ---------------------------------------------------------------------------
LANG_NAMES = {"en": "English", "hi": "Hindi", "mr": "Marathi", "gu": "Gujarati"}

SYSTEM_PROMPT = (
    "You are a cyber safety expert protecting rural users in India from online fraud. "
    "Analyze the message the user sends and classify it.\n"
    "Respond ONLY with valid JSON, no markdown, exactly in this shape:\n"
    '{"verdict": "safe" | "suspicious" | "scam", "confidence": <integer 0-100>, '
    '"tips": ["<tip 1>", "<tip 2>", "<tip 3>"]}\n'
    'Rules: "scam" = clearly a fraud; "suspicious" = could be fraud or needs caution; '
    '"safe" = clearly harmless.\n'
    "Tips must be simple actions written in {language}, each under 12 words, using very "
    "simple words a rural user with low literacy can understand. Maximum 3 tips."
)


def _extract_json(raw: str) -> dict:
    """Pull the first {...} block out of the model's reply and parse it."""
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not match:
        raise ValueError("no JSON found in model reply")
    return json.loads(match.group(0))


@api_router.post("/check-scam")
async def check_scam(body: ScamCheckIn):
    lang = body.lang if body.lang in LANG_NAMES else "en"
    try:
        chat = LlmChat(
            api_key=os.environ["EMERGENT_LLM_KEY"],
            session_id=f"scam-check-{uuid.uuid4()}",
            system_message=SYSTEM_PROMPT.replace("{language}", LANG_NAMES[lang]),
        ).with_model("openai", "gpt-5.4-mini")

        user_message = UserMessage(
            text=f"Message to analyze:\n{body.text.strip()}\n\nRespond with JSON only."
        )
        reply = await chat.send_message(user_message)
        data = _extract_json(reply)
    except HTTPException:
        raise
    except Exception as e:
        logger.error("check-scam failed: %s", e)
        raise HTTPException(status_code=502, detail="AI could not analyze this message")

    verdict = str(data.get("verdict", "suspicious"))
    if verdict not in {"safe", "suspicious", "scam"}:
        verdict = "suspicious"
    try:
        confidence = max(0, min(100, int(data.get("confidence", 70))))
    except (TypeError, ValueError):
        confidence = 70
    tips = [str(t)[:120] for t in data.get("tips", [])][:3]

    # Store an anonymous log for analytics (no user identity involved).
    await db.scam_checks.insert_one(
        {
            "text": body.text.strip()[:500],
            "lang": lang,
            "verdict": verdict,
            "confidence": confidence,
            "created_at": datetime.now(timezone.utc),
        }
    )
    return {"verdict": verdict, "confidence": confidence, "tips": tips}


# --- CORS so the Expo web preview can call the API ---
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
