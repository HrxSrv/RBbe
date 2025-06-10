from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from app.config.settings import settings
from fastapi import HTTPException, status
import json

class GoogleOAuth:
    SCOPES = [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "openid"
    ]
    
    @staticmethod
    def create_flow() -> Flow:
        client_config = {
            "web": {
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "auth_uri": settings.google_auth_uri,
                "token_uri": settings.google_token_uri,
                "redirect_uri": settings.google_redirect_uri,
            }
        }
        
        return Flow.from_client_config(
            client_config,
            scopes=GoogleOAuth.SCOPES,
            redirect_uri=settings.google_redirect_uri
        )
    
    @staticmethod
    def get_auth_url() -> str:
        flow = GoogleOAuth.create_flow()
        auth_url, _ = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true'
        )
        return auth_url
