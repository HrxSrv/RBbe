from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from loguru import logger
from datetime import datetime

from app.models import Job, Customer, User
from app.models.job import JobType, JobStatus, SalaryRange
from app.models.user import UserRole
from app.schemas.schemas import JobCreate, JobResponse, SalaryRangeResponse
from app.core.rbac import require_permission, Permission
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

def job_to_response(job: Job) -> JobResponse:
    """Convert Job model to JobResponse schema"""
    salary_range_response = None
    if job.salary_range:
        salary_range_response = SalaryRangeResponse(
            min_salary=job.salary_range.min_salary,
            max_salary=job.salary_range.max_salary,
            currency=job.salary_range.currency
        )
    
    return JobResponse(
        id=str(job.id),
        customer_id=str(job.customer_id),
        title=job.title,
        description=job.description,
        requirements=job.requirements,
        location=job.location,
        job_type=job.job_type,
        status=job.status,
        created_at=job.created_at,
        updated_at=job.updated_at,
        view_count=job.view_count,
        application_count=job.application_count,
        experience_level=job.experience_level,
        remote_allowed=job.remote_allowed,
        salary_range=salary_range_response,
        department=job.department,
        application_deadline=job.application_deadline,
        questions=[
            {
                "question": q.question,
                "ideal_answer": q.ideal_answer,
                "weight": q.weight
            }
            for q in job.questions
        ]
    )

@router.post("/", response_model=JobResponse)
async def create_job(
    job_data: JobCreate,
    current_user: dict = Depends(require_permission(Permission.CREATE_JOB))
):
    """Create a new job posting"""
    try:
        user_customer_id = current_user.get("customer_id")
        user_id = current_user.get("_id")
        
        if not user_customer_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User customer ID not found"
            )
        
        # Create salary range if provided
        salary_range = None
        if job_data.salary_range:
            salary_range = SalaryRange(
                min_salary=job_data.salary_range.min_salary,
                max_salary=job_data.salary_range.max_salary,
                currency=job_data.salary_range.currency
            )

        # Create new job
        new_job = Job(
            customer_id=user_customer_id,
            created_by=user_id,
            title=job_data.title,
            description=job_data.description,
            requirements=job_data.requirements,
            location=job_data.location,
            job_type=JobType(job_data.job_type),
            status=JobStatus.DRAFT,  # New jobs start as draft
            experience_level=job_data.experience_level,
            remote_allowed=job_data.remote_allowed,
            salary_range=salary_range,
            department=job_data.department,
            application_deadline=job_data.application_deadline,
            questions=[
                {
                    "question": q.question,
                    "ideal_answer": q.ideal_answer,
                    "weight": q.weight
                }
                for q in job_data.questions
            ]
        )
        
        await new_job.save()
        logger.info(f"New job created: {new_job.title} - {new_job.id}")
        
        return job_to_response(new_job)
        
    except Exception as e:
        logger.error(f"Failed to create job: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create job"
        )

