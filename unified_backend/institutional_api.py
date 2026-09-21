"""
Folio Institutional API
-----------------------
SQLite-backed FastAPI router providing full CRUD for all institutional entities:
  - Institutions, Students, Companies, Campus Drives, Applications,
    Faculty Interventions, Audit Logs

Mounted at /api/institutional by main.py
No external services required — uses SQLite (institutional.db).
"""

import os
import json
import uuid
from datetime import datetime
from typing import List, Optional, Any, Dict

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy import (
    create_engine, Column, String, Text, Float, Integer,
    Boolean, DateTime, func
)
from sqlalchemy.orm import declarative_base, Session, sessionmaker

# ─── Database Setup ────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "institutional.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ─── ORM Models ───────────────────────────────────────────────────────────────

class InstitutionORM(Base):
    __tablename__ = "institutions"
    id = Column(String, primary_key=True, default=lambda: f"inst-{uuid.uuid4().hex[:8]}")
    name = Column(String, nullable=False)
    campus = Column(String, default="")
    code = Column(String, default="")
    state = Column(String, default="")
    nirf_rank = Column(Integer, nullable=True)
    contact_email = Column(String, default="")
    tpo_name = Column(String, default="")
    tpo_email = Column(String, unique=True, nullable=False)
    tpo_phone = Column(String, default="")
    departments = Column(Text, default="[]")   # JSON list
    total_students = Column(Integer, default=0)
    placement_percentage = Column(Float, default=0.0)
    verified = Column(Boolean, default=False)
    logo = Column(String, default="")
    created_at = Column(DateTime, server_default=func.now())


class CompanyORM(Base):
    __tablename__ = "companies"
    id = Column(String, primary_key=True, default=lambda: f"comp-{uuid.uuid4().hex[:8]}")
    name = Column(String, nullable=False)
    domain = Column(String, default="")
    industry = Column(String, default="")
    cin = Column(String, default="")
    verified = Column(Boolean, default=False)
    verification_status = Column(String, default="pending")   # pending|verified|rejected
    rejection_reason = Column(String, nullable=True)
    target_institution_id = Column(String, nullable=True)
    hr_name = Column(String, default="")
    hr_email = Column(String, unique=True, nullable=False)
    hr_phone = Column(String, default="")
    logo = Column(String, default="")
    headquarters = Column(String, default="")
    target_disciplines = Column(Text, default="[]")           # JSON list
    registered_at = Column(String, default="")
    created_at = Column(DateTime, server_default=func.now())


class StudentORM(Base):
    __tablename__ = "students"
    id = Column(String, primary_key=True, default=lambda: f"stu-{uuid.uuid4().hex[:8]}")
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    roll_no = Column(String, default="")
    institution_id = Column(String, default="inst-default")
    institution_name = Column(String, default="")
    department = Column(String, default="")
    design_discipline = Column(String, default="")
    graduation_year = Column(Integer, default=2026)
    cgpa = Column(Float, default=0.0)
    active_backlogs = Column(Integer, default=0)
    portfolio_url = Column(String, default="")
    portfolio_type = Column(String, default="Personal Website")
    portfolio_score = Column(Integer, default=0)
    assessment_score = Column(Integer, default=0)
    career_readiness = Column(Integer, default=0)
    skills = Column(Text, default="[]")           # JSON list
    tools = Column(Text, default="[]")            # JSON list
    avatar = Column(String, default="")
    placement_status = Column(String, default="Unplaced")     # Unplaced|In Process|Shortlisted|Placed
    placed_company = Column(String, nullable=True)
    placed_package_lpa = Column(Float, nullable=True)
    portfolio_report = Column(Text, default="{}")  # JSON
    assessment_report = Column(Text, default="{}") # JSON
    created_at = Column(DateTime, server_default=func.now())


class DriveORM(Base):
    __tablename__ = "drives"
    id = Column(String, primary_key=True, default=lambda: f"drv-{uuid.uuid4().hex[:8]}")
    company_id = Column(String, nullable=False)
    company_name = Column(String, default="")
    company_logo = Column(String, default="")
    role_title = Column(String, nullable=False)
    design_discipline = Column(String, default="")
    job_type = Column(String, default="Full-Time FTE")
    package_lpa = Column(String, default="")
    location = Column(String, default="")
    application_deadline = Column(String, default="")
    drive_date = Column(String, default="")
    eligibility = Column(Text, default="{}")      # JSON
    approved_institution_ids = Column(Text, default="[]")  # JSON list
    status = Column(String, default="Active")
    description = Column(Text, default="")
    openings = Column(Integer, default=1)
    rounds = Column(Text, default="[]")           # JSON list
    created_at = Column(String, default="")


