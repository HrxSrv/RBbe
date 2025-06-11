from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from loguru import logger
from datetime import datetime

from app.core.auth import get_current_user
from app.models import Prompt
from app.models.prompt import PromptType, PromptStatus
from app.models.user import UserRole
from app.schemas.schemas import (
    PromptCreate, PromptUpdate, PromptResponse, PromptListResponse,
    PromptRenderRequest, PromptRenderResponse
)
from app.core.rbac import require_permission, Permission

router = APIRouter()

@router.post("/", response_model=PromptResponse)
async def create_prompt(
    prompt_data: PromptCreate,
    current_user: dict = Depends(require_permission(Permission.CREATE_USER))  # Using CREATE_USER as proxy for admin access
):
    """
    Create a new AI prompt for VAPI or Gemini services.
    AUTHENTICATION REQUIRED - Only admins can create prompts.
    """
    try:
        # Validate prompt type
        try:
            prompt_type = PromptType(prompt_data.prompt_type)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid prompt type: {prompt_data.prompt_type}. Valid types: {[t.value for t in PromptType]}"
            )
        
        # Check permissions for customer-specific prompts
        current_user_role = UserRole(current_user.get("role"))
        current_customer_id = current_user.get("customer_id")
        
        if prompt_data.customer_id:
            if current_user_role != UserRole.SUPER_ADMIN and str(current_customer_id) != prompt_data.customer_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: Can only create prompts for your own company"
                )
        
        # If setting as default, unset other defaults for this type/customer combination
        if prompt_data.is_default:
            await Prompt.find({
                "prompt_type": prompt_type,
                "customer_id": prompt_data.customer_id,
                "is_default": True
            }).update_many({"$set": {"is_default": False, "updated_at": datetime.utcnow()}})
        
        # Create new prompt
        new_prompt = Prompt(
            name=prompt_data.name,
            prompt_type=prompt_type,
            content=prompt_data.content,
            description=prompt_data.description,
            version=prompt_data.version,
            is_default=prompt_data.is_default,
            variables=prompt_data.variables,  # Will be auto-extracted if not provided
            tags=prompt_data.tags,
            metadata=prompt_data.metadata,
            created_by=current_user.get("_id"),
            customer_id=prompt_data.customer_id
        )
        
        await new_prompt.insert()
        logger.info(f"New prompt created: {new_prompt.name} ({new_prompt.prompt_type}) - {new_prompt.id}")
        
        return PromptResponse(
            id=str(new_prompt.id),
            name=new_prompt.name,
            prompt_type=new_prompt.prompt_type.value,
            content=new_prompt.content,
            description=new_prompt.description,
            version=new_prompt.version,
            status=new_prompt.status.value,
            is_default=new_prompt.is_default,
            variables=new_prompt.variables,
            tags=new_prompt.tags,
            metadata=new_prompt.metadata,
            usage_count=new_prompt.usage_count,
            success_rate=new_prompt.success_rate,
            created_at=new_prompt.created_at,
            updated_at=new_prompt.updated_at,
            last_used_at=new_prompt.last_used_at,
            created_by=new_prompt.created_by,
            customer_id=new_prompt.customer_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create prompt: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create prompt"
        )

