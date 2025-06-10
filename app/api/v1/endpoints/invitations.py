from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from loguru import logger
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr
import secrets

from app.models import Customer, User
from app.models.user import UserRole
from app.core.rbac import require_permission, Permission
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

class UserInvitation(BaseModel):
    email: EmailStr
    name: str
    role: UserRole

class InvitationResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    customer_id: str
    invited_by: str
    expires_at: datetime
    status: str

# In-memory invitation store
pending_invitations = {}

@router.post("/invite", response_model=InvitationResponse)
async def invite_user(
    invitation: UserInvitation,
    current_user: dict = Depends(require_permission(Permission.INVITE_USER))
):
    """Invite a user to join the company"""
    try:
        user_customer_id = current_user.get("customer_id")
        if not user_customer_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User customer ID not found"
            )
        
        # Check if user already exists
        existing_user = await User.find_one(User.email == invitation.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Create invitation
        invitation_id = secrets.token_urlsafe(32)
        invitation_data = {
            "id": invitation_id,
            "email": invitation.email,
            "name": invitation.name,
            "role": invitation.role.value,
            "customer_id": user_customer_id,
            "invited_by": current_user.get("email"),
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(days=7),
            "status": "pending"
        }
        
        pending_invitations[invitation_id] = invitation_data
        logger.info(f"User invitation created: {invitation.email}")
        
        return InvitationResponse(**invitation_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create invitation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create invitation"
        )

@router.post("/accept/{invitation_id}")
async def accept_invitation(invitation_id: str):
    """Accept an invitation and create user account"""
    try:
        invitation = pending_invitations.get(invitation_id)
        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation not found"
            )
        
        if invitation["status"] != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invitation already processed"
            )
        
        if datetime.utcnow() > invitation["expires_at"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invitation has expired"
            )
        
        # Create the user
        new_user = User(
            customer_id=invitation["customer_id"],
            email=invitation["email"],
            name=invitation["name"],
            role=UserRole(invitation["role"]),
            is_active=True
        )
        
        await new_user.save()
        
        # Mark invitation as accepted
        pending_invitations[invitation_id]["status"] = "accepted"
        
        logger.info(f"Invitation accepted: {invitation['email']} - User created: {new_user.id}")
        
        return {
            "message": "Invitation accepted successfully",
            "user_id": str(new_user.id),
            "email": new_user.email,
            "role": new_user.role.value
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to accept invitation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to accept invitation"
        ) 