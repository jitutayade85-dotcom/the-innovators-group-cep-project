# models.py — Pydantic models for Surakshit Digital.
# Beginner-friendly comments included. One rule everywhere:
#   Read from Mongo  -> Model.from_mongo(doc)
#   ObjectId is NOT JSON serializable, so from_mongo converts _id -> str id.

from typing import Annotated, List, Optional
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field, BeforeValidator


# Coerce Mongo's ObjectId into a plain string before Pydantic validates it.
def _oid_to_str(v):
    if isinstance(v, ObjectId):
        return str(v)
    return v


# PyObjectId: any field annotated with this accepts ObjectId OR str, and always
# ends up as a str in API responses (so JSON never breaks).
PyObjectId = Annotated[str, BeforeValidator(_oid_to_str)]


class BaseDocument(BaseModel):
    """Base for every Mongo document model. Maps _id -> id as a string."""

    model_config = ConfigDict(populate_by_name=True)

    id: PyObjectId = Field(default=None, alias="_id")

    @classmethod
    def from_mongo(cls, doc: dict):
        """Mongo doc -> model instance (safe for JSON responses)."""
        data = dict(doc)
        data["id"] = str(data.pop("_id", None))
        return cls(**data)

    def to_mongo(self) -> dict:
        """Model -> Mongo-ready dict (keeps _id alias)."""
        return self.model_dump(by_alias=True)


# --- Shared: text shown in 4 languages. The app picks its language client-side. ---
class LocalizedText(BaseModel):
    en: str
    hi: str
    mr: str
    gu: str


class LessonStep(BaseModel):
    text: LocalizedText


class QuizQuestion(BaseModel):
    question: LocalizedText
    options: List[LocalizedText]
    correct_index: int


class Lesson(BaseDocument):
    title: LocalizedText
    summary: LocalizedText
    icon: str          # MaterialCommunityIcons name used by the app
    category: str      # otp | upi | whatsapp | password | social | job
    minutes: int
    order: int
    steps: List[LessonStep]
    quiz: QuizQuestion


class Alert(BaseDocument):
    severity: str      # high | medium | low
    title: LocalizedText
    description: LocalizedText
    published_at: datetime


class Helpline(BaseDocument):
    name: LocalizedText
    description: LocalizedText
    type: str                              # phone | web
    number: Optional[str] = None           # for phone type
    url: Optional[str] = None              # for web type
    order: int


# --- Incoming body for the AI scam checker ---
class ScamCheckIn(BaseModel):
    text: str = Field(min_length=3, max_length=2000)
    lang: str = "en"   # language for the returned tips: en | hi | mr | gu


# --- User profile (no login yet: keyed by a device_id generated on device) ---
class Profile(BaseDocument):
    device_id: str
    name: str
    lang: str = "en"
    age: Optional[int] = None
    place: Optional[str] = None       # village / city
    photo_path: Optional[str] = None  # object-storage path (served via /api/files)
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class ProfileIn(BaseModel):
    device_id: str = Field(min_length=4, max_length=100)
    name: str = Field(min_length=1, max_length=80)
    lang: str = "en"
    age: Optional[int] = Field(default=None, ge=1, le=120)
    place: Optional[str] = Field(default=None, max_length=120)
    photo_path: Optional[str] = None