@router.get("/", response_model=PromptListResponse)
async def list_prompts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    prompt_type: Optional[str] = Query(None, description="Filter by prompt type"),
    status: Optional[str] = Query(None, description="Filter by status"),
    current_user: dict = Depends(require_permission(Permission.VIEW_USER))
):
    """
    List prompts with filtering and pagination.
    AUTHENTICATION REQUIRED.
    """
    try:
        user_role = UserRole(current_user.get("role"))
        user_customer_id = current_user.get("customer_id")
        
        # Build query
        query = {}
        
        # Prompt type filter
        if prompt_type:
            try:
                PromptType(prompt_type)  # Validate
                query["prompt_type"] = prompt_type
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid prompt type: {prompt_type}"
                )
        
        # Status filter
        if status:
            try:
                PromptStatus(status)  # Validate
                query["status"] = status
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid status: {status}"
                )
        
        # Customer filter based on permissions
        if user_role == UserRole.SUPER_ADMIN:
            # Super admins can see all prompts
            pass
        else:
            # Non-super-admins can only see global prompts and their own customer prompts
            query["$or"] = [
                {"customer_id": None},  # Global prompts
                {"customer_id": user_customer_id}  # Their company prompts
            ]
        
        # Execute query
        prompts = await Prompt.find(query).skip(skip).limit(limit).to_list()
        total = await Prompt.find(query).count()
        
        return PromptListResponse(
            prompts=[
                PromptResponse(
                    id=str(prompt.id),
                    name=prompt.name,
                    prompt_type=prompt.prompt_type.value,
                    content=prompt.content,
                    description=prompt.description,
                    version=prompt.version,
                    status=prompt.status.value,
                    is_default=prompt.is_default,
                    variables=prompt.variables,
                    tags=prompt.tags,
                    metadata=prompt.metadata,
                    usage_count=prompt.usage_count,
                    success_rate=prompt.success_rate,
                    created_at=prompt.created_at,
                    updated_at=prompt.updated_at,
                    last_used_at=prompt.last_used_at,
                    created_by=prompt.created_by,
                    customer_id=prompt.customer_id
                )
                for prompt in prompts
            ],
            total=total,
            page=(skip // limit) + 1,
            per_page=limit,
            has_next=skip + limit < total
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to list prompts: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve prompts"
        )

@router.post("/dev/initialize-defaults")
async def initialize_default_prompts(
    current_user: dict = Depends(require_permission(Permission.CREATE_USER))
):
    """
    DEV ENDPOINT - Initialize database with default prompts for VAPI and Gemini.
    AUTHENTICATION REQUIRED - Only admins can initialize defaults.
    """
    try:
        user_role = UserRole(current_user.get("role"))
        if user_role != UserRole.SUPER_ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Only super admins can initialize default prompts"
            )
        
        from app.services.prompt_service import PromptService
        
        # Define default prompts
        default_prompts = [
            {
                "name": "Default VAPI Interview System Prompt",
                "prompt_type": PromptType.VAPI_INTERVIEW,
                "content": PromptService._get_fallback_vapi_interview_prompt(),
                "description": "Standard system prompt for VAPI interview assistants with job context and candidate information",
                "version": "1.0",
                "is_default": True,
                "tags": ["vapi", "interview", "default", "system"],
                "metadata": {"source": "migration", "created_by": "system"}
            },
            {
                "name": "Default VAPI First Message",
                "prompt_type": PromptType.VAPI_FIRST_MESSAGE,
                "content": PromptService._get_fallback_vapi_first_message(),
                "description": "Standard first message for VAPI interview calls",
                "version": "1.0",
                "is_default": True,
                "tags": ["vapi", "first_message", "default"],
                "metadata": {"source": "migration", "created_by": "system"}
            },
            {
                "name": "Default Gemini Resume Text Analysis",
                "prompt_type": PromptType.GEMINI_RESUME_TEXT,
                "content": PromptService._get_fallback_gemini_text_prompt(),
                "description": "Standard prompt for Gemini text-based resume analysis with job context",
                "version": "1.0",
                "is_default": True,
                "tags": ["gemini", "resume", "text", "analysis", "default"],
                "metadata": {"source": "migration", "created_by": "system"}
            },
            {
                "name": "Default Gemini Resume Vision Analysis",
                "prompt_type": PromptType.GEMINI_RESUME_VISION,
                "content": PromptService._get_fallback_gemini_vision_prompt(),
                "description": "Standard prompt for Gemini vision-based resume analysis for complex documents",
                "version": "1.0",
                "is_default": True,
                "tags": ["gemini", "resume", "vision", "analysis", "default"],
                "metadata": {"source": "migration", "created_by": "system"}
            },
            {
                "name": "Default Gemini Q&A Assessment",
                "prompt_type": PromptType.GEMINI_QA_ASSESSMENT,
                "content": PromptService._get_fallback_gemini_qa_prompt(),
                "description": "Standard prompt for assessing candidate readiness for interview questions",
                "version": "1.0",
                "is_default": True,
                "tags": ["gemini", "qa", "assessment", "interview", "default"],
                "metadata": {"source": "migration", "created_by": "system"}
            }
        ]
        
        created_prompts = []
        skipped_prompts = []
        
        for prompt_data in default_prompts:
            # Check if default prompt of this type already exists
            existing = await Prompt.find_one({
                "prompt_type": prompt_data["prompt_type"],
                "is_default": True,
                "customer_id": None  # Global prompts
            })
            
            if existing:
                skipped_prompts.append({
                    "type": prompt_data["prompt_type"].value,
                    "reason": "Default prompt already exists",
                    "existing_id": str(existing.id)
                })
                continue
            
            # Create new default prompt
            new_prompt = Prompt(
                name=prompt_data["name"],
                prompt_type=prompt_data["prompt_type"],
                content=prompt_data["content"],
                description=prompt_data["description"],
                version=prompt_data["version"],
                is_default=prompt_data["is_default"],
                tags=prompt_data["tags"],
                metadata=prompt_data["metadata"],
                created_by=current_user.get("_id"),
                customer_id=None  # Global prompts
            )
            
            await new_prompt.insert()
            created_prompts.append({
                "id": str(new_prompt.id),
                "name": new_prompt.name,
                "type": new_prompt.prompt_type.value
            })
        
        logger.info(f"Default prompts initialization completed: {len(created_prompts)} created, {len(skipped_prompts)} skipped")
        
        return {
            "status": "success",
            "message": "Default prompts initialization completed",
            "summary": {
                "created_count": len(created_prompts),
                "skipped_count": len(skipped_prompts),
                "total_attempted": len(default_prompts)
            },
            "created_prompts": created_prompts,
            "skipped_prompts": skipped_prompts,
            "next_steps": [
                "Default prompts are now available in the database",
                "VAPI and Gemini services will use these prompts automatically",
                "You can customize prompts via the prompt management endpoints",
                "Create customer-specific prompts by setting customer_id"
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to initialize default prompts: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initialize default prompts"
        )

@router.get("/{prompt_id}", response_model=PromptResponse)
async def get_prompt(
    prompt_id: str,
    current_user: dict = Depends(require_permission(Permission.VIEW_USER))
):
    """
    Get specific prompt by ID.
    AUTHENTICATION REQUIRED.
    """
    try:
        prompt = await Prompt.get(prompt_id)
        if not prompt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Prompt not found"
            )
        
        # Check access permissions
        user_role = UserRole(current_user.get("role"))
        user_customer_id = current_user.get("customer_id")
        
        if (user_role != UserRole.SUPER_ADMIN and 
            prompt.customer_id is not None and 
            prompt.customer_id != user_customer_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Cannot view other company's prompts"
            )
        
        return PromptResponse(
            id=str(prompt.id),
            name=prompt.name,
            prompt_type=prompt.prompt_type.value,
            content=prompt.content,
            description=prompt.description,
            version=prompt.version,
            status=prompt.status.value,
            is_default=prompt.is_default,
            variables=prompt.variables,
            tags=prompt.tags,
            metadata=prompt.metadata,
            usage_count=prompt.usage_count,
            success_rate=prompt.success_rate,
            created_at=prompt.created_at,
            updated_at=prompt.updated_at,
            last_used_at=prompt.last_used_at,
            created_by=prompt.created_by,
            customer_id=prompt.customer_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get prompt {prompt_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve prompt"
        )

@router.put("/{prompt_id}", response_model=PromptResponse)
async def update_prompt(
    prompt_id: str,
    prompt_data: PromptUpdate,
    current_user: dict = Depends(require_permission(Permission.UPDATE_USER))  # Using UPDATE_USER as proxy for admin access
):
    """
    Update an existing prompt.
    AUTHENTICATION REQUIRED - Only admins can update prompts.
    """
    try:
        prompt = await Prompt.get(prompt_id)
        if not prompt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Prompt not found"
            )
        
        # Check permissions
        user_role = UserRole(current_user.get("role"))
        user_customer_id = current_user.get("customer_id")
        
        if (user_role != UserRole.SUPER_ADMIN and 
            prompt.customer_id is not None and 
            prompt.customer_id != user_customer_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Cannot update other company's prompts"
            )
        
        # Prepare update data
        update_data = {"updated_at": datetime.utcnow()}
        
        if prompt_data.name is not None:
            update_data["name"] = prompt_data.name
        if prompt_data.content is not None:
            update_data["content"] = prompt_data.content
            # Re-extract variables if content changes
            if prompt_data.variables is None:
                import re
                variables = re.findall(r'\{(\w+)\}', prompt_data.content)
                update_data["variables"] = list(set(variables))
        if prompt_data.description is not None:
            update_data["description"] = prompt_data.description
        if prompt_data.status is not None:
            try:
                PromptStatus(prompt_data.status)  # Validate
                update_data["status"] = prompt_data.status
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid status: {prompt_data.status}"
                )
        if prompt_data.variables is not None:
            update_data["variables"] = prompt_data.variables
        if prompt_data.tags is not None:
            update_data["tags"] = prompt_data.tags
        if prompt_data.metadata is not None:
            update_data["metadata"] = prompt_data.metadata
        
        # Handle is_default change
        if prompt_data.is_default is not None and prompt_data.is_default != prompt.is_default:
            if prompt_data.is_default:
                # Unset other defaults for this type/customer combination
                await Prompt.find({
                    "prompt_type": prompt.prompt_type,
                    "customer_id": prompt.customer_id,
                    "is_default": True,
                    "_id": {"$ne": prompt.id}
                }).update_many({"$set": {"is_default": False, "updated_at": datetime.utcnow()}})
            update_data["is_default"] = prompt_data.is_default
        
        # Update prompt
        await prompt.set(update_data)
        
        # Refresh prompt object
        updated_prompt = await Prompt.get(prompt_id)
        
        logger.info(f"Prompt updated: {updated_prompt.name} - {prompt_id}")
        
        return PromptResponse(
            id=str(updated_prompt.id),
            name=updated_prompt.name,
            prompt_type=updated_prompt.prompt_type.value,
            content=updated_prompt.content,
            description=updated_prompt.description,
            version=updated_prompt.version,
            status=updated_prompt.status.value,
            is_default=updated_prompt.is_default,
            variables=updated_prompt.variables,
            tags=updated_prompt.tags,
            metadata=updated_prompt.metadata,
            usage_count=updated_prompt.usage_count,
            success_rate=updated_prompt.success_rate,
            created_at=updated_prompt.created_at,
            updated_at=updated_prompt.updated_at,
            last_used_at=updated_prompt.last_used_at,
            created_by=updated_prompt.created_by,
            customer_id=updated_prompt.customer_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update prompt {prompt_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update prompt"
        )

@router.delete("/{prompt_id}")
async def delete_prompt(
    prompt_id: str,
    current_user: dict = Depends(require_permission(Permission.DELETE_USER))  # Using DELETE_USER as proxy for admin access
):
    """
    Delete a prompt (soft delete by archiving).
    AUTHENTICATION REQUIRED - Only admins can delete prompts.
    """
    try:
        prompt = await Prompt.get(prompt_id)
        if not prompt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Prompt not found"
            )
        
        # Check permissions
        user_role = UserRole(current_user.get("role"))
        user_customer_id = current_user.get("customer_id")
        
        if (user_role != UserRole.SUPER_ADMIN and 
            prompt.customer_id is not None and 
            prompt.customer_id != user_customer_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Cannot delete other company's prompts"
            )
        
        # Soft delete by archiving
        await prompt.set({
            "status": PromptStatus.ARCHIVED,
            "is_default": False,  # Remove default status when archiving
            "updated_at": datetime.utcnow()
        })
        
        logger.info(f"Prompt archived: {prompt.name} - {prompt_id}")
        
        return {"message": "Prompt archived successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete prompt {prompt_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete prompt"
        )

