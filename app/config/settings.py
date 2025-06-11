from pydantic_settings import BaseSettings
from typing import Literal
import os

class Settings(BaseSettings):
    app_name: str = "RecruitBot"
    environment: Literal["dev", "staging", "prod"] = "dev"
    debug: bool = False
    host: str = "0.0.0.0"
    port: int = 8000
    base_url: str = "http://localhost:8000"  # Will be different in staging/prod
    
    # MongoDB settings
    mongodb_url: str 
    mongodb_database: str = "recruitbot_dev"
    
    # Google OAuth settings
    google_client_id: str
    google_client_secret: str
    google_oauth_redirect_path: str = "/api/v1/auth/google/callback"
    
    # Google OAuth endpoints
    google_auth_uri: str = "https://accounts.google.com/o/oauth2/auth"
    google_token_uri: str = "https://oauth2.googleapis.com/token"
      # Gemini AI settings
    gemini_api_key: str  # Required - Gemini API key for language model
    
    # Opik tracking settings
    opik_api_key: str = ""  # Optional - for LLM tracking
    opik_workspace: str = ""  # Optional - Opik workspace
    opik_project_name: str = "resume-analysis"  # Default project name
    
    @property
    def google_redirect_uri(self) -> str:
        return f"{self.base_url}{self.google_oauth_redirect_path}"
    
    # JWT settings
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24  # 24 hours
    
    log_level: str = "INFO"
    log_file: str = "app.log"
    
    api_v1_prefix: str = "/api/v1"
    
    # CORS settings
    cors_origins: list[str] = ["http://localhost:3000","https://vfoundry-test-app.vercel.app/"]  # Frontend URL
    cors_allow_credentials: bool = True
    cors_allow_methods: list[str] = ["*"]
    cors_allow_headers: list[str] = ["*"]
    
    class Config:
        env_file = f".env.{os.getenv('ENVIRONMENT', 'dev')}"
        env_file_encoding = 'utf-8'

settings = Settings()