class ApplicationORM(Base):
    __tablename__ = "applications"
    id = Column(String, primary_key=True, default=lambda: f"app-{uuid.uuid4().hex[:8]}")
    drive_id = Column(String, nullable=False)
    student_id = Column(String, nullable=False)
    student_name = Column(String, default="")
    student_email = Column(String, default="")
    student_roll_no = Column(String, default="")
    institution_id = Column(String, default="")
    institution_name = Column(String, default="")
    department = Column(String, default="")
    design_discipline = Column(String, default="")
    cgpa = Column(Float, default=0.0)
    portfolio_url = Column(String, default="")
    portfolio_score = Column(Integer, default=0)
    career_readiness = Column(Integer, default=0)
    skills = Column(Text, default="[]")
    applied_at = Column(String, default="")
    current_round_index = Column(Integer, default=0)
    status = Column(String, default="Applied")    # Applied|Under Review|In Rounds|Shortlisted|Offered|Rejected
    round_evaluations = Column(Text, default="[]")  # JSON list
    match_score = Column(Integer, default=0)
    offer_details = Column(Text, default="{}")    # JSON


class InterventionORM(Base):
    __tablename__ = "interventions"
    id = Column(String, primary_key=True, default=lambda: f"intv-{uuid.uuid4().hex[:8]}")
    faculty_id = Column(String, default="")
    faculty_name = Column(String, default="")
    student_id = Column(String, nullable=False)
    student_name = Column(String, default="")
    student_roll_no = Column(String, default="")
    department = Column(String, default="")
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    priority = Column(String, default="Medium")   # High|Medium|Low
    status = Column(String, default="Pending")    # Pending|In Progress|Completed
    created_at = Column(String, default="")
    due_date = Column(String, default="")
    feedback = Column(Text, nullable=True)


class AuditLogORM(Base):
    __tablename__ = "audit_logs"
    id = Column(String, primary_key=True, default=lambda: f"log-{uuid.uuid4().hex[:8]}")
    timestamp = Column(String, default="")
    actor = Column(String, default="SYSTEM")
    action = Column(String, default="")
    details = Column(Text, default="")
    category = Column(String, default="COMPLIANCE")  # VERIFICATION|DRIVE|ROUND_ENGINE|APPLICATION|FACULTY_TASK|COMPLIANCE


# Create all tables
Base.metadata.create_all(bind=engine)


# ─── Pydantic Schemas ─────────────────────────────────────────────────────────

class InstitutionCreate(BaseModel):
    name: str
    campus: str = ""
    code: str = ""
    state: str = ""
    nirf_rank: Optional[int] = None
    contact_email: str = ""
    tpo_name: str
    tpo_email: str
    tpo_phone: str = ""
    departments: List[str] = []
    total_students: int = 0
    placement_percentage: float = 0.0
    logo: str = ""

class CompanyCreate(BaseModel):
    name: str
    domain: str = ""
    industry: str = ""
    cin: str = ""
    target_institution_id: Optional[str] = None
    hr_name: str
    hr_email: str
    hr_phone: str = ""
    headquarters: str = ""
    target_disciplines: List[str] = []

class CompanyVerify(BaseModel):
    status: str   # verified | rejected
    reason: Optional[str] = None

class StudentCreate(BaseModel):
    name: str
    email: str
    roll_no: str = ""
    institution_id: str = "inst-default"
    institution_name: str = ""
    department: str = ""
    design_discipline: str = ""
    graduation_year: int = 2026
    cgpa: float = 0.0
    active_backlogs: int = 0
    portfolio_url: str = ""
    portfolio_type: str = "Personal Website"
    skills: List[str] = []
    tools: List[str] = []

class StudentPortfolioUpdate(BaseModel):
    portfolio_report: Dict[str, Any]
    portfolio_score: int
    assessment_score: Optional[int] = None
    career_readiness: Optional[int] = None

class DriveCreate(BaseModel):
    company_id: str
    company_name: str
    company_logo: str = ""
    role_title: str
    design_discipline: str = ""
    job_type: str = "Full-Time FTE"
    package_lpa: str = ""
    location: str = ""
    application_deadline: str = ""
    drive_date: str = ""
    eligibility: Dict[str, Any] = {}
    approved_institution_ids: List[str] = []
    status: str = "Active"
    description: str = ""
    openings: int = 1
    rounds: List[Dict[str, Any]] = []

