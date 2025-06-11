from pydantic_settings import BaseSettings
from typing import Optional


class VAPISettings(BaseSettings):
    """VAPI Service Configuration Settings"""
    
    # VAPI API Configuration
    vapi_api_key: str
    vapi_base_url: str = "https://api.vapi.ai"
    webhook_secret: Optional[str] = None
    
    # Twilio Configuration (required for phone calls)
    twilio_account_sid: Optional[str] = None
    twilio_auth_token: Optional[str] = None
    twilio_phone_number: Optional[str] = None  # E.164 format
    
    # Phone Number Configuration
    vapi_phone_number_id: Optional[str] = None  # Existing VAPI phone number ID
    
    # Database Configuration (shared with RecruitBot)
    mongodb_url: str
    mongodb_database: str = "recruitbot_dev"
    
    # Service Configuration
    service_host: str = "0.0.0.0"
    service_port: int = 8001
    debug: bool = False
    base_url: Optional[str] = None  # Base URL for webhook callbacks
    
    # VAPI Voice Configuration
    default_voice_provider: str = "11labs"
    default_voice_id: str = "21m00Tcm4TlvDq8ikWAM"  # Default voice
    
    # Call Configuration
    max_call_duration_seconds: int = 1800  # 30 minutes
    silence_timeout_seconds: int = 30
    recording_enabled: bool = True
    
    # Webhook Configuration
    webhook_path: str = "/webhooks/vapi"
    
    class Config:
        env_file = "vapi.env"
        case_sensitive = False


# Global settings instance
settings = VAPISettings()