@router.post("/{prompt_id}/render", response_model=PromptRenderResponse)
async def render_prompt(
    prompt_id: str,
    render_data: PromptRenderRequest,
    current_user: dict = Depends(require_permission(Permission.VIEW_USER))
):
    """
    Render a prompt with provided variables for testing.
    AUTHENTICATION REQUIRED.
    """
    try:
        prompt = await Prompt.get(prompt_id)
        if not prompt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Prompt not found"
            )
        
        # Check access permissions
        user_role = UserRole(current_user.get("role"))
        user_customer_id = current_user.get("customer_id")
        
        if (user_role != UserRole.SUPER_ADMIN and 
            prompt.customer_id is not None and 
            prompt.customer_id != user_customer_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Cannot render other company's prompts"
            )
        
        # Render prompt
        try:
            rendered_content = prompt.render_prompt(render_data.variables)
            
            # Find missing variables
            import re
            all_variables = set(re.findall(r'\{(\w+)\}', prompt.content))
            provided_variables = set(render_data.variables.keys())
            missing_variables = list(all_variables - provided_variables)
            
            return PromptRenderResponse(
                rendered_content=rendered_content,
                variables_used=list(provided_variables & all_variables),
                missing_variables=missing_variables
            )
            
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to render prompt {prompt_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to render prompt"
        )

