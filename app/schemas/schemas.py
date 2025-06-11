from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List, Dict, Any
from datetime import datetime

# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# Existing schemas
class HealthCheck(BaseModel):
    status: str
    timestamp: datetime
    environment: str

class ErrorResponse(BaseModel):
    detail: str
    status_code: int
    timestamp: datetime

# Customer schemas
class CustomerCreate(BaseModel):
    company_name: str
    email: EmailStr
    website: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None

class CustomerResponse(BaseModel):
    id: str
    company_name: str
    email: str
    subscription_plan: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# User schemas
class UserCreate(BaseModel):
    customer_id: str
    email: EmailStr
    name: str
    role: str = "recruiter"

class UserResponse(BaseModel):
    id: str
    customer_id: str
    email: str
    name: str
    role: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Question schemas for jobs
class JobQuestionCreate(BaseModel):
    question: str
    ideal_answer: str
    weight: float = 1.0
    
    @validator('question')
    def question_not_empty(cls, v):
        assert len(v.strip()) > 0, 'Question cannot be empty'
        return v.strip()
    
    @validator('ideal_answer')
    def ideal_answer_not_empty(cls, v):
        assert len(v.strip()) > 0, 'Ideal answer cannot be empty'
        return v.strip()

class JobQuestionResponse(BaseModel):
    question: str
    ideal_answer: str
    weight: float

# Salary range schema
class SalaryRangeCreate(BaseModel):
    min_salary: Optional[int] = None
    max_salary: Optional[int] = None
    currency: str = "USD"

class SalaryRangeResponse(BaseModel):
    min_salary: Optional[int]
    max_salary: Optional[int]
    currency: str

# Job schemas
class JobCreate(BaseModel):
    title: str
    description: str
    requirements: List[str] = []
    location: str
    job_type: str = "full_time"
    experience_level: Optional[str] = None
    remote_allowed: bool = False
    questions: List[JobQuestionCreate] = []
    salary_range: Optional[SalaryRangeCreate] = None
    department: Optional[str] = None
    application_deadline: Optional[datetime] = None
    
    @validator('title')
    def title_not_empty(cls, v):
        assert len(v.strip()) > 0, 'Title cannot be empty'
        return v.strip()

class JobResponse(BaseModel):
    id: str
    customer_id: str
    title: str
    description: str
    requirements: List[str]
    location: str
    job_type: str
    status: str
    created_at: datetime
    view_count: int
    application_count: int
    questions: List[JobQuestionResponse] = []
    salary_range: Optional[SalaryRangeResponse] = None
    department: Optional[str] = None
    experience_level: Optional[str] = None
    remote_allowed: bool = False
    application_deadline: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Candidate QA schemas
class QuestionAnswerCreate(BaseModel):
    question: str
    answer: str
    ideal_answer: Optional[str] = None
    score: Optional[float] = None
    analysis: Optional[str] = None

class QuestionAnswerResponse(BaseModel):
    question: str
    answer: str
    ideal_answer: Optional[str]
    score: Optional[float]
    analysis: Optional[str]

class CallQACreate(BaseModel):
    call_id: Optional[str] = None
    call_date: Optional[datetime] = None
    questions_answers: List[QuestionAnswerCreate] = []
    overall_score: Optional[float] = None
    interview_summary: Optional[str] = None
    call_duration_minutes: Optional[int] = None

class CallQAResponse(BaseModel):
    call_id: Optional[str]
    call_date: Optional[datetime]
    questions_answers: List[QuestionAnswerResponse]
    overall_score: Optional[float]
    interview_summary: Optional[str]
    call_duration_minutes: Optional[int]

class JobApplicationCreate(BaseModel):
    job_id: str
    matching_score: float = 0.0
    notes: Optional[str] = None
    call_qa: Optional[CallQACreate] = None

class JobApplicationResponse(BaseModel):
    job_id: str
    application_date: datetime
    status: str
    matching_score: float
    notes: Optional[str]
    call_qa: Optional[CallQAResponse]

class PersonalInfoCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    location: Optional[str] = None

class ResumeAnalysisCreate(BaseModel):
    skills: List[str] = []
    experience_years: int = 0
    education: Optional[str] = None
    previous_roles: List[str] = []
    matching_score: float = 0.0
    analysis_summary: str = ""
    resume_file_path: Optional[str] = None

class CandidateCreate(BaseModel):
    personal_info: PersonalInfoCreate
    resume_analysis: ResumeAnalysisCreate
    applications: List[JobApplicationCreate] = []

class CandidateResponse(BaseModel):
    id: str
    personal_info: PersonalInfoCreate
    resume_analysis: ResumeAnalysisCreate
    applications: List[JobApplicationResponse]
    total_applications: int
    status: str
    
    class Config:
        from_attributes = True

# Additional response schemas for candidate endpoints
class JobApplicationSuccess(BaseModel):
    status: str
    message: str
    application_details: dict
    next_steps: List[str]

class ApplicationStatusResponse(BaseModel):
    email: str
    total_applications: int
    applications: List[dict]
    summary: dict

class CandidateListResponse(BaseModel):
    candidates: List[CandidateResponse]
    total: int
    page: int
    per_page: int
    has_next: bool

class FileMetadataResponse(BaseModel):
    candidate_id: str
    file_path: str
    file_type: str
    file_size_bytes: int
    original_filename: str
    upload_date: datetime
    extraction_method: Optional[str] = None

class ResumeAnalysisResponse(BaseModel):
    candidate_id: str
    analysis_results: dict
    analysis_timestamp: datetime
    confidence_score: float
    processing_time_seconds: float

class QAReadinessResponse(BaseModel):
    candidate_id: str
    job_id: str
    overall_readiness_score: float
    question_assessments: List[dict]
    recommendations: List[str]
    assessment_timestamp: datetime

class BatchAnalysisResponse(BaseModel):
    job_id: Optional[str]
    total_candidates: int
    processed: int
    failed: int
    results: List[dict]
    processing_time_seconds: float

class StatusUpdateResponse(BaseModel):
    candidate_id: str
    old_status: str
    new_status: str
    updated_by: str
    timestamp: datetime
    notes: Optional[str] = None

# Prompt management schemas
class PromptCreate(BaseModel):
    name: str
    prompt_type: str  # Will be validated against PromptType enum
    content: str
    description: Optional[str] = None
    version: str = "1.0"
    is_default: bool = False
    variables: Optional[List[str]] = None  # Auto-extracted if not provided
    tags: List[str] = []
    metadata: Dict[str, Any] = {}
    customer_id: Optional[str] = None  # None for global prompts

class PromptUpdate(BaseModel):
    name: Optional[str] = None
    content: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None  # Will be validated against PromptStatus enum
    is_default: Optional[bool] = None
    variables: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None

class PromptResponse(BaseModel):
    id: str
    name: str
    prompt_type: str
    content: str
    description: Optional[str]
    version: str
    status: str
    is_default: bool
    variables: List[str]
    tags: List[str]
    metadata: Dict[str, Any]
    usage_count: int
    success_rate: Optional[float]
    created_at: datetime
    updated_at: Optional[datetime]
    last_used_at: Optional[datetime]
    created_by: Optional[str]
    customer_id: Optional[str]
    
    class Config:
        from_attributes = True

class PromptListResponse(BaseModel):
    prompts: List[PromptResponse]
    total: int
    page: int
    per_page: int
    has_next: bool

class PromptRenderRequest(BaseModel):
    variables: Dict[str, Any]
    
class PromptRenderResponse(BaseModel):
    rendered_content: str
    variables_used: List[str]
    missing_variables: List[str] = [] 