@router.get("/", response_model=List[JobResponse])
async def list_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, description="Filter by job status"),
    job_type_filter: Optional[str] = Query(None, description="Filter by job type"),
    location_filter: Optional[str] = Query(None, description="Filter by location"),
    current_user: dict = Depends(require_permission(Permission.VIEW_JOB))
):
    """List jobs with filtering and pagination"""
    try:
        user_role = UserRole(current_user.get("role"))
        user_customer_id = current_user.get("customer_id")
        
        # Build query based on user role
        query = {}
        
        if user_role == UserRole.SUPER_ADMIN:
            # Super admins can see all jobs
            pass
        else:
            # Others only see their company's jobs
            query["customer_id"] = user_customer_id
        
        # Add filters if provided
        if status_filter:
            try:
                JobStatus(status_filter)  # Validate status
                query["status"] = status_filter
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid status filter: {status_filter}"
                )
        
        if job_type_filter:
            try:
                JobType(job_type_filter)  # Validate job type
                query["job_type"] = job_type_filter
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid job type filter: {job_type_filter}"
                )
        
        if location_filter:
            query["location"] = {"$regex": location_filter, "$options": "i"}  # Case insensitive search
        
        # Query with pagination
        jobs = await Job.find(query).skip(skip).limit(limit).to_list()
        logger.info(jobs)
        return [
            JobResponse(
                id=str(job.id),
                customer_id=str(job.customer_id),
                title=job.title,
                description=job.description,
                requirements=job.requirements,
                location=job.location,
                job_type=job.job_type,
                status=job.status,
                created_at=job.created_at,
                view_count=job.view_count,
                application_count=job.application_count,
                questions=[
                    {
                        "question": q.question,
                        "ideal_answer": q.ideal_answer,
                        "weight": q.weight
                    }
                    for q in job.questions
                ]
            )
            for job in jobs
        ]
        
    except Exception as e:
        logger.error(f"Failed to list jobs: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve jobs"
        )

@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: str,
    current_user: dict = Depends(require_permission(Permission.VIEW_JOB))
):
    """Get specific job details"""
    try:
        job = await Job.get(job_id)
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        # Check if user can access this job
        user_role = UserRole(current_user.get("role"))
        user_customer_id = current_user.get("customer_id")
        
        if user_role != UserRole.SUPER_ADMIN and str(job.customer_id.ref.id) != str(user_customer_id.id):
            # logger.info(job.customer_id)
            # logger.info(user_customer_id)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Can only view your company's jobs"
            )
        
        # Increment view count (TODO: Add rate limiting to prevent spam)
        await job.inc({Job.view_count: 1})
        
        # Reload job to get updated view count
        updated_job = await Job.get(job_id)
        return job_to_response(updated_job)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get job {job_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve job"
        )

@router.put("/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: str,
    job_data: JobCreate,
    current_user: dict = Depends(require_permission(Permission.UPDATE_JOB))
):
    """Update job details"""
    try:
        job = await Job.get(job_id)
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        # Check if user can update this job
        user_role = UserRole(current_user.get("role"))
        user_customer_id = current_user.get("customer_id")
        
        if user_role != UserRole.SUPER_ADMIN and str(job.customer_id.ref.id) != str(user_customer_id.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Can only update your company's jobs"
            )
        
        # Create salary range if provided
        salary_range = None
        if job_data.salary_range:
            salary_range = SalaryRange(
                min_salary=job_data.salary_range.min_salary,
                max_salary=job_data.salary_range.max_salary,
                currency=job_data.salary_range.currency
            )

        # Update job fields
        update_data = {
            Job.title: job_data.title,
            Job.description: job_data.description,
            Job.requirements: job_data.requirements,
            Job.location: job_data.location,
            Job.job_type: JobType(job_data.job_type),
            Job.experience_level: job_data.experience_level,
            Job.remote_allowed: job_data.remote_allowed,
            Job.salary_range: salary_range,
            Job.department: job_data.department,
            Job.application_deadline: job_data.application_deadline,
            Job.questions: [
                {
                    "question": q.question,
                    "ideal_answer": q.ideal_answer,
                    "weight": q.weight
                }
                for q in job_data.questions
            ],
            Job.updated_at: datetime.utcnow()
        }
        
        await job.set(update_data)
        logger.info(f"Job updated: {job.title} - {job.id}")
        
        # Reload job to get updated fields
        updated_job = await Job.get(job_id)
        return job_to_response(updated_job)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update job {job_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update job"
        )

