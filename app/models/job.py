from typing import Optional, List, TYPE_CHECKING
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime
from beanie import Document, Link

if TYPE_CHECKING:
    from .customer import Customer
    from .user import User

class JobType(str, Enum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    INTERNSHIP = "internship"

class JobStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    CLOSED = "closed"

class SalaryRange(BaseModel):
    min_salary: Optional[int] = None
    max_salary: Optional[int] = None
    currency: str = "USD"

class JobQuestion(BaseModel):
    """Question for candidates with ideal answer"""
    question: str
    ideal_answer: str
    weight: float = 1.0  # Question importance weight (1.0 = normal importance)

class Job(Document):
    customer_id: Link["Customer"]  # Reference to Customer using Beanie Link
    created_by: Link["User"]     # Reference to User who created this job
    
    title: str
    description: str
    requirements: List[str] = []
    location: str
    
    # Questions for candidates
    questions: List[JobQuestion] = []
    
    salary_range: Optional[SalaryRange] = None
    job_type: JobType = JobType.FULL_TIME
    status: JobStatus = JobStatus.DRAFT
    
    # Optional fields
    department: Optional[str] = None
    experience_level: Optional[str] = None  # "entry", "mid", "senior"
    remote_allowed: bool = False
    
    application_deadline: Optional[datetime] = None
    
    # Tracking
    view_count: int = 0
    application_count: int = 0
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    class Settings:
        name = "jobs"  # Collection name
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "Senior Python Developer",
                "description": "We are looking for a senior Python developer...",
                "requirements": ["Python", "FastAPI", "MongoDB"],
                "location": "San Francisco, CA",
                "job_type": "full_time",
                "experience_level": "senior",
                "questions": [
                    {
                        "question": "What is your experience with FastAPI?",
                        "ideal_answer": "I have 3+ years experience building REST APIs with FastAPI, including authentication, database integration, and async operations.",
                        "weight": 1.5
                    },
                    {
                        "question": "How do you handle database optimization?",
                        "ideal_answer": "I use indexing strategies, query optimization, connection pooling, and caching mechanisms like Redis for performance.",
                        "weight": 1.0
                    }
                ]
            }
        } 