from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
import uuid
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Any

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, UploadFile, File
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_UPLOAD_SIZE = 5 * 1024 * 1024  # 5 MB


# ---------- MongoDB ----------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]


# ---------- App ----------
app = FastAPI()
api_router = APIRouter(prefix="/api")


# ---------- JWT helpers ----------
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 24 * 7  # 7 days


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


async def get_current_admin(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth[7:]
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload["sub"]})
    if not user or user.get("role") != "admin":
        raise HTTPException(status_code=401, detail="Not authorized")
    user.pop("_id", None)
    user.pop("password_hash", None)
    return user


# ---------- Models ----------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class HeroSection(BaseModel):
    overline: str = "AI PRODUCT MANAGER @ RESHUFFLE"
    name: str = "YASH RAJ RATHI"
    hook: str = "I ship AI-native SaaS products from problem to production."
    tagline: str = "Currently owning end-to-end roadmaps for live B2B SaaS platforms at Reshuffle — turning agentic AI, RAG pipelines, and clean PRDs into measurable business impact."
    location: str = "Raipur, Chhattisgarh"
    available: str = "Open to Product roles · 2026"


class AboutSection(BaseModel):
    label: str = "THE MINDSET"
    paragraphs: List[str] = [
        "I'm an AI Product Manager who lives in the space between a messy user problem and a clear, shippable bet. I think boldly about long-term answers, talk to users instead of assuming, and ground every decision in real usage data.",
        "At Reshuffle I own 2 production B2B SaaS platforms end-to-end — writing clean PRDs, user stories and flows; running A/B-style experiments; and shepherding features from ideation to launch with engineering, design, and analytics.",
        "I obsess about quality at every touchpoint — defining acceptance criteria, personally reviewing pre-release, and refusing to ship anything that doesn't meet the brief. If a feature can't be drawn on a napkin, it's not ready for engineering.",
    ]
    highlights: List[str] = ["Research-led", "0→1 thinking", "Agentic-AI native", "Metric-honest"]


class SkillGroup(BaseModel):
    category: str
    items: List[str]


class SkillsSection(BaseModel):
    groups: List[SkillGroup] = [
        SkillGroup(category="Product Craft", items=["PRD Authoring", "User Stories", "Roadmap Planning", "Feature Prioritization", "MVP Definition", "GTM Strategy", "User Research", "A/B Testing", "KPI Tracking"]),
        SkillGroup(category="AI & Agentic", items=["LLMs", "RAG Pipelines", "Agentic AI Design", "Prompt Engineering", "OpenAI", "Anthropic", "Groq"]),
        SkillGroup(category="Build & Ship", items=["n8n", "Supabase", "Lovable", "Figma", "Netlify", "AWS", "REST APIs", "Webhooks", "OAuth", "Git"]),
        SkillGroup(category="Ops & Soft", items=["Agile / Scrum", "Jira", "Notion", "Miro", "Stakeholder Mgmt", "Cross-functional", "Structured Comms", "Ownership"]),
    ]


class ContactSection(BaseModel):
    email: str = "rathiyash12@gmail.com"
    linkedin: str = "https://www.linkedin.com/in/yash-raj-rathi/"
    github: str = "https://github.com/yashrajrathiii"
    phone: str = "+91 7024704449"
    location: str = "Raipur, Chhattisgarh"
    cta: str = "Have a problem worth solving? Let's talk."


