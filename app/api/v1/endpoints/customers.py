from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from loguru import logger
from datetime import datetime

from app.models import Customer, User
from app.models.user import UserRole
from app.models.customer import SubscriptionPlan
from app.schemas.schemas import CustomerCreate, CustomerResponse
from app.core.rbac import require_permission, require_super_admin, Permission
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

@router.post("/register", response_model=CustomerResponse)
async def register_customer(customer_data: CustomerCreate):
    """Public endpoint for company registration"""
    try:
        # Check if customer already exists
        existing_customer = await Customer.find_one(Customer.email == customer_data.email)
        if existing_customer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Company with this email already exists"
            )
        
        # Create new customer
        new_customer = Customer(
            company_name=customer_data.company_name,
            email=customer_data.email,
            subscription_plan=SubscriptionPlan.FREE,
            website=customer_data.website,
            industry=customer_data.industry,
            company_size=customer_data.company_size,
            is_active=True
        )
        
        await new_customer.save()
        logger.info(f"New customer registered: {new_customer.company_name} - {new_customer.id}")
        
        return CustomerResponse(
            id=str(new_customer.id),
            company_name=new_customer.company_name,
            email=new_customer.email,
            subscription_plan=new_customer.subscription_plan,
            is_active=new_customer.is_active,
            created_at=new_customer.created_at
        )
        
    except Exception as e:
        logger.error(f"Failed to register customer: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register company"
        )

@router.get("/", response_model=List[CustomerResponse])
async def list_customers(
    skip: int = 0,
    limit: int = 100,
    _: dict = Depends(require_permission(Permission.VIEW_CUSTOMER))
):
    """List all customers (admin only)"""
    try:
        customers = await Customer.find().skip(skip).limit(limit).to_list()
        
        return [
            CustomerResponse(
                id=str(customer.id),
                company_name=customer.company_name,
                email=customer.email,
                subscription_plan=customer.subscription_plan,
                is_active=customer.is_active,
                created_at=customer.created_at
            )
            for customer in customers
        ]
        
    except Exception as e:
        logger.error(f"Failed to list customers: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve customers"
        )

@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    customer_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get customer details"""
    try:
        # Users can only view their own customer data unless they're super admin
        user_role = UserRole(current_user.get("role"))
        user_customer_id = current_user.get("customer_id")
        
        if user_role != UserRole.SUPER_ADMIN and user_customer_id != customer_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Can only view your own company data"
            )
        
        customer = await Customer.get(customer_id)
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )
        
        return CustomerResponse(
            id=str(customer.id),
            company_name=customer.company_name,
            email=customer.email,
            subscription_plan=customer.subscription_plan,
            is_active=customer.is_active,
            created_at=customer.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get customer {customer_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve customer"
        ) 
    
@router.get("/by-email/{email}", response_model=CustomerResponse)
async def get_customer_by_email(email: str):
    try:
        # logger.error(f"Fetching customer by email: {email}")
        customer = await Customer.find_one(Customer.email == email)
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Customer not found"
            )
        
        return CustomerResponse(
            id=str(customer.id),
            company_name=customer.company_name,
            email=customer.email,
            subscription_plan=customer.subscription_plan,
            is_active=customer.is_active,
            created_at=customer.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get customer by email {email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve customer"
        )