@router.delete("/{job_id}")
async def delete_job(
    job_id: str,
    current_user: dict = Depends(require_permission(Permission.DELETE_JOB))
):
    """Delete/archive job (soft delete by setting status to closed)"""
    try:
        job = await Job.get(job_id)
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        # Check if user can delete this job
        user_role = UserRole(current_user.get("role"))
        user_customer_id = current_user.get("customer_id")
        
        if user_role != UserRole.SUPER_ADMIN and str(job.customer_id.ref.id) != str(user_customer_id.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Can only delete your company's jobs"
            )
        
        # Soft delete by setting status to closed
        await job.set({
            Job.status: JobStatus.CLOSED,
            Job.updated_at: datetime.utcnow()
        })
        
        logger.info(f"Job deleted (archived): {job.title} - {job.id}")
        
        return {
            "status": "success",
            "message": f"Job '{job.title}' has been archived",
            "job_id": str(job.id)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete job {job_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete job"
        )

@router.post("/{job_id}/pause")
async def pause_job(
    job_id: str,
    current_user: dict = Depends(require_permission(Permission.UPDATE_JOB))
):
    """Pause an active job"""
    try:
        job = await Job.get(job_id)
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        # Check if user can update this job
        user_role = UserRole(current_user.get("role"))
        user_customer_id = current_user.get("customer_id")
        
        if user_role != UserRole.SUPER_ADMIN and str(job.customer_id) != user_customer_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Can only update your company's jobs"
            )
        
        # Can only pause active jobs
        if job.status != JobStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Can only pause active jobs. Current status: {job.status}"
            )
        
        # Update status to paused
        await job.set({
            Job.status: JobStatus.PAUSED,
            Job.updated_at: datetime.utcnow()
        })
        
        logger.info(f"Job paused: {job.title} - {job.id}")
        
        return {
            "status": "success",
            "message": f"Job '{job.title}' has been paused",
            "job_id": str(job.id),
            "new_status": JobStatus.PAUSED
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to pause job {job_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to pause job"
        )

@router.post("/{job_id}/resume")
async def resume_job(
    job_id: str,
    current_user: dict = Depends(require_permission(Permission.UPDATE_JOB))
):
    """Resume a paused job"""
    try:
        job = await Job.get(job_id)
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        # Check if user can update this job
        user_role = UserRole(current_user.get("role"))
        user_customer_id = current_user.get("customer_id")
        
        if user_role != UserRole.SUPER_ADMIN and str(job.customer_id) != user_customer_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Can only update your company's jobs"
            )
        
        # Can only resume paused jobs
        if job.status != JobStatus.PAUSED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Can only resume paused jobs. Current status: {job.status}"
            )
        
        # Update status to active
        await job.set({
            Job.status: JobStatus.ACTIVE,
            Job.updated_at: datetime.utcnow()
        })
        
        logger.info(f"Job resumed: {job.title} - {job.id}")
        
        return {
            "status": "success",
            "message": f"Job '{job.title}' has been resumed",
            "job_id": str(job.id),
            "new_status": JobStatus.ACTIVE
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to resume job {job_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to resume job"
        )

@router.post("/{job_id}/publish")
async def publish_job(
    job_id: str,
    current_user: dict = Depends(require_permission(Permission.PUBLISH_JOB))
):
    """Publish job (change status from draft to active)"""
    try:
        job = await Job.get(job_id)
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        # Check if user can publish this job
        user_role = UserRole(current_user.get("role"))
        user_customer_id = current_user.get("customer_id")
        
        if user_role != UserRole.SUPER_ADMIN and str(job.customer_id.ref.id) != str(user_customer_id.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Can only publish your company's jobs"
            )
        
        if job.status != JobStatus.DRAFT:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only draft jobs can be published"
            )
        
        # Update status to active
        await job.set({
            Job.status: JobStatus.ACTIVE,
            Job.updated_at: datetime.utcnow()
        })
        
        logger.info(f"Job published: {job.title} - {job.id}")
        
        # TODO: Trigger candidate matching algorithm when VLM is integrated
        
        return {
            "status": "success",
            "message": f"Job '{job.title}' has been published",
            "job_id": str(job.id)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to publish job {job_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to publish job"
        )

@router.get("/dev/list", response_model=List[JobResponse])
async def list_dev_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    location: Optional[str] = Query(None, description="Filter by location"),
    job_type: Optional[str] = Query(None, description="Filter by job type"),
    remote_allowed: Optional[bool] = Query(None, description="Filter by remote availability"),
    current_user: dict = Depends(require_permission(Permission.VIEW_JOB))
):
    """Internal dev endpoint for HR teams to browse jobs with full access including ideal answers"""
    try:
        user_role = UserRole(current_user.get("role"))
        user_customer_id = current_user.get("customer_id")
        
        # Build query based on user role (same as internal job listing)
        query = {}
        
        if user_role == UserRole.SUPER_ADMIN:
            # Super admins can see all jobs
            pass
        else:
            # Others only see their company's jobs
            query["customer_id"] = user_customer_id
        
        # Add filters if provided
        if location:
            query["location"] = {"$regex": location, "$options": "i"}  # Case insensitive search
        
        if job_type:
            try:
                JobType(job_type)  # Validate job type
                query["job_type"] = job_type
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid job type: {job_type}"
                )
        
        if remote_allowed is not None:
            query["remote_allowed"] = remote_allowed
        
        # Query with pagination
        jobs = await Job.find(query).skip(skip).limit(limit).to_list()
        
        return [job_to_response(job) for job in jobs]
        
    except Exception as e:
        logger.error(f"Failed to list dev jobs: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve jobs"
        )

