from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional, List
from datetime import datetime, timedelta
from loguru import logger

from app.core.rbac import get_current_user, require_permission
from app.core.rbac import Permission
from app.models.call import Call, CallStatus, CallType
from app.models.candidate import Candidate
from app.models.job import Job
from app.schemas.schemas import (
    CallQAResponse, CallQACreate
)

router = APIRouter()

# ========================== CALL SCHEDULING (AUTHENTICATION REQUIRED) ==========================

@router.post("/schedule")
async def schedule_call(
    candidate_id: str,
    job_id: str,
    scheduled_time: Optional[datetime] = None,
    call_type: CallType = CallType.SCREENING,
    notes: Optional[str] = None,
    current_user: dict = Depends(require_permission(Permission.WRITE_CANDIDATES))
):
    """
    INTERNAL ENDPOINT - Schedule a call for candidate.
    AUTHENTICATION REQUIRED.
    
    For pipeline testing, this creates a call record without actual VAPI integration.
    
    - **candidate_id**: ID of candidate to schedule call for
    - **job_id**: Job context for the call
    - **scheduled_time**: When to schedule call (optional - defaults to 1 hour from now)
    - **call_type**: Type of call (screening, technical, final)
    - **notes**: Optional scheduling notes
    """
    try:
        customer_id = current_user.get("customer_id")
        user_id = current_user.get("_id")
        
        logger.info(f"Scheduling call for candidate {candidate_id} by user {current_user.get('email')}")
        
        # Get candidate and verify access
        candidate = await Candidate.get(candidate_id)
        if not candidate:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Candidate not found"
            )
        
        # Get job and verify access
        job = await Job.get(job_id)
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        # Verify job belongs to user's company
        if str(job.customer_id) != customer_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Job does not belong to your company"
            )
        
        # Default scheduling time (1 hour from now)
        if not scheduled_time:
            scheduled_time = datetime.utcnow() + timedelta(hours=1)
        
        # Create call record
        new_call = Call(
            candidate_id=candidate_id,
            job_id=job_id,
            customer_id=customer_id,
            scheduled_time=scheduled_time,
            call_type=call_type,
            status=CallStatus.SCHEDULED,
            scheduled_by=user_id
        )
        
        await new_call.save()
        
        logger.info(f"Call scheduled successfully - ID: {new_call.id}, Time: {scheduled_time}")
        
        return {
            "status": "success",
            "message": "Call scheduled successfully",
            "call_details": {
                "call_id": str(new_call.id),
                "candidate_name": candidate.personal_info.name,
                "job_title": job.title,
                "scheduled_time": scheduled_time.isoformat(),
                "call_type": call_type,
                "status": CallStatus.SCHEDULED,
                "scheduled_by": current_user.get("email")
            },
            "next_steps": [
                "Call has been scheduled in the system",
                "For actual VAPI integration, use VAPI service endpoints",
                "Call status can be updated as it progresses",
                "This completes the basic pipeline for testing"
            ],
            "pipeline_status": "✅ COMPLETE - Resume uploaded → Analyzed → Call scheduled"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Call scheduling failed for candidate {candidate_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Call scheduling failed: {str(e)}"
        )

@router.get("/")
async def list_calls(
    candidate_id: Optional[str] = None,
    job_id: Optional[str] = None,
    status: Optional[CallStatus] = None,
    current_user: dict = Depends(require_permission(Permission.VIEW_CANDIDATE))
):
    """
    INTERNAL ENDPOINT - List scheduled calls.
    AUTHENTICATION REQUIRED.
    """
    try:
        customer_id = current_user.get("customer_id")
        
        # Build query filters
        query_filters = {"customer_id": customer_id}
        
        if candidate_id:
            query_filters["candidate_id"] = candidate_id
        if job_id:
            query_filters["job_id"] = job_id
        if status:
            query_filters["status"] = status
        
        calls = await Call.find(query_filters).to_list()
        
        # Enrich with candidate and job info
        enriched_calls = []
        for call in calls:
            candidate = await call.candidate_id.fetch()
            job = await call.job_id.fetch()
            
            enriched_calls.append({
                "call_id": str(call.id),
                "candidate": {
                    "id": str(candidate.id),
                    "name": candidate.personal_info.name,
                    "email": candidate.personal_info.email
                },
                "job": {
                    "id": str(job.id),
                    "title": job.title
                },
                "scheduled_time": call.scheduled_time.isoformat(),
                "call_type": call.call_type,
                "status": call.status,
                "call_duration": call.call_duration,
                "candidate_score": call.candidate_score
            })
        
        return {
            "calls": enriched_calls,
            "total": len(enriched_calls),
            "filters_applied": {
                "candidate_id": candidate_id,
                "job_id": job_id,
                "status": status
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to list calls: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list calls: {str(e)}"
        )

@router.get("/{call_id}")
async def get_call_details(
    call_id: str,
    current_user: dict = Depends(require_permission(Permission.VIEW_CANDIDATE))
):
    """
    INTERNAL ENDPOINT - Get detailed call information.
    AUTHENTICATION REQUIRED.
    """
    try:
        customer_id = current_user.get("customer_id")
        
        call = await Call.get(call_id)
        if not call:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Call not found"
            )
        
        # Verify access (call belongs to user's company)
        if str(call.customer_id) != customer_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Fetch related data
        candidate = await call.candidate_id.fetch()
        job = await call.job_id.fetch()
        
        return {
            "call_details": {
                "call_id": str(call.id),
                "scheduled_time": call.scheduled_time.isoformat(),
                "call_type": call.call_type,
                "status": call.status,
                "vapi_call_id": call.vapi_call_id,
                "call_duration": call.call_duration,
                "call_summary": call.call_summary,
                "call_transcript": call.call_transcript,
                "candidate_score": call.candidate_score,
                "interviewer_notes": call.interviewer_notes,
                "next_steps": call.next_steps
            },
            "candidate": {
                "id": str(candidate.id),
                "name": candidate.personal_info.name,
                "email": candidate.personal_info.email,
                "phone": candidate.personal_info.phone,
                "resume_analysis": {
                    "overall_score": candidate.resume_analysis.matching_score,
                    "skills": candidate.resume_analysis.skills,
                    "experience_years": candidate.resume_analysis.experience_years
                }
            },
            "job": {
                "id": str(job.id),
                "title": job.title,
                "description": job.description,
                "requirements": job.requirements,
                "questions": getattr(job, 'questions', [])
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get call details {call_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get call details: {str(e)}"
        ) 