class Experience(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str
    company: str
    duration: str
    location: str = ""
    bullets: List[str] = []


class Project(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    summary: str
    impact: str = ""
    tags: List[str] = []
    image_url: str = ""
    role: str = ""
    year: str = ""
    span: str = "md"  # "sm" | "md" | "lg" controls grid span


class Portfolio(BaseModel):
    hero: HeroSection = Field(default_factory=HeroSection)
    about: AboutSection = Field(default_factory=AboutSection)
    skills: SkillsSection = Field(default_factory=SkillsSection)
    contact: ContactSection = Field(default_factory=ContactSection)
    experience: List[Experience] = []
    projects: List[Project] = []


def default_experience() -> List[Experience]:
    return [
        Experience(
            role="AI Product Manager",
            company="Reshuffle",
            duration="Jan 2026 — Present",
            location="Raipur, India",
            bullets=[
                "Own end-to-end product roadmaps for 2 production-grade AI SaaS platforms — defining long-term product bets, talking to users to derive deep insights, and grounding every decision in real usage data.",
                "Write clean PRDs, user stories and user flows for every feature; run A/B-style experiments on workflows; collaborate with design, engineering and analytics to ship from ideation to launch.",
                "Maintain a high quality bar at every touchpoint — personally reviewing features pre-release, defining acceptance criteria, and ensuring delivered solutions meet the brief before sign-off.",
            ],
        ),
        Experience(
            role="AI Product Manager Intern",
            company="Vidz.ai",
            duration="Nov 2025 — Dec 2025",
            location="Bangalore, India",
            bullets=[
                "Led product discovery and delivery for an AI-powered insurance platform — conducted user research with 500+ agents/brokers, authored PRD and user stories, designed 12 Figma wireframes, and delivered cross-functional execution across 8+ product workflows.",
                "Conducted competitive benchmarking across 20+ platforms; executed GTM strategy through 5+ stakeholder presentations — translating market insights into prioritised product decisions tracked via post-launch KPIs.",
            ],
        ),
        Experience(
            role="Business Development Associate",
            company="PlanetSpark",
            duration="Jan 2025 — Feb 2025",
            location="Gurgaon, India",
            bullets=[
                "Engaged 2,000+ customers to deeply understand their problems and motivations — converted 15% of trial users to paying customers by iterating on value delivery based on real user feedback.",
                "Handled objections across 500+ calls using CRM tools in a high-performance sales environment.",
            ],
        ),
    ]


def default_projects() -> List[Project]:
    return [
        Project(
            title="DispatchOps",
            summary="Currently building — an internal-ops tool that turns chaotic dispatch workflows into a single, observable timeline. Authoring the PRD, designing the flows in Figma, and shipping in Lovable + Supabase as I go.",
            impact="In active development · MVP target Q1 2026",
            tags=["0→1", "Internal Tools", "Lovable", "Supabase", "Workflow"],
            image_url="https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxNzV8MHwxfHNlYXJjaHwxfHxkYXNoYm9hcmQlMjBVSSUyMGRhdGElMjB2aXN1YWxpemF0aW9uJTIwY2xlYW58ZW58MHx8fHwxNzgwNDc5ODk2fDA&ixlib=rb-4.1.0&q=85",
            role="Solo PM + Builder",
            year="2026",
            span="lg",
        ),
        Project(
            title="RECRUIT-AI",
            summary="A two-sided marketplace connecting job seekers to roles. Owned roadmap end-to-end — user research, PRD, user stories, process flows, and 12 Figma wireframes. Deployed on Netlify with Supabase auth.",
            impact="500+ users · 90% match accuracy · 2s response · 15+ KPIs tracked",
            tags=["Lovable", "n8n", "Supabase", "Marketplace", "RAG"],
            image_url="https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxNzV8MHwxfHNlYXJjaHwzfHxkYXNoYm9hcmQlMjBVSSUyMGRhdGElMjB2aXN1YWxpemF0aW9uJTIwY2xlYW58ZW58MHx8fHwxNzgwNDc5ODk2fDA&ixlib=rb-4.1.0&q=85",
            role="Lead PM",
            year="2025",
            span="md",
        ),
        Project(
            title="SubSentry",
            summary="Spotted a real pain point — subscription overspend — turned it into a product hypothesis, shipped an MVP, and validated through post-launch KPI analysis.",
            impact="95% alert automation · 25% overspend reduction · 1,000+ records · 99.9% uptime",
            tags=["n8n", "Supabase", "React", "Consumer", "Automation"],
            image_url="",
            role="Solo PM",
            year="2025",
            span="md",
        ),
    ]


# ---------- Helpers ----------
PORTFOLIO_ID = "main"


async def get_portfolio_doc() -> dict:
    doc = await db.portfolio.find_one({"id": PORTFOLIO_ID})
    if not doc:
        # seed with defaults
        portfolio = Portfolio(experience=default_experience(), projects=default_projects())
        seed = portfolio.model_dump()
        seed["id"] = PORTFOLIO_ID
        seed["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.portfolio.insert_one(seed)
        doc = await db.portfolio.find_one({"id": PORTFOLIO_ID})
    doc.pop("_id", None)
    return doc


# ---------- Auth Routes ----------
@api_router.post("/auth/login")
async def login(payload: LoginRequest):
    email = payload.email.strip().lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(user["id"], user["email"])
    return {
        "token": token,
        "user": {"id": user["id"], "email": user["email"], "name": user.get("name", ""), "role": user.get("role", "admin")},
    }


@api_router.get("/auth/me")
async def me(current_user: dict = Depends(get_current_admin)):
    return {"id": current_user["id"], "email": current_user["email"], "name": current_user.get("name", ""), "role": current_user.get("role", "admin")}


@api_router.post("/auth/logout")
async def logout(current_user: dict = Depends(get_current_admin)):
    return {"ok": True}


# ---------- Portfolio Routes ----------
@api_router.get("/portfolio")
async def get_portfolio():
    return await get_portfolio_doc()


@api_router.put("/portfolio/section/{section}")
async def update_section(section: str, payload: dict, current_user: dict = Depends(get_current_admin)):
    allowed = {"hero", "about", "skills", "contact"}
    if section not in allowed:
        raise HTTPException(status_code=400, detail=f"Section must be one of {allowed}")
    # Validate against model
    model_map = {
        "hero": HeroSection,
        "about": AboutSection,
        "skills": SkillsSection,
        "contact": ContactSection,
    }
    try:
        validated = model_map[section](**payload).model_dump()
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))
    await get_portfolio_doc()  # ensure exists
    await db.portfolio.update_one(
        {"id": PORTFOLIO_ID},
        {"$set": {section: validated, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    return await get_portfolio_doc()


# Experience CRUD
@api_router.post("/portfolio/experience")
async def add_experience(payload: dict, current_user: dict = Depends(get_current_admin)):
    try:
        exp = Experience(**payload)
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))
    await get_portfolio_doc()
    await db.portfolio.update_one(
        {"id": PORTFOLIO_ID},
        {"$push": {"experience": exp.model_dump()}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    return await get_portfolio_doc()


@api_router.put("/portfolio/experience/{exp_id}")
async def update_experience(exp_id: str, payload: dict, current_user: dict = Depends(get_current_admin)):
    doc = await get_portfolio_doc()
    items = doc.get("experience", [])
    updated = False
    for i, item in enumerate(items):
        if item.get("id") == exp_id:
            merged = {**item, **payload, "id": exp_id}
            items[i] = Experience(**merged).model_dump()
            updated = True
            break
    if not updated:
        raise HTTPException(status_code=404, detail="Experience not found")
    await db.portfolio.update_one(
        {"id": PORTFOLIO_ID},
        {"$set": {"experience": items, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    return await get_portfolio_doc()


@api_router.delete("/portfolio/experience/{exp_id}")
async def delete_experience(exp_id: str, current_user: dict = Depends(get_current_admin)):
    await db.portfolio.update_one(
        {"id": PORTFOLIO_ID},
        {"$pull": {"experience": {"id": exp_id}}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    return await get_portfolio_doc()


# Projects CRUD
@api_router.post("/portfolio/projects")
async def add_project(payload: dict, current_user: dict = Depends(get_current_admin)):
    try:
        proj = Project(**payload)
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))
    await get_portfolio_doc()
    await db.portfolio.update_one(
        {"id": PORTFOLIO_ID},
        {"$push": {"projects": proj.model_dump()}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    return await get_portfolio_doc()


@api_router.put("/portfolio/projects/{proj_id}")
async def update_project(proj_id: str, payload: dict, current_user: dict = Depends(get_current_admin)):
    doc = await get_portfolio_doc()
    items = doc.get("projects", [])
    updated = False
    for i, item in enumerate(items):
        if item.get("id") == proj_id:
            merged = {**item, **payload, "id": proj_id}
            items[i] = Project(**merged).model_dump()
            updated = True
            break
    if not updated:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.portfolio.update_one(
        {"id": PORTFOLIO_ID},
        {"$set": {"projects": items, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    return await get_portfolio_doc()


@api_router.delete("/portfolio/projects/{proj_id}")
async def delete_project(proj_id: str, current_user: dict = Depends(get_current_admin)):
    await db.portfolio.update_one(
        {"id": PORTFOLIO_ID},
        {"$pull": {"projects": {"id": proj_id}}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    return await get_portfolio_doc()


# ---------- Image Upload ----------
@api_router.post("/uploads/image")
async def upload_image(file: UploadFile = File(...), current_user: dict = Depends(get_current_admin)):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG and WEBP images are allowed")
    contents = await file.read()
    if len(contents) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail="Image must be under 5 MB")
    ext_map = {"image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png", "image/webp": "webp"}
    ext = ext_map.get(file.content_type, "jpg")
    filename = f"{uuid.uuid4().hex}.{ext}"
    
    # Store image in MongoDB as base64-encoded string
    import base64
    encoded = base64.b64encode(contents).decode("utf-8")
    await db.uploads.insert_one({
        "filename": filename,
        "content_type": file.content_type,
        "data": encoded,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    return {"url": f"/api/uploads/files/{filename}", "filename": filename, "size": len(contents)}


@api_router.get("/uploads/files/{filename}")
async def serve_uploaded_file(filename: str):
    from fastapi.responses import Response
    import base64
    upload = await db.uploads.find_one({"filename": filename})
    if not upload:
        raise HTTPException(status_code=404, detail="File not found")
    data = base64.b64decode(upload["data"])
    headers = {"Cache-Control": "public, max-age=31536000, immutable"}
    return Response(content=data, media_type=upload["content_type"], headers=headers)


# ---------- Analytics ----------
class VisitPayload(BaseModel):
    path: str = "/"
    referrer: Optional[str] = ""
    user_agent: Optional[str] = ""
    screen: Optional[str] = ""
    language: Optional[str] = ""
    visitor_id: Optional[str] = ""  # client-generated stable id


def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for", "")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@api_router.post("/analytics/visit")
async def log_visit(payload: VisitPayload, request: Request):
    doc = {
        "id": str(uuid.uuid4()),
        "path": payload.path or "/",
        "referrer": (payload.referrer or "")[:300],
        "user_agent": (payload.user_agent or "")[:400],
        "screen": payload.screen or "",
        "language": payload.language or "",
        "visitor_id": payload.visitor_id or "",
        "ip": _client_ip(request),
        "ts": datetime.now(timezone.utc).isoformat(),
    }
    await db.visits.insert_one(doc)
    return {"ok": True}


@api_router.get("/analytics/stats")
async def analytics_stats(current_user: dict = Depends(get_current_admin)):
    now = datetime.now(timezone.utc)
    day_ago = (now - timedelta(days=1)).isoformat()
    week_ago = (now - timedelta(days=7)).isoformat()
    month_ago = (now - timedelta(days=30)).isoformat()

    total = await db.visits.count_documents({})
    last_day = await db.visits.count_documents({"ts": {"$gte": day_ago}})
    last_week = await db.visits.count_documents({"ts": {"$gte": week_ago}})
    last_month = await db.visits.count_documents({"ts": {"$gte": month_ago}})

    unique_visitors = len(await db.visits.distinct("visitor_id", {"visitor_id": {"$ne": ""}}))

    # Top referrers
    pipeline_ref = [
        {"$match": {"referrer": {"$ne": ""}}},
        {"$group": {"_id": "$referrer", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 8},
    ]
    top_refs = [{"referrer": r["_id"], "count": r["count"]} async for r in db.visits.aggregate(pipeline_ref)]

    # Daily visits last 14 days
    pipeline_daily = [
        {"$match": {"ts": {"$gte": (now - timedelta(days=14)).isoformat()}}},
        {"$project": {"day": {"$substr": ["$ts", 0, 10]}}},
        {"$group": {"_id": "$day", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}},
    ]
    daily = [{"day": r["_id"], "count": r["count"]} async for r in db.visits.aggregate(pipeline_daily)]

    recent_cursor = db.visits.find({}, {"_id": 0}).sort("ts", -1).limit(20)
    recent = await recent_cursor.to_list(20)

    return {
        "total": total,
        "last_day": last_day,
        "last_week": last_week,
        "last_month": last_month,
        "unique_visitors": unique_visitors,
        "top_referrers": top_refs,
        "daily": daily,
        "recent": recent,
    }


@api_router.get("/")
async def root():
    return {"message": "Portfolio API"}


# ---------- Static uploads ----------
# Serves uploads directly from MongoDB via endpoint defined above


# ---------- Startup ----------
@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.portfolio.create_index("id", unique=True)
    await db.visits.create_index("ts")
    await db.visits.create_index("visitor_id")
    await db.uploads.create_index("filename", unique=True)

    admin_email = os.environ["ADMIN_EMAIL"].strip().lower()
    admin_password = os.environ["ADMIN_PASSWORD"]
    admin_name = os.environ.get("ADMIN_NAME", "Admin")

    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": admin_name,
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Seeded admin user: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password), "name": admin_name}},
        )
        logger.info(f"Updated admin password for: {admin_email}")

    # Seed portfolio content
    await get_portfolio_doc()


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
