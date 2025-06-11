from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from loguru import logger

from app.core.auth import get_current_user
from app.models import User, Customer
from app.models.user import UserRole
from app.schemas.schemas import UserResponse, UserCreate
from app.core.rbac import require_permission, require_admin, Permission

router = APIRouter()

@router.get("/me")
async def read_users_me(current_user = Depends(get_current_user)):
    """Get current user's profile"""
    return {
        "id": str(current_user["_id"]),
        "email": current_user["email"],
        "name": current_user["name"],
        "picture": current_user.get("picture"),
        "role": current_user.get("role"),
        "customer_id": current_user.get("customer_id")
    }

@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(require_permission(Permission.VIEW_USER))
):
    """List users (filtered by company for non-super-admins)"""
    try:
        user_role = UserRole(current_user.get("role"))
        user_customer_id = current_user.get("customer_id")
        
        # Super admins can see all users
        if user_role == UserRole.SUPER_ADMIN:
            users = await User.find().skip(skip).limit(limit).to_list()
        else:
            # Other users can only see users from their company
            users = await User.find(User.customer_id == user_customer_id).skip(skip).limit(limit).to_list()
        
        return [
            UserResponse(
                id=str(user.id),
                customer_id=str(user.customer_id),
                email=user.email,
                name=user.name,
                role=user.role.value,
                is_active=user.is_active,
                created_at=user.created_at
            )
            for user in users
        ]
        
    except Exception as e:
        logger.error(f"Failed to list users: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve users"
        )

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get user details (own profile or company users for admins)"""
    try:
        user_role = UserRole(current_user.get("role"))
        user_customer_id = current_user.get("customer_id")
        current_user_id = current_user.get("_id")
        
        user = await User.get(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Users can view their own profile, or admins can view company users
        if (str(current_user_id) == user_id or 
            user_role == UserRole.SUPER_ADMIN or
            (user_role in [UserRole.COMPANY_ADMIN] and str(user.customer_id) == user_customer_id)):
            
            return UserResponse(
                id=str(user.id),
                customer_id=str(user.customer_id),
                email=user.email,
                name=user.name,
                role=user.role.value,
                is_active=user.is_active,
                created_at=user.created_at
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user"
        )

@router.put("/{user_id}/deactivate")
async def deactivate_user(
    user_id: str,
    _: dict = Depends(require_admin)
):
    """Deactivate a user (admin only)"""
    try:
        user = await User.get(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        await user.set({"is_active": False})
        logger.info(f"User deactivated: {user_id}")
        
        return {"message": "User deactivated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to deactivate user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to deactivate user"
        )

@router.post("/dev/register", response_model=UserResponse)
async def register_user_dev(
    user_data: UserCreate,
    current_user: dict = Depends(require_permission(Permission.CREATE_USER))
):
    """
    DEV ENDPOINT - Register a new user under an existing company.
    AUTHENTICATION REQUIRED - Only users with CREATE_USER permission can register new users.
    """
    try:
        # Validate the customer exists
        customer = await Customer.get(user_data.customer_id)
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )
        
        # Check if user already exists
        existing_user = await User.find_one(User.email == user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Validate role
        try:
            user_role = UserRole(user_data.role)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role: {user_data.role}. Valid roles: {[role.value for role in UserRole]}"
            )
        
        # Check permissions - only super admins can create users for different companies
        current_user_role = UserRole(current_user.get("role"))
        current_customer_id = current_user.get("customer_id")
        
        if current_user_role != UserRole.SUPER_ADMIN and str(current_customer_id) != user_data.customer_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Can only create users for your own company"
            )
        
        # Create new user
        new_user = User(
            customer_id=user_data.customer_id,
            email=user_data.email,
            name=user_data.name,
            role=user_role,
            is_active=True
        )
        
        await new_user.insert()
        logger.info(f"New user registered via dev endpoint: {new_user.email} - {new_user.id} for customer {user_data.customer_id}")
        
        return UserResponse(
            id=str(new_user.id),
            customer_id=str(new_user.customer_id.ref.id),
            email=new_user.email,
            name=new_user.name,
            role=new_user.role.value,
            is_active=new_user.is_active,
            created_at=new_user.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to register user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register user"
        )
