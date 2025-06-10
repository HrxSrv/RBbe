from typing import Optional, TYPE_CHECKING
from enum import Enum
from datetime import datetime
from beanie import Document, Link

if TYPE_CHECKING:
    from .candidate import Candidate
    from .job import Job
    from .customer import Customer

class CallStatus(str, Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"
    FAILED = "failed"

class CallType(str, Enum):
    SCREENING = "screening"
    INTERVIEW = "interview"
    FOLLOW_UP = "follow_up"

class Call(Document):
    """Call scheduling and tracking for VAPI integration"""
    
    # References
    candidate_id: Link["Candidate"]
    job_id: Link["Job"]
    customer_id: Link["Customer"]
    
    # Call scheduling
    scheduled_time: datetime
    call_type: CallType = CallType.SCREENING
    status: CallStatus = CallStatus.SCHEDULED
    
    # VAPI integration
    vapi_call_id: Optional[str] = None
    vapi_assistant_id: Optional[str] = None
    
    # Call results
    call_duration: Optional[int] = None  # in seconds
    call_summary: Optional[str] = None
    call_transcript: Optional[str] = None
    call_recording_url: Optional[str] = None
    
    # Analysis results
    candidate_score: Optional[float] = None  # 0-100 score from call analysis
    interviewer_notes: Optional[str] = None
    next_steps: Optional[str] = None
    
    # Metadata
    scheduled_by: Optional[str] = None  # User who scheduled the call
    rescheduled_count: int = 0
    
    class Settings:
        name = "calls"
        
    class Config:
        json_schema_extra = {
            "example": {
                "scheduled_time": "2024-01-01T10:00:00Z",
                "call_type": "screening",
                "status": "scheduled",
                "vapi_call_id": "call_123456",
                "call_duration": 1800,
                "call_summary": "Positive screening call with strong technical background",
                "candidate_score": 78.5
            }
        } 