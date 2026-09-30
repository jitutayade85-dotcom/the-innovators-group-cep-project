# Phase 1 backend tests for Surakshit Digital
# Covers: profile CRUD/upsert/validation, upload+serve, id (not _id) on list endpoints,
# check-scam still returns the expected shape.

import io
import os
import struct
import uuid
import zlib

import pytest
import requests

BASE_URL = os.environ.get(
    "EXPO_BACKEND_URL", "https://surakshit-digital.preview.emergentagent.com"
).rstrip("/")

API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def device_id():
    # Unique device id per module run, prefixed for easy cleanup.
    return f"TEST_dev_{uuid.uuid4().hex[:12]}"


def _tiny_png_bytes() -> bytes:
    """Build a minimal 1x1 transparent PNG (valid image bytes)."""
    def chunk(tag, data):
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = chunk(b"IHDR", struct.pack(">IIBBBBB", 1, 1, 8, 6, 0, 0, 0))
    raw = b"\x00" + b"\x00\x00\x00\x00"  # filter byte + 1 pixel RGBA
    idat = chunk(b"IDAT", zlib.compress(raw))
    iend = chunk(b"IEND", b"")
    return sig + ihdr + idat + iend


# -------------------- list endpoints: id, not _id --------------------

class TestListEndpointsIdField:
    """All list endpoints must expose `id` (str) and never `_id`."""

    @pytest.mark.parametrize("path", ["/lessons", "/alerts", "/helplines"])
    def test_endpoint_has_id_not_underscore_id(self, api_client, path):
        r = api_client.get(f"{API}{path}", timeout=30)
        assert r.status_code == 200, f"{path} -> {r.status_code}"
        items = r.json()
        assert isinstance(items, list) and len(items) > 0, f"{path} empty"
        for item in items:
            assert "id" in item and isinstance(item["id"], str) and item["id"], f"{path} missing id"
            assert "_id" not in item, f"{path} leaked _id"


# -------------------- profile CRUD + upsert + validation --------------------

class TestProfile:
    def test_get_unknown_device_returns_404(self, api_client):
        r = api_client.get(f"{API}/profile/TEST_missing_{uuid.uuid4().hex[:8]}", timeout=30)
        assert r.status_code == 404

    def test_create_profile_returns_id_not_underscore_id(self, api_client, device_id):
        payload = {"device_id": device_id, "name": "TEST_Aisha", "lang": "hi", "age": 22, "place": "Pune"}
        r = api_client.post(f"{API}/profile", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "id" in data and isinstance(data["id"], str) and data["id"]
        assert "_id" not in data
        assert data["device_id"] == device_id
        assert data["name"] == "TEST_Aisha"
        assert data["lang"] == "hi"
        assert data["age"] == 22
        assert data["place"] == "Pune"

        # Verify GET persists it.
        g = api_client.get(f"{API}/profile/{device_id}", timeout=30)
        assert g.status_code == 200
        assert g.json()["name"] == "TEST_Aisha"

    def test_upsert_same_device_id_updates_no_duplicate(self, api_client, device_id):
        # Update name/lang for same device_id
        r = api_client.post(
            f"{API}/profile",
            json={"device_id": device_id, "name": "TEST_Aisha2", "lang": "en", "age": 23, "place": "Mumbai"},
            timeout=30,
        )
        assert r.status_code == 200
        data = r.json()
        assert data["name"] == "TEST_Aisha2"
        assert data["lang"] == "en"
        assert data["age"] == 23

        # GET should reflect the update.
        g = api_client.get(f"{API}/profile/{device_id}", timeout=30)
        assert g.status_code == 200
        assert g.json()["name"] == "TEST_Aisha2"

    def test_validation_empty_name_422(self, api_client):
        r = api_client.post(
            f"{API}/profile",
            json={"device_id": f"TEST_v_{uuid.uuid4().hex[:8]}", "name": "", "lang": "en"},
            timeout=30,
        )
        assert r.status_code == 422

    def test_validation_age_out_of_range_422(self, api_client):
        # Age > 120
        r = api_client.post(
            f"{API}/profile",
            json={"device_id": f"TEST_v_{uuid.uuid4().hex[:8]}", "name": "X", "age": 200},
            timeout=30,
        )
        assert r.status_code == 422

        # Age < 1
        r2 = api_client.post(
            f"{API}/profile",
            json={"device_id": f"TEST_v_{uuid.uuid4().hex[:8]}", "name": "X", "age": 0},
            timeout=30,
        )
        assert r2.status_code == 422


# -------------------- photo upload + file serve --------------------

class TestUploadAndServe:
    def test_upload_and_fetch_image(self, device_id):
        png = _tiny_png_bytes()
        files = {"file": ("pixel.png", io.BytesIO(png), "image/png")}
        data = {"device_id": device_id}
        r = requests.post(f"{API}/upload", files=files, data=data, timeout=60)
        assert r.status_code == 200, r.text
        body = r.json()
        assert "path" in body and body["path"], "missing path"
        assert "url" in body and body["url"].startswith("/api/files/"), body

        # Fetch bytes back
        g = requests.get(f"{BASE_URL}{body['url']}", timeout=60)
        assert g.status_code == 200
        assert g.headers.get("content-type", "").startswith("image/"), g.headers
        assert len(g.content) > 0


# -------------------- check-scam still returns expected shape --------------------

class TestCheckScam:
    def test_check_scam_returns_verdict_confidence_tips(self, api_client):
        r = api_client.post(
            f"{API}/check-scam",
            json={"text": "Congratulations lottery winner. Share your OTP to receive prize money.", "lang": "en"},
            timeout=90,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["verdict"] in {"safe", "suspicious", "scam"}
        assert isinstance(data["confidence"], int) and 0 <= data["confidence"] <= 100
        assert isinstance(data["tips"], list) and 1 <= len(data["tips"]) <= 3
