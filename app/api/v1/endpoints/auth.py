from fastapi import APIRouter, HTTPException, status, Request, Depends, Cookie
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import JSONResponse
from google.oauth2 import id_token
from google.auth.transport import requests
from loguru import logger
from datetime import datetime, timedelta
import jwt
from typing import Optional
from pydantic import BaseModel
from app.config.database import db
from app.config.settings import settings
from app.schemas.schemas import Token
from bson import ObjectId

router = APIRouter()

# Initialize OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)

class ValidationResponse(BaseModel):
    success: bool
    user: Optional[dict] = None
    message: Optional[str] = None

# Use settings from config
GOOGLE_CLIENT_ID = settings.google_client_id
JWT_SECRET = settings.jwt_secret_key
JWT_ALGORITHM = settings.jwt_algorithm
JWT_EXPIRATION = settings.jwt_expire_minutes  # Convert to hours

class GoogleCredentials(BaseModel):
    credential: str

# Token class moved to schemas.py

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=JWT_EXPIRATION))
    to_encode.update({"exp": expire})
    
    # Fixed: Use jwt instead of jwt
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

class AuthResponse(BaseModel):
    success: bool
    token: str
    user: dict

@router.post("/google", response_model=AuthResponse)
async def google_auth(credentials: GoogleCredentials):
    try:
        logger.debug("Received Google auth request")
        # Verify the Google token
        idinfo = id_token.verify_oauth2_token(
            credentials.credential, 
            requests.Request(), 
            GOOGLE_CLIENT_ID
        )
        logger.debug("Google token verified successfully")

        # Get user info from token
        user_id = idinfo['sub']
        email = idinfo['email']
        name = idinfo.get('name')
        picture = idinfo.get('picture')
        
        # Check if user exists in database
        try:
            db_user = await db.get_db()["users"].find_one({"email": email})
            if not db_user:
                # Create new user
                created_at = datetime.utcnow()
                user_data = {
                    "email": email,
                    "name": name,
                    "picture": picture,
                    "created_at": created_at,
                    "google_id": user_id,
                    "role": "recruiter",  # Default role
                    "is_active": True
                }
                result = await db.get_db()["users"].insert_one(user_data)
                # Get the complete user document
                db_user = await db.get_db()["users"].find_one({"_id": result.inserted_id})
                # Convert datetime to ISO string for JSON response            else:
                # Update existing user's info
                update_result = await db.get_db()["users"].update_one(
                    {"email": email},
                    {
                        "$set": {
                            "name": name,
                            "picture": picture,
                            "last_login": datetime.utcnow(),
                            "google_id": user_id
                        }
                    }
                )
                if not update_result.matched_count:
                    logger.error(f"Failed to update user {email}")
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Failed to update user data"
                    )
        except Exception as e:
            logger.error(f"Database error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to process user data"
            )
          # Create access token with user info
        access_token = create_access_token(
            data={
                "sub": user_id,
                "email": email,
                "name": name,
                "db_id": str(db_user["_id"]),  # Include database ID in token
                "role": db_user.get("role", "recruiter")
            }
        )
        created_at = db_user.get("created_at")
        user_data = {
            "id": str(db_user.get("_id")),
            "email": email,
            "name": name,
            "picture": picture,
            "created_at": created_at.isoformat() if created_at else None
        }

        # Create response with cookie
        response = JSONResponse(content={
            "success": True,
            "user": user_data
        })
        
        logger.debug(f"Setting auth_token cookie with max_age={JWT_EXPIRATION * 60}")
        response.set_cookie(
            key="auth_token",
            value=access_token,
            httponly=True,
            secure=True,  # True in prod
            samesite="none",
            max_age=JWT_EXPIRATION * 60,  # Convert minutes to seconds
            path="/"
        )
        logger.debug("Auth cookie set successfully")
        return response

    except ValueError as e:
        logger.error(f"Invalid Google token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google credentials"
        )
    except Exception as e:
        logger.error(f"Error in Google auth: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication failed"
        )

async def get_current_user(auth_token: str | None = Cookie(default=None)):
    logger.debug("Checking auth_token cookie")
    if not auth_token:
        logger.warning("No auth_token cookie found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    try:
        logger.debug("Decoding JWT token")
        payload = jwt.decode(auth_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        db_id = payload.get("db_id") 
        if not db_id:
            logger.warning("No db_id found in token payload")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )
        logger.debug(f"Looking up user with id {db_id}")
        user = await db.get_db()["users"].find_one({"_id": ObjectId(db_id)})
        if not user:
            logger.warning(f"No user found with id {db_id}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="User not found"
            )
        logger.debug("User validated successfully")
        return user
    except jwt.InvalidTokenError as e:
        logger.error(f"Invalid token error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

@router.get("/validate", response_model=ValidationResponse)
async def validate_token(current_user: dict = Depends(get_current_user)):
    """Validate JWT token and return user info"""
    created_at = current_user.get("created_at")
    return {
        "success": True,
        "user": {
            "id": str(current_user["_id"]),
            "email": current_user["email"],
            "name": current_user["name"],
            "picture": current_user.get("picture"),
            "created_at": created_at.isoformat() if created_at else None
        }
    }

@router.post("/logout")
async def logout():
    """Logout endpoint - clear the auth cookie."""
    response = JSONResponse(content={
        "success": True,
        "message": "Logged out successfully"
    })
    response.delete_cookie(key="auth_token", path="/")
    return response