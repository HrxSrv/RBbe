from typing import Optional, List
from pydantic import EmailStr, BaseModel
from enum import Enum
from datetime import datetime
from beanie import Document

class ResumeAnalysis(BaseModel):
    """Resume analysis data from VLM"""
    skills: List[str] = []
    experience_years: int = 0
    education: Optional[str] = None
    previous_roles: List[str] = []
    matching_score: float = 0.0  # 0-100 score
    analysis_summary: str = ""
    resume_file_path: Optional[str] = None
    
class ApplicationStatus(str, Enum):
    APPLIED = "applied"
    SCREENING = "screening"
    INTERVIEW = "interview"
    REJECTED = "rejected"
    HIRED = "hired"

class QuestionAnswer(BaseModel):
    """Question and answer pair from call interview"""
    question: str
    answer: str
    ideal_answer: Optional[str] = None  # Reference ideal answer from job
    score: Optional[float] = None  # 0-100 score for this answer
    analysis: Optional[str] = None  # VLM analysis of the answer

class CallQA(BaseModel):
    """QA session data from candidate call"""
    call_id: Optional[str] = None  # Reference to call document
    call_date: Optional[datetime] = None
    questions_answers: List[QuestionAnswer] = []
    overall_score: Optional[float] = None  # Overall interview score
    interview_summary: Optional[str] = None
    call_duration_minutes: Optional[int] = None

class JobApplication(BaseModel):
    """Individual job application within candidate profile"""
    job_id: str  # Job ObjectId as string
    application_date: datetime
    status: ApplicationStatus = ApplicationStatus.APPLIED
    matching_score: float = 0.0
    notes: Optional[str] = None
    
    # Call QA data
    call_qa: Optional[CallQA] = None

class PersonalInfo(BaseModel):
    """Candidate personal information"""
    name: str
    email: EmailStr
    phone: Optional[str] = None
    location: Optional[str] = None

class Candidate(Document):
    """Candidate profile created after resume analysis"""
    personal_info: PersonalInfo
    resume_analysis: ResumeAnalysis
    applications: List[JobApplication] = []
    
    # Tracking
    total_applications: int = 0
    status: str = "active"  # "active", "hired", "inactive"
    
    class Settings:
        name = "candidates"
        
    class Config:
        json_schema_extra = {
            "example": {
                "personal_info": {
                    "name": "Jane Smith",
                    "email": "jane@example.com",
                    "phone": "+1234567890",
                    "location": "New York, NY"
                },
                "resume_analysis": {
                    "skills": ["Python", "React", "AWS"],
                    "experience_years": 5,
                    "matching_score": 85.5,
                    "analysis_summary": "Strong technical background with relevant experience"
                },
                "applications": [
                    {
                        "job_id": "648a1b2c3d4e5f6789012345",
                        "application_date": "2024-01-15T10:30:00Z",
                        "status": "interview",
                        "matching_score": 85.5,
                        "call_qa": {
                            "call_date": "2024-01-20T14:00:00Z",
                            "questions_answers": [
                                {
                                    "question": "What is your experience with FastAPI?",
                                    "answer": "I have been working with FastAPI for 2 years, built several REST APIs...",
                                    "score": 78.5,
                                    "analysis": "Good practical experience, slightly less than ideal 3+ years"
                                }
                            ],
                            "overall_score": 78.5,
                            "interview_summary": "Candidate shows good technical skills with room for growth",
                            "call_duration_minutes": 25
                        }
                    }
                ],
                "status": "active"
            }
        } 