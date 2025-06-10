from typing import Optional, TYPE_CHECKING
from pydantic import EmailStr, Field
from enum import Enum
from datetime import datetime
from beanie import Document, Link

if TYPE_CHECKING:
    from .customer import Customer

class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    COMPANY_ADMIN = "company_admin"
    RECRUITER = "recruiter"
    VIEWER = "viewer"

class User(Document):
    customer_id: Link["Customer"]  # Reference to Customer using Beanie Link
    email: EmailStr
    name: str
    role: UserRole = UserRole.RECRUITER
    is_active: bool = True
    
    # OAuth info
    google_id: Optional[str] = None
    picture: Optional[str] = None
    last_login: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    class Settings:
        name = "users"  # Collection name
    
    class Config:
        json_schema_extra = {
            "example": {
                "customer_id": "507f1f77bcf86cd799439011",
                "email": "john@techcorp.com",
                "name": "John Doe",
                "role": "recruiter"
            }
        }