@router.get("/dev/{job_id}", response_model=JobResponse)
async def get_dev_job(
    job_id: str,
    current_user: dict = Depends(require_permission(Permission.VIEW_JOB))
):
    """Internal dev endpoint to view a specific job with full access including ideal answers"""
    try:
        job = await Job.get(job_id)
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        # Check if user can access this job
        user_role = UserRole(current_user.get("role"))
        user_customer_id = current_user.get("customer_id")
        
        if user_role != UserRole.SUPER_ADMIN and str(job.customer_id) != user_customer_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Can only view your company's jobs"
            )
        
        # Increment view count
        await job.inc({Job.view_count: 1})
        
        # Reload job to get updated view count
        updated_job = await Job.get(job_id)
        return job_to_response(updated_job)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get dev job {job_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve job"
        )

@router.get("/analytics/summary")
async def get_job_analytics(
    current_user: dict = Depends(require_permission(Permission.VIEW_ANALYTICS))
):
    """Get job analytics summary for the company"""
    try:
        user_role = UserRole(current_user.get("role"))
        user_customer_id = current_user.get("customer_id")
        
        # Build query based on user role
        query = {}
        if user_role != UserRole.SUPER_ADMIN:
            query["customer_id"] = user_customer_id
        
        # Get job counts by status
        total_jobs = await Job.find(query).count()
        active_jobs = await Job.find({**query, "status": JobStatus.ACTIVE}).count()
        draft_jobs = await Job.find({**query, "status": JobStatus.DRAFT}).count()
        paused_jobs = await Job.find({**query, "status": JobStatus.PAUSED}).count()
        closed_jobs = await Job.find({**query, "status": JobStatus.CLOSED}).count()
        
        # Get total views and applications
        jobs = await Job.find(query).to_list()
        total_views = sum(job.view_count for job in jobs)
        total_applications = sum(job.application_count for job in jobs)
        
        return {
            "job_counts": {
                "total": total_jobs,
                "active": active_jobs,
                "draft": draft_jobs,
                "paused": paused_jobs,
                "closed": closed_jobs
            },
            "engagement": {
                "total_views": total_views,
                "total_applications": total_applications,
                "avg_views_per_job": total_views / total_jobs if total_jobs > 0 else 0,
                "avg_applications_per_job": total_applications / total_jobs if total_jobs > 0 else 0
            },
            "performance_metrics": {
                "view_to_application_ratio": (total_applications / total_views * 100) if total_views > 0 else 0
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get job analytics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve analytics"
        ) 