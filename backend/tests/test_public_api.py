import os
import requests

BASE_URL = os.environ.get("EXPO_BACKEND_URL", "https://surakshit-digital.preview.emergentagent.com").rstrip("/")


def test_content_endpoints():
    s = requests.Session()
    lessons = s.get(f"{BASE_URL}/api/lessons", timeout=30)
    alerts = s.get(f"{BASE_URL}/api/alerts", timeout=30)
    helplines = s.get(f"{BASE_URL}/api/helplines", timeout=30)
    assert lessons.status_code == 200 and len(lessons.json()) == 6
    assert all(set(x["title"]) == {"en", "hi", "mr", "gu"} and x["steps"] and x["quiz"] for x in lessons.json())
    assert alerts.status_code == 200 and len(alerts.json()) == 5
    assert [x["severity"] for x in alerts.json()] == ["high", "high", "medium", "medium", "low"]
    assert helplines.status_code == 200 and len(helplines.json()) == 5
    assert sum(x["type"] == "phone" for x in helplines.json()) == 4
    assert any(x["url"] == "https://cybercrime.gov.in" for x in helplines.json())


def test_check_scam_validation():
    r = requests.post(f"{BASE_URL}/api/check-scam", json={"text": "x", "lang": "en"}, timeout=30)
    assert r.status_code == 422


def test_check_scam_ai_english():
    r = requests.post(f"{BASE_URL}/api/check-scam", json={"text": "Congratulations lottery winner. Share your OTP to receive prize money.", "lang": "en"}, timeout=60)
    assert r.status_code == 200
    data = r.json()
    assert data["verdict"] == "scam" and 0 <= data["confidence"] <= 100 and data["tips"]


def test_check_scam_ai_hindi():
    r = requests.post(f"{BASE_URL}/api/check-scam", json={"text": "आपने लॉटरी जीती है, इनाम पाने के लिए OTP बताएं", "lang": "hi"}, timeout=60)
    assert r.status_code == 200
    data = r.json()
    assert data["verdict"] == "scam" and data["tips"]