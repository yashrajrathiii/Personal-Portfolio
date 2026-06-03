"""Backend API tests for image uploads + analytics endpoints."""
import os
import io
import struct
import zlib
import uuid
import pytest
import requests

BASE_URL = os.environ['REACT_APP_BACKEND_URL'].rstrip('/')
ADMIN_EMAIL = "rathiyash12@gmail.com"
ADMIN_PASSWORD = "Bhopal@123"


def _make_png_bytes(width=2, height=2):
    """Create a tiny valid PNG byte stream."""
    def chunk(tag, data):
        return (struct.pack(">I", len(data)) + tag + data
                + struct.pack(">I", zlib.crc32(tag + data) & 0xffffffff))
    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    raw = b"".join(b"\x00" + b"\xff\x00\x00" * width for _ in range(height))
    idat = zlib.compress(raw)
    return sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")


@pytest.fixture(scope="session")
def api():
    return requests.Session()


@pytest.fixture(scope="session")
def token(api):
    r = api.post(f"{BASE_URL}/api/auth/login",
                 json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ---------- Image Upload ----------
class TestImageUpload:
    def test_upload_requires_auth(self, api):
        r = api.post(f"{BASE_URL}/api/uploads/image",
                     files={"file": ("a.png", b"\x89PNG\r\n", "image/png")})
        assert r.status_code == 401

    def test_upload_rejects_non_image(self, api, auth_headers):
        r = api.post(f"{BASE_URL}/api/uploads/image",
                     files={"file": ("a.txt", b"hello", "text/plain")},
                     headers=auth_headers)
        assert r.status_code == 400
        assert "image" in r.text.lower() or "allowed" in r.text.lower()

    def test_upload_rejects_oversized(self, api, auth_headers):
        big = b"\x89PNG\r\n\x1a\n" + b"0" * (5 * 1024 * 1024 + 100)
        r = api.post(f"{BASE_URL}/api/uploads/image",
                     files={"file": ("big.png", big, "image/png")},
                     headers=auth_headers)
        assert r.status_code == 400
        assert "5" in r.text or "MB" in r.text.lower() or "under" in r.text.lower()

    def test_upload_png_success_and_fetch(self, api, auth_headers):
        png = _make_png_bytes()
        r = api.post(f"{BASE_URL}/api/uploads/image",
                     files={"file": ("test.png", png, "image/png")},
                     headers=auth_headers)
        assert r.status_code == 200, r.text
        body = r.json()
        assert "url" in body and "filename" in body and "size" in body
        assert body["url"].startswith("/api/uploads/files/")
        assert body["filename"].endswith(".png")
        assert body["size"] == len(png)
        # fetch the file back
        full = f"{BASE_URL}{body['url']}"
        g = requests.get(full)
        assert g.status_code == 200
        assert g.content == png

    def test_upload_jpeg_success(self, api, auth_headers):
        # A minimal JPEG-ish bytestring; server only checks content_type
        r = api.post(f"{BASE_URL}/api/uploads/image",
                     files={"file": ("a.jpg", b"\xff\xd8\xff\xe0fakejpeg", "image/jpeg")},
                     headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["filename"].endswith(".jpg")

    def test_upload_webp_success(self, api, auth_headers):
        r = api.post(f"{BASE_URL}/api/uploads/image",
                     files={"file": ("a.webp", b"RIFF\x00\x00\x00\x00WEBPfake", "image/webp")},
                     headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["filename"].endswith(".webp")


# ---------- Analytics ----------
class TestAnalytics:
    def test_visit_is_public(self, api):
        vid = f"TEST_{uuid.uuid4().hex[:8]}"
        r = api.post(f"{BASE_URL}/api/analytics/visit", json={
            "path": "/",
            "referrer": "https://example.com/TEST",
            "user_agent": "pytest-agent",
            "screen": "1920x1080",
            "language": "en",
            "visitor_id": vid,
        })
        assert r.status_code == 200
        assert r.json() == {"ok": True}

    def test_visit_minimal_payload(self, api):
        r = api.post(f"{BASE_URL}/api/analytics/visit", json={})
        assert r.status_code == 200
        assert r.json()["ok"] is True

    def test_stats_requires_auth(self, api):
        r = api.get(f"{BASE_URL}/api/analytics/stats")
        assert r.status_code == 401

    def test_stats_with_token(self, api, auth_headers):
        # log a unique visit then check stats
        vid = f"TEST_STATS_{uuid.uuid4().hex[:8]}"
        ref = f"https://teststats-{uuid.uuid4().hex[:6]}.example.com"
        api.post(f"{BASE_URL}/api/analytics/visit", json={
            "path": "/test", "referrer": ref, "visitor_id": vid,
            "user_agent": "pytest", "screen": "800x600", "language": "en",
        })
        r = api.get(f"{BASE_URL}/api/analytics/stats", headers=auth_headers)
        assert r.status_code == 200, r.text
        d = r.json()
        for k in ["total", "last_day", "last_week", "last_month",
                  "unique_visitors", "top_referrers", "daily", "recent"]:
            assert k in d, f"missing key {k}"
        assert isinstance(d["total"], int) and d["total"] >= 1
        assert isinstance(d["top_referrers"], list)
        assert isinstance(d["daily"], list)
        assert isinstance(d["recent"], list)
        # recent should not leak _id
        for rec in d["recent"]:
            assert "_id" not in rec
        # our visitor should appear in recent
        assert any(rec.get("visitor_id") == vid for rec in d["recent"])