class DriveApprove(BaseModel):
    institution_id: str

class ApplicationCreate(BaseModel):
    drive_id: str
    student_id: str

class RoundAdvance(BaseModel):
    next_round_index: int
    score: Optional[int] = None
    feedback: Optional[str] = None

class CandidateReject(BaseModel):
    reason: str

class OfferDetails(BaseModel):
    package_lpa: str
    role_title: str
    joining_date: str
    acceptance_deadline: str

class InterventionCreate(BaseModel):
    student_id: str
    title: str
    description: str = ""
    priority: str = "Medium"
    due_date: str = ""

class AuditLogCreate(BaseModel):
    actor: str
    action: str
    details: str
    category: str = "COMPLIANCE"


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _json_load(val: Any, default=None):
    if default is None:
        default = {}
    if not val:
        return default
    try:
        return json.loads(val)
    except Exception:
        return default

def _now_str():
    return datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

def _today():
    return datetime.utcnow().strftime("%Y-%m-%d")

def _inst_to_dict(i: InstitutionORM) -> dict:
    return {
        "id": i.id, "name": i.name, "campus": i.campus, "code": i.code,
        "state": i.state, "nirfRank": i.nirf_rank, "contactEmail": i.contact_email,
        "tpoName": i.tpo_name, "tpoEmail": i.tpo_email, "tpoPhone": i.tpo_phone,
        "departments": _json_load(i.departments, []),
        "totalStudents": i.total_students,
        "placementPercentage": i.placement_percentage,
        "verified": i.verified, "logo": i.logo or ""
    }

def _comp_to_dict(c: CompanyORM) -> dict:
    return {
        "id": c.id, "name": c.name, "domain": c.domain, "industry": c.industry,
        "cin": c.cin, "verified": c.verified, "verificationStatus": c.verification_status,
        "rejectionReason": c.rejection_reason,
        "targetInstitutionId": c.target_institution_id,
        "hrName": c.hr_name, "hrEmail": c.hr_email, "hrPhone": c.hr_phone,
        "logo": c.logo or "", "headquarters": c.headquarters,
        "targetDisciplines": _json_load(c.target_disciplines, []),
        "registeredAt": c.registered_at
    }

def _stu_to_dict(s: StudentORM) -> dict:
    return {
        "id": s.id, "name": s.name, "email": s.email, "rollNo": s.roll_no,
        "institutionId": s.institution_id, "institutionName": s.institution_name,
        "department": s.department, "designDiscipline": s.design_discipline,
        "graduationYear": s.graduation_year, "cgpa": s.cgpa,
        "activeBacklogs": s.active_backlogs, "portfolioUrl": s.portfolio_url,
        "portfolioType": s.portfolio_type, "portfolioScore": s.portfolio_score,
        "assessmentScore": s.assessment_score, "careerReadiness": s.career_readiness,
        "skills": _json_load(s.skills, []), "tools": _json_load(s.tools, []),
        "avatar": s.avatar or "", "placementStatus": s.placement_status,
        "placedCompany": s.placed_company, "placedPackageLpa": s.placed_package_lpa,
        "portfolioReport": _json_load(s.portfolio_report, {}),
        "assessmentReport": _json_load(s.assessment_report, {})
    }

def _drive_to_dict(d: DriveORM) -> dict:
    return {
        "id": d.id, "companyId": d.company_id, "companyName": d.company_name,
        "companyLogo": d.company_logo or "", "roleTitle": d.role_title,
        "designDiscipline": d.design_discipline, "jobType": d.job_type,
        "packageLpa": d.package_lpa, "location": d.location,
        "applicationDeadline": d.application_deadline, "driveDate": d.drive_date,
        "eligibility": _json_load(d.eligibility, {}),
        "approvedInstitutionIds": _json_load(d.approved_institution_ids, []),
        "status": d.status, "description": d.description,
        "openings": d.openings, "rounds": _json_load(d.rounds, []),
        "createdAt": d.created_at
    }

def _app_to_dict(a: ApplicationORM) -> dict:
    return {
        "id": a.id, "driveId": a.drive_id, "studentId": a.student_id,
        "studentName": a.student_name, "studentEmail": a.student_email,
        "studentRollNo": a.student_roll_no, "institutionId": a.institution_id,
        "institutionName": a.institution_name, "department": a.department,
        "designDiscipline": a.design_discipline, "cgpa": a.cgpa,
        "portfolioUrl": a.portfolio_url, "portfolioScore": a.portfolio_score,
        "careerReadiness": a.career_readiness,
        "skills": _json_load(a.skills, []),
        "appliedAt": a.applied_at, "currentRoundIndex": a.current_round_index,
        "status": a.status, "roundEvaluations": _json_load(a.round_evaluations, []),
        "matchScore": a.match_score, "offerDetails": _json_load(a.offer_details, {})
    }

