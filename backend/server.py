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

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr


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
    overline: str = "PRODUCT MANAGER @ RESHUFFLE"
    name: str = "YASH RAJ RATHI"
    hook: str = "I build products that turn ambiguity into traction."
    tagline: str = "Currently scaling Reshuffle — a workplace where culture, hiring, and execution finally speak the same language."
    location: str = "Bengaluru, India"
    available: str = "Open to Senior PM roles · 2026"


class AboutSection(BaseModel):
    label: str = "THE MINDSET"
    paragraphs: List[str] = [
        "I'm a product manager who lives in the space between a messy user problem and a clear, shippable bet. I obsess about the 'why' before the 'what', and I'm allergic to roadmaps that confuse motion with progress.",
        "At Reshuffle, I lead 0→1 product bets that compound: faster hiring loops, sharper internal tools, and surfaces that make the right action the obvious action. My playbook is research-led, metric-honest, and design-respectful.",
        "I think in problem statements, narrate in stories, and ship in increments. If a feature can't be drawn on a napkin, it's not ready for engineering.",
    ]
    highlights: List[str] = ["Research-led", "0→1 thinking", "Design-respectful", "Metric-honest"]


class SkillGroup(BaseModel):
    category: str
    items: List[str]


class SkillsSection(BaseModel):
    groups: List[SkillGroup] = [
        SkillGroup(category="Product Craft", items=["Discovery", "Roadmapping", "Prioritization", "JTBD", "User Research", "A/B Testing"]),
        SkillGroup(category="Execution", items=["Agile / Scrum", "Sprint Planning", "PRDs", "Stakeholder Alignment", "Release Mgmt"]),
        SkillGroup(category="Analytics", items=["SQL", "Mixpanel", "Amplitude", "GA4", "Looker", "Excel Models"]),
        SkillGroup(category="Design & Build", items=["Figma", "Notion", "Linear", "Whimsical", "Webflow", "Prompting LLMs"]),
    ]


class ContactSection(BaseModel):
    email: str = "rathiyash12@gmail.com"
    linkedin: str = "https://linkedin.com/in/yashrajrathi"
    twitter: str = "https://x.com/yashrajrathi"
    location: str = "Bengaluru, India"
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
            role="Product Manager",
            company="Reshuffle",
            duration="2024 — Present",
            location="Bengaluru",
            bullets=[
                "Own the candidate-experience surface from outreach → offer; lifted application completion by 38%.",
                "Built the internal interview-ops tool that cut recruiter cycle time from 11 days to 4.",
                "Run weekly product reviews with founders; translated qualitative insights into 6 shipped bets in two quarters.",
            ],
        ),
        Experience(
            role="Associate Product Manager",
            company="Prev Co.",
            duration="2022 — 2024",
            location="Remote",
            bullets=[
                "Led a payments reconciliation revamp that recovered ₹2.4Cr in stuck settlements per quarter.",
                "Set up the first product analytics stack (Mixpanel + dbt); funnel visibility went from 30% to 95%.",
                "Mentored two interns into APM roles.",
            ],
        ),
        Experience(
            role="Product Intern",
            company="Earlier",
            duration="2021 — 2022",
            location="Hybrid",
            bullets=[
                "Shipped the onboarding redesign that lifted D1 retention by 19%.",
                "Ran the first 30 user interviews that informed the company's 2022 OKRs.",
            ],
        ),
    ]


def default_projects() -> List[Project]:
    return [
        Project(
            title="Cycle Time, Cut in Half",
            summary="Redesigned Reshuffle's recruiter workflow around a single 'next-best-action' surface. Eliminated 7 redundant clicks per candidate.",
            impact="-64% time-to-offer · +38% application completion",
            tags=["0→1", "Internal Tools", "Workflow Design"],
            image_url="https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxNzV8MHwxfHNlYXJjaHwxfHxkYXNoYm9hcmQlMjBVSSUyMGRhdGElMjB2aXN1YWxpemF0aW9uJTIwY2xlYW58ZW58MHx8fHwxNzgwNDc5ODk2fDA&ixlib=rb-4.1.0&q=85",
            role="Lead PM",
            year="2025",
            span="lg",
        ),
        Project(
            title="Signal over Noise",
            summary="Built an analytics layer that turned 14 disconnected dashboards into one weekly executive narrative.",
            impact="14 → 1 dashboards · 95% funnel visibility",
            tags=["Analytics", "Internal", "Data Storytelling"],
            image_url="https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxNzV8MHwxfHNlYXJjaHwzfHxkYXNoYm9hcmQlMjBVSSUyMGRhdGElMjB2aXN1YWxpemF0aW9uJTIwY2xlYW58ZW58MHx8fHwxNzgwNDc5ODk2fDA&ixlib=rb-4.1.0&q=85",
            role="PM + Analyst",
            year="2024",
            span="md",
        ),
        Project(
            title="The Quiet Onboarding",
            summary="Stripped the new-user flow from 9 steps to 3. Replaced the tutorial with progressive disclosure inside the product.",
            impact="+19% D1 retention",
            tags=["Onboarding", "UX", "Activation"],
            image_url="",
            role="APM",
            year="2023",
            span="md",
        ),
        Project(
            title="Recovering ₹2.4Cr a Quarter",
            summary="Reconciliation tooling that surfaced settlement breaks to ops in real time. From spreadsheets to a single source of truth.",
            impact="₹2.4Cr/quarter recovered · 4× faster ops",
            tags=["Payments", "Internal Tools", "B2B"],
            image_url="",
            role="APM",
            year="2023",
            span="sm",
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


@api_router.get("/")
async def root():
    return {"message": "Portfolio API"}


# ---------- Startup ----------
@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.portfolio.create_index("id", unique=True)

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
