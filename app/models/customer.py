from typing import Optional
from pydantic import Field
from pydantic import EmailStr
from enum import Enum
from datetime import datetime
from beanie import Document

class SubscriptionPlan(str, Enum):
    FREE = "free"
    STARTER = "starter"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"

class Customer(Document):
    company_name: str
    email: EmailStr
    subscription_plan: SubscriptionPlan = SubscriptionPlan.FREE
    is_active: bool = True
    
    # Company details
    website: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    class Settings:
        name = "customers"  # Collection name
        
    class Config:
        json_schema_extra = {
            "example": {
                "company_name": "TechCorp Inc",
                "email": "admin@techcorp.com",
                "subscription_plan": "starter",
                "website": "https://techcorp.com",
                "industry": "Technology"
            }
        } 