def _intv_to_dict(i: InterventionORM) -> dict:
    return {
        "id": i.id, "facultyId": i.faculty_id, "facultyName": i.faculty_name,
        "studentId": i.student_id, "studentName": i.student_name,
        "studentRollNo": i.student_roll_no, "department": i.department,
        "title": i.title, "description": i.description,
        "priority": i.priority, "status": i.status,
        "createdAt": i.created_at, "dueDate": i.due_date, "feedback": i.feedback
    }

def _log_to_dict(l: AuditLogORM) -> dict:
    return {
        "id": l.id, "timestamp": l.timestamp, "actor": l.actor,
        "action": l.action, "details": l.details, "category": l.category
    }

def _add_log(db: Session, actor: str, action: str, details: str, category: str = "COMPLIANCE"):
    log = AuditLogORM(
        id=f"log-{uuid.uuid4().hex[:8]}",
        timestamp=_now_str(),
        actor=actor,
        action=action,
        details=details,
        category=category
    )
    db.add(log)
    db.commit()


# ─── Router ───────────────────────────────────────────────────────────────────

router = APIRouter()


# ── Institutions ──────────────────────────────────────────────────────────────

@router.get("/institutions")
def list_institutions(db: Session = Depends(get_db)):
    return [_inst_to_dict(i) for i in db.query(InstitutionORM).all()]

