from typing import Optional, Dict, Any, List
from pydantic import Field, validator
from enum import Enum
from datetime import datetime
from beanie import Document

class PromptType(str, Enum):
    VAPI_INTERVIEW = "vapi_interview"
    VAPI_FIRST_MESSAGE = "vapi_first_message"
    GEMINI_RESUME_TEXT = "gemini_resume_text"
    GEMINI_RESUME_VISION = "gemini_resume_vision"
    GEMINI_QA_ASSESSMENT = "gemini_qa_assessment"

class PromptStatus(str, Enum):
    ACTIVE = "active"
    DRAFT = "draft"
    ARCHIVED = "archived"

class Prompt(Document):
    """
    Model for storing AI prompts used across the platform.
    Supports versioning, A/B testing, and metadata tracking.
    """
    
    # Core prompt info
    name: str = Field(..., description="Human-readable prompt name")
    prompt_type: PromptType = Field(..., description="Type of prompt (VAPI, Gemini, etc.)")
    content: str = Field(..., description="The actual prompt content with placeholders")
    description: Optional[str] = Field(None, description="Description of what this prompt does")
    
    # Versioning
    version: str = Field(default="1.0", description="Prompt version (semantic versioning)")
    parent_prompt_id: Optional[str] = Field(None, description="ID of parent prompt if this is a version")
    
    # Status and lifecycle
    status: PromptStatus = Field(default=PromptStatus.ACTIVE, description="Current status")
    is_default: bool = Field(default=False, description="Whether this is the default prompt for this type")
    
    # Metadata and configuration
    variables: List[str] = Field(default=[], description="List of variable placeholders in the prompt")
    tags: List[str] = Field(default=[], description="Tags for categorization and search")
    metadata: Dict[str, Any] = Field(default={}, description="Additional metadata")
    
    # Usage tracking
    usage_count: int = Field(default=0, description="Number of times this prompt has been used")
    success_rate: Optional[float] = Field(None, description="Success rate if tracked")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    last_used_at: Optional[datetime] = None
    
    # Owner information
    created_by: Optional[str] = Field(None, description="User ID who created this prompt")
    customer_id: Optional[str] = Field(None, description="Customer ID if prompt is customer-specific")
    
    class Settings:
        name = "prompts"
        indexes = [
            "prompt_type",
            "status",
            "is_default",
            "customer_id",
            [("prompt_type", 1), ("status", 1), ("is_default", -1)],  # Compound index for efficient queries
        ]
    
    @validator('variables', pre=True, always=True)
    def extract_variables_from_content(cls, v, values):
        """Auto-extract variables from prompt content if not provided"""
        if not v and 'content' in values:
            import re
            content = values['content']
            # Find variables in {variable_name} format
            variables = re.findall(r'\{(\w+)\}', content)
            return list(set(variables))  # Remove duplicates
        return v
    
    @validator('version')
    def validate_version_format(cls, v):
        """Validate semantic versioning format"""
        import re
        if not re.match(r'^\d+\.\d+(\.\d+)?$', v):
            raise ValueError('Version must be in semantic versioning format (e.g., "1.0" or "1.0.1")')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Default Interview System Prompt",
                "prompt_type": "vapi_interview",
                "content": "You are a professional AI interviewer for {company_name}. The position is {job_title}...",
                "description": "Standard system prompt for VAPI interview assistants",
                "version": "1.0",
                "status": "active",
                "is_default": True,
                "variables": ["company_name", "job_title", "requirements"],
                "tags": ["interview", "vapi", "default"]
            }
        }
    
    async def increment_usage(self):
        """Increment usage count and update last used timestamp"""
        await self.set({
            "usage_count": self.usage_count + 1,
            "last_used_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
    
    async def update_success_rate(self, success: bool):
        """Update success rate based on usage feedback"""
        if self.success_rate is None:
            self.success_rate = 1.0 if success else 0.0
        else:
            # Simple running average - in production, you might want more sophisticated tracking
            total_uses = self.usage_count or 1
            current_total = self.success_rate * total_uses
            new_total = current_total + (1.0 if success else 0.0)
            self.success_rate = new_total / (total_uses + 1)
        
        await self.set({
            "success_rate": self.success_rate,
            "updated_at": datetime.utcnow()
        })
    
    @classmethod
    async def get_default_prompt(cls, prompt_type: PromptType, customer_id: Optional[str] = None) -> Optional["Prompt"]:
        """Get the default prompt for a specific type, with customer-specific override support"""
        
        # First try to find customer-specific default prompt
        if customer_id:
            customer_prompt = await cls.find_one({
                "prompt_type": prompt_type,
                "status": PromptStatus.ACTIVE,
                "is_default": True,
                "customer_id": customer_id
            })
            if customer_prompt:
                return customer_prompt
        
        # Fall back to global default prompt
        global_prompt = await cls.find_one({
            "prompt_type": prompt_type,
            "status": PromptStatus.ACTIVE,
            "is_default": True,
            "customer_id": None  # Global prompts have null customer_id
        })
        
        return global_prompt
    
    @classmethod
    async def get_active_prompts(cls, prompt_type: PromptType, customer_id: Optional[str] = None) -> List["Prompt"]:
        """Get all active prompts for a specific type"""
        query = {
            "prompt_type": prompt_type,
            "status": PromptStatus.ACTIVE
        }
        
        if customer_id:
            # Get both customer-specific and global prompts
            query["$or"] = [
                {"customer_id": customer_id},
                {"customer_id": None}
            ]
        else:
            query["customer_id"] = None
        
        return await cls.find(query).to_list()
    
    def render_prompt(self, variables: Dict[str, Any]) -> str:
        """Render prompt content with provided variables"""
        try:
            return self.content.format(**variables)
        except KeyError as e:
            missing_var = str(e).strip("'\"")
            raise ValueError(f"Missing required variable: {missing_var}")
        except Exception as e:
            raise ValueError(f"Error rendering prompt: {str(e)}") 