@router.get("/default/{prompt_type}", response_model=PromptResponse)
async def get_default_prompt(
    prompt_type: str,
    current_user: dict = Depends(require_permission(Permission.VIEW_USER))
):
    """
    Get the default prompt for a specific type.
    Will return customer-specific default if available, otherwise global default.
    AUTHENTICATION REQUIRED.
    """
    try:
        # Validate prompt type
        try:
            prompt_type_enum = PromptType(prompt_type)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid prompt type: {prompt_type}. Valid types: {[t.value for t in PromptType]}"
            )
        
        user_customer_id = current_user.get("customer_id")
        
        # Get default prompt (customer-specific or global)
        prompt = await Prompt.get_default_prompt(prompt_type_enum, user_customer_id)
        
        if not prompt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No default prompt found for type: {prompt_type}"
            )
        
        return PromptResponse(
            id=str(prompt.id),
            name=prompt.name,
            prompt_type=prompt.prompt_type.value,
            content=prompt.content,
            description=prompt.description,
            version=prompt.version,
            status=prompt.status.value,
            is_default=prompt.is_default,
            variables=prompt.variables,
            tags=prompt.tags,
            metadata=prompt.metadata,
            usage_count=prompt.usage_count,
            success_rate=prompt.success_rate,
            created_at=prompt.created_at,
            updated_at=prompt.updated_at,
            last_used_at=prompt.last_used_at,
            created_by=prompt.created_by,
            customer_id=prompt.customer_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get default prompt for {prompt_type}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve default prompt"
        ) 