@router.post("/institutions", status_code=201)
def create_institution(data: InstitutionCreate, db: Session = Depends(get_db)):
    existing = db.query(InstitutionORM).filter(InstitutionORM.tpo_email == data.tpo_email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Institution with this TPO email already exists.")
    inst = InstitutionORM(
        id=f"inst-{uuid.uuid4().hex[:8]}",
        name=data.name, campus=data.campus, code=data.code,
        state=data.state, nirf_rank=data.nirf_rank,
        contact_email=data.contact_email, tpo_name=data.tpo_name,
        tpo_email=data.tpo_email, tpo_phone=data.tpo_phone,
        departments=json.dumps(data.departments),
        total_students=data.total_students,
        placement_percentage=data.placement_percentage,
        verified=True, logo=data.logo
    )
    db.add(inst)
    db.commit()
    _add_log(db, data.tpo_name, "INSTITUTION_REGISTERED", f"Institution '{data.name}' registered.", "COMPLIANCE")
    return _inst_to_dict(inst)

@router.get("/institutions/{inst_id}")
def get_institution(inst_id: str, db: Session = Depends(get_db)):
    inst = db.query(InstitutionORM).filter(InstitutionORM.id == inst_id).first()
    if not inst:
        raise HTTPException(404, "Institution not found.")
    return _inst_to_dict(inst)


# ── Companies ─────────────────────────────────────────────────────────────────

@router.get("/companies")
def list_companies(db: Session = Depends(get_db)):
    return [_comp_to_dict(c) for c in db.query(CompanyORM).all()]

@router.post("/companies", status_code=201)
def create_company(data: CompanyCreate, db: Session = Depends(get_db)):
    existing = db.query(CompanyORM).filter(CompanyORM.hr_email == data.hr_email).first()
    if existing:
        raise HTTPException(409, "A company with this HR email is already registered.")
    comp = CompanyORM(
        id=f"comp-{uuid.uuid4().hex[:8]}",
        name=data.name, domain=data.domain, industry=data.industry,
        cin=data.cin, verified=False, verification_status="pending",
        target_institution_id=data.target_institution_id,
        hr_name=data.hr_name, hr_email=data.hr_email, hr_phone=data.hr_phone,
        logo="", headquarters=data.headquarters,
        target_disciplines=json.dumps(data.target_disciplines),
        registered_at=_today()
    )
    db.add(comp)
    db.commit()
    _add_log(db, data.hr_name, "COMPANY_REGISTRATION_SUBMITTED",
             f"'{data.name}' registered. Pending TPO verification.", "VERIFICATION")
    return _comp_to_dict(comp)

@router.get("/companies/{comp_id}")
def get_company(comp_id: str, db: Session = Depends(get_db)):
    comp = db.query(CompanyORM).filter(CompanyORM.id == comp_id).first()
    if not comp:
        raise HTTPException(404, "Company not found.")
    return _comp_to_dict(comp)

@router.patch("/companies/{comp_id}/verify")
def verify_company(comp_id: str, data: CompanyVerify, db: Session = Depends(get_db)):
    comp = db.query(CompanyORM).filter(CompanyORM.id == comp_id).first()
    if not comp:
        raise HTTPException(404, "Company not found.")
    comp.verified = (data.status == "verified")
    comp.verification_status = data.status
    comp.rejection_reason = data.reason
    db.commit()
    action = "COMPANY_VERIFICATION_APPROVED" if data.status == "verified" else "COMPANY_VERIFICATION_REJECTED"
    _add_log(db, "TPO", action, f"'{comp.name}' {data.status}. Reason: {data.reason or 'N/A'}", "VERIFICATION")
    return _comp_to_dict(comp)


# ── Students ──────────────────────────────────────────────────────────────────

@router.get("/students")
def list_students(institution_id: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(StudentORM)
    if institution_id:
        q = q.filter(StudentORM.institution_id == institution_id)
    return [_stu_to_dict(s) for s in q.all()]

@router.post("/students", status_code=201)
def create_student(data: StudentCreate, db: Session = Depends(get_db)):
    existing = db.query(StudentORM).filter(StudentORM.email == data.email).first()
    if existing:
        raise HTTPException(409, "A student with this email already exists.")
    
    # Derive roll number if blank
    roll_no = data.roll_no or f"INST{data.graduation_year % 100}{uuid.uuid4().hex[:6].upper()}"
    # Initial scores
    portfolio_score = 0
    assessment_score = 0
    career_readiness = 0
    
    empty_portfolio = {
        "score": 0, "visualHierarchy": 0, "uxResearch": 0,
        "typography": 0, "designSystems": 0, "toolsProficiency": 0,
        "strengths": [], "weaknesses": ["Portfolio not yet analyzed."],
        "detectedTools": [], "projects": [], "lastAnalyzedAt": ""
    }
    empty_assessment = {
        "overallScore": 0, "quizScore": 0, "challengeScore": 0,
        "interviewScore": 0, "knowledge": 0, "problemSolving": 0,
        "creativity": 0, "execution": 0, "communication": 0
    }
    
    stu = StudentORM(
        id=f"stu-{uuid.uuid4().hex[:8]}",
        name=data.name, email=data.email, roll_no=roll_no,
        institution_id=data.institution_id, institution_name=data.institution_name,
        department=data.department, design_discipline=data.design_discipline,
        graduation_year=data.graduation_year, cgpa=data.cgpa,
        active_backlogs=data.active_backlogs,
        portfolio_url=data.portfolio_url, portfolio_type=data.portfolio_type,
        portfolio_score=portfolio_score, assessment_score=assessment_score,
        career_readiness=career_readiness,
        skills=json.dumps(data.skills), tools=json.dumps(data.tools),
        avatar="", placement_status="Unplaced",
        portfolio_report=json.dumps(empty_portfolio),
        assessment_report=json.dumps(empty_assessment)
    )
    db.add(stu)
    db.commit()
    _add_log(db, data.name, "STUDENT_REGISTRATION", f"Student '{data.name}' ({roll_no}) enrolled.", "COMPLIANCE")
    return _stu_to_dict(stu)

@router.get("/students/{stu_id}")
def get_student(stu_id: str, db: Session = Depends(get_db)):
    stu = db.query(StudentORM).filter(StudentORM.id == stu_id).first()
    if not stu:
        raise HTTPException(404, "Student not found.")
    return _stu_to_dict(stu)

@router.patch("/students/{stu_id}/portfolio")
def update_student_portfolio(stu_id: str, data: StudentPortfolioUpdate, db: Session = Depends(get_db)):
    stu = db.query(StudentORM).filter(StudentORM.id == stu_id).first()
    if not stu:
        raise HTTPException(404, "Student not found.")
    stu.portfolio_report = json.dumps(data.portfolio_report)
    stu.portfolio_score = data.portfolio_score
    if data.assessment_score is not None:
        stu.assessment_score = data.assessment_score
    if data.career_readiness is not None:
        stu.career_readiness = data.career_readiness
    db.commit()
    return _stu_to_dict(stu)

@router.patch("/students/{stu_id}/placement")
def update_placement_status(stu_id: str, body: dict, db: Session = Depends(get_db)):
    stu = db.query(StudentORM).filter(StudentORM.id == stu_id).first()
    if not stu:
        raise HTTPException(404, "Student not found.")
    stu.placement_status = body.get("placementStatus", stu.placement_status)
    stu.placed_company = body.get("placedCompany")
    stu.placed_package_lpa = body.get("placedPackageLpa")
    db.commit()
    return _stu_to_dict(stu)


# ── Campus Drives ─────────────────────────────────────────────────────────────

@router.get("/drives")
def list_drives(db: Session = Depends(get_db)):
    return [_drive_to_dict(d) for d in db.query(DriveORM).all()]

@router.post("/drives", status_code=201)
def create_drive(data: DriveCreate, db: Session = Depends(get_db)):
    drive = DriveORM(
        id=f"drv-{uuid.uuid4().hex[:8]}",
        company_id=data.company_id, company_name=data.company_name,
        company_logo=data.company_logo, role_title=data.role_title,
        design_discipline=data.design_discipline, job_type=data.job_type,
        package_lpa=data.package_lpa, location=data.location,
        application_deadline=data.application_deadline, drive_date=data.drive_date,
        eligibility=json.dumps(data.eligibility),
        approved_institution_ids=json.dumps(data.approved_institution_ids),
        status=data.status, description=data.description,
        openings=data.openings, rounds=json.dumps(data.rounds),
        created_at=_today()
    )
    db.add(drive)
    db.commit()
    _add_log(db, data.company_name, "CAMPUS_DRIVE_CREATED",
             f"Drive '{data.role_title}' created by {data.company_name}.", "DRIVE")
    return _drive_to_dict(drive)

@router.get("/drives/{drive_id}")
def get_drive(drive_id: str, db: Session = Depends(get_db)):
    d = db.query(DriveORM).filter(DriveORM.id == drive_id).first()
    if not d:
        raise HTTPException(404, "Drive not found.")
    return _drive_to_dict(d)

@router.post("/drives/{drive_id}/approve")
def approve_drive(drive_id: str, data: DriveApprove, db: Session = Depends(get_db)):
    d = db.query(DriveORM).filter(DriveORM.id == drive_id).first()
    if not d:
        raise HTTPException(404, "Drive not found.")
    approved = _json_load(d.approved_institution_ids, [])
    if data.institution_id not in approved:
        approved.append(data.institution_id)
        d.approved_institution_ids = json.dumps(approved)
        db.commit()
    _add_log(db, "TPO", "CAMPUS_DRIVE_APPROVED",
             f"Drive '{d.role_title}' approved for institution {data.institution_id}.", "DRIVE")
    return _drive_to_dict(d)

@router.patch("/drives/{drive_id}/rounds")
def update_drive_rounds(drive_id: str, body: dict, db: Session = Depends(get_db)):
    d = db.query(DriveORM).filter(DriveORM.id == drive_id).first()
    if not d:
        raise HTTPException(404, "Drive not found.")
    d.rounds = json.dumps(body.get("rounds", []))
    db.commit()
    _add_log(db, "RECRUITER", "DRIVE_ROUNDS_UPDATED", f"Rounds updated for drive {drive_id}.", "ROUND_ENGINE")
    return _drive_to_dict(d)


# ── Applications ──────────────────────────────────────────────────────────────

@router.get("/applications")
def list_applications(drive_id: Optional[str] = None, student_id: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(ApplicationORM)
    if drive_id:
        q = q.filter(ApplicationORM.drive_id == drive_id)
    if student_id:
        q = q.filter(ApplicationORM.student_id == student_id)
    return [_app_to_dict(a) for a in q.all()]

@router.post("/applications", status_code=201)
def apply_to_drive(data: ApplicationCreate, db: Session = Depends(get_db)):
    # Check duplicate
    existing = db.query(ApplicationORM).filter(
        ApplicationORM.drive_id == data.drive_id,
        ApplicationORM.student_id == data.student_id
    ).first()
    if existing:
        raise HTTPException(409, "Student has already applied to this drive.")
    
    # Fetch student
    stu = db.query(StudentORM).filter(StudentORM.id == data.student_id).first()
    if not stu:
        raise HTTPException(404, "Student not found.")
    
    # Fetch drive
    drv = db.query(DriveORM).filter(DriveORM.id == data.drive_id).first()
    if not drv:
        raise HTTPException(404, "Drive not found.")
    
    # Check approval
    approved_ids = _json_load(drv.approved_institution_ids, [])
    if stu.institution_id not in approved_ids:
        raise HTTPException(403, "This drive has not been approved for your institution by the Placement Cell.")
    
    # Eligibility check
    eligibility = _json_load(drv.eligibility, {})
    if stu.portfolio_score < eligibility.get("minPortfolioScore", 0):
        raise HTTPException(422, f"Portfolio score {stu.portfolio_score} below minimum {eligibility.get('minPortfolioScore')}.")
    if stu.cgpa < eligibility.get("minCgpa", 0):
        raise HTTPException(422, f"CGPA {stu.cgpa} below minimum {eligibility.get('minCgpa')}.")
    
    # Check allowed departments
    allowed_depts = eligibility.get("allowedDepartments", [])
    if allowed_depts and stu.department not in allowed_depts:
        raise HTTPException(422, f"Your department '{stu.department}' is not eligible for this drive.")

    # Build initial round evaluations
    rounds = _json_load(drv.rounds, [])
    initial_eval = []
    if rounds:
        initial_eval.append({
            "roundId": rounds[0].get("id", ""),
            "roundName": rounds[0].get("name", "Round 1"),
            "roundType": rounds[0].get("type", "Screening"),
            "status": "Pending"
        })
    
    # Match score
    stu_skills = set(s.lower() for s in _json_load(stu.skills, []))
    req_skills = [s.lower() for s in eligibility.get("requiredSkills", [])]
    match_score = int((sum(1 for s in req_skills if s in stu_skills) / max(len(req_skills), 1)) * 100) if req_skills else 75
    
    app = ApplicationORM(
        id=f"app-{uuid.uuid4().hex[:8]}",
        drive_id=data.drive_id, student_id=data.student_id,
        student_name=stu.name, student_email=stu.email, student_roll_no=stu.roll_no,
        institution_id=stu.institution_id, institution_name=stu.institution_name,
        department=stu.department, design_discipline=stu.design_discipline,
        cgpa=stu.cgpa, portfolio_url=stu.portfolio_url,
        portfolio_score=stu.portfolio_score, career_readiness=stu.career_readiness,
        skills=stu.skills, applied_at=_today(),
        current_round_index=0, status="Applied",
        round_evaluations=json.dumps(initial_eval),
        match_score=match_score, offer_details="{}"
    )
    db.add(app)
    # Update student status
    stu.placement_status = "In Process"
    db.commit()
    _add_log(db, stu.name, "STUDENT_APPLICATION",
             f"'{stu.name}' applied to drive '{drv.role_title}' by {drv.company_name}.", "APPLICATION")
    return _app_to_dict(app)

@router.patch("/applications/{app_id}/advance")
def advance_round(app_id: str, data: RoundAdvance, db: Session = Depends(get_db)):
    app = db.query(ApplicationORM).filter(ApplicationORM.id == app_id).first()
    if not app:
        raise HTTPException(404, "Application not found.")
    
    drv = db.query(DriveORM).filter(DriveORM.id == app.drive_id).first()
    rounds = _json_load(drv.rounds, []) if drv else []
    is_final = data.next_round_index >= len(rounds)
    
    evals = _json_load(app.round_evaluations, [])
    if app.current_round_index < len(evals):
        evals[app.current_round_index].update({
            "status": "Passed",
            "score": data.score or 85,
            "evaluatorNotes": data.feedback or "Advanced to next stage.",
            "evaluatedAt": _today()
        })
    
    if not is_final and data.next_round_index < len(rounds):
        next_round = rounds[data.next_round_index]
        if len(evals) <= data.next_round_index:
            evals.append({
                "roundId": next_round.get("id", ""),
                "roundName": next_round.get("name", f"Round {data.next_round_index+1}"),
                "roundType": next_round.get("type", "Interview"),
                "status": "Pending"
            })
    
    app.current_round_index = data.next_round_index
    app.status = "Shortlisted" if is_final else "In Rounds"
    app.round_evaluations = json.dumps(evals)
    db.commit()
    
    stu_name = app.student_name
    _add_log(db, "RECRUITER", "PLACEMENT_ROUND_ADVANCED",
             f"{stu_name} advanced to Round {data.next_round_index+1}.", "ROUND_ENGINE")
    return _app_to_dict(app)

@router.patch("/applications/{app_id}/reject")
def reject_candidate(app_id: str, data: CandidateReject, db: Session = Depends(get_db)):
    app = db.query(ApplicationORM).filter(ApplicationORM.id == app_id).first()
    if not app:
        raise HTTPException(404, "Application not found.")
    
    evals = _json_load(app.round_evaluations, [])
    if app.current_round_index < len(evals):
        evals[app.current_round_index].update({
            "status": "Failed", "evaluatorNotes": data.reason, "evaluatedAt": _today()
        })
    
    app.status = "Rejected"
    app.round_evaluations = json.dumps(evals)
    db.commit()
    _add_log(db, "RECRUITER", "CANDIDATE_REJECTED",
             f"{app.student_name} disqualified. Note: {data.reason}", "ROUND_ENGINE")
    return _app_to_dict(app)

@router.patch("/applications/{app_id}/offer")
def extend_offer(app_id: str, data: OfferDetails, db: Session = Depends(get_db)):
    app = db.query(ApplicationORM).filter(ApplicationORM.id == app_id).first()
    if not app:
        raise HTTPException(404, "Application not found.")
    
    offer = {
        "packageLpa": data.package_lpa,
        "roleTitle": data.role_title,
        "joiningDate": data.joining_date,
        "acceptanceDeadline": data.acceptance_deadline
    }
    app.status = "Offered"
    app.offer_details = json.dumps(offer)
    db.commit()
    
    # Update student placement status
    stu = db.query(StudentORM).filter(StudentORM.id == app.student_id).first()
    if stu:
        stu.placement_status = "Placed"
        try:
            stu.placed_package_lpa = float(data.package_lpa.replace("LPA", "").strip())
        except Exception:
            pass
        stu.placed_company = app.student_name  # recruiter company name tracked via drive
        db.commit()
    
    _add_log(db, "RECRUITER", "OFFICIAL_OFFER_EXTENDED",
             f"Offer extended to {app.student_name} for {data.role_title} @ {data.package_lpa}.", "APPLICATION")
    return _app_to_dict(app)


# ── Faculty Interventions ─────────────────────────────────────────────────────

@router.get("/interventions")
def list_interventions(student_id: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(InterventionORM)
    if student_id:
        q = q.filter(InterventionORM.student_id == student_id)
    return [_intv_to_dict(i) for i in q.all()]

@router.post("/interventions", status_code=201)
def create_intervention(data: InterventionCreate, actor_name: str = "Faculty", actor_id: str = "fac-system", db: Session = Depends(get_db)):
    stu = db.query(StudentORM).filter(StudentORM.id == data.student_id).first()
    intv = InterventionORM(
        id=f"intv-{uuid.uuid4().hex[:8]}",
        faculty_id=actor_id, faculty_name=actor_name,
        student_id=data.student_id,
        student_name=stu.name if stu else "",
        student_roll_no=stu.roll_no if stu else "",
        department=stu.department if stu else "",
        title=data.title, description=data.description,
        priority=data.priority, status="Pending",
        created_at=_today(), due_date=data.due_date
    )
    db.add(intv)
    db.commit()
    _add_log(db, actor_name, "FACULTY_INTERVENTION_ASSIGNED",
             f"Task '{data.title}' assigned to student {data.student_id}.", "FACULTY_TASK")
    return _intv_to_dict(intv)

@router.patch("/interventions/{intv_id}/complete")
def complete_intervention(intv_id: str, db: Session = Depends(get_db)):
    intv = db.query(InterventionORM).filter(InterventionORM.id == intv_id).first()
    if not intv:
        raise HTTPException(404, "Intervention not found.")
    intv.status = "Completed"
    db.commit()
    return _intv_to_dict(intv)


# ── Audit Logs ────────────────────────────────────────────────────────────────

@router.get("/audit-logs")
def list_audit_logs(limit: int = 100, db: Session = Depends(get_db)):
    logs = db.query(AuditLogORM).order_by(AuditLogORM.timestamp.desc()).limit(limit).all()
    return [_log_to_dict(l) for l in logs]

@router.post("/audit-logs", status_code=201)
def create_audit_log(data: AuditLogCreate, db: Session = Depends(get_db)):
    log = AuditLogORM(
        id=f"log-{uuid.uuid4().hex[:8]}",
        timestamp=_now_str(),
        actor=data.actor, action=data.action,
        details=data.details, category=data.category
    )
    db.add(log)
    db.commit()
    return _log_to_dict(log)


# ── Health ────────────────────────────────────────────────────────────────────

@router.get("/health")
def institutional_health(db: Session = Depends(get_db)):
    counts = {
        "institutions": db.query(InstitutionORM).count(),
        "companies": db.query(CompanyORM).count(),
        "students": db.query(StudentORM).count(),
        "drives": db.query(DriveORM).count(),
        "applications": db.query(ApplicationORM).count(),
        "interventions": db.query(InterventionORM).count(),
        "audit_logs": db.query(AuditLogORM).count()
    }
    return {"status": "healthy", "db": "SQLite", "counts": counts}
