from fastapi import APIRouter, HTTPException, status, Request, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from google.oauth2 import id_token
from google.auth.transport import requests
from loguru import logger
from datetime import datetime, timedelta
import jwt
from typing import Optional, Annotated
from pydantic import BaseModel
from app.config.database import db
from app.config.settings import settings
from app.schemas.schemas import Token
from bson import ObjectId

router = APIRouter()

# Use HTTPBearer for Authorization header tokens
security = HTTPBearer(auto_error=False)

class ValidationResponse(BaseModel):
    success: bool
    user: Optional[dict] = None
    message: Optional[str] = None

class GoogleCredentials(BaseModel):
    credential: str

class AuthResponse(BaseModel):
    success: bool
    token: str
    user: dict
    expires_in: int  # Add token expiration info

# Configuration
GOOGLE_CLIENT_ID = settings.google_client_id
JWT_SECRET = settings.jwt_secret_key
JWT_ALGORITHM = settings.jwt_algorithm
JWT_EXPIRATION_HOURS = settings.jwt_expire_minutes / 60  # Convert to hours

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=JWT_EXPIRATION_HOURS))
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),  # Add issued at time
        "type": "access_token"     # Add token type
    })
    
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def create_refresh_token(user_id: str) -> str:
    """Create JWT refresh token (longer expiration)"""
    to_encode = {
        "sub": user_id,
        "type": "refresh_token",
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(days=30)  # 30 days for refresh
    }
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Get current user from Authorization header token"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        
        # Verify token type
        if payload.get("type") != "access_token":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        db_id = payload.get("db_id")
        if not db_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        # Fetch user from database
        user = await db.get_db()["users"].find_one({"_id": ObjectId(db_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Check if user is active
        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is disabled"
            )
        
        return user
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/google", response_model=AuthResponse)
async def google_auth(credentials: GoogleCredentials):
    """Authenticate with Google OAuth and return JWT tokens"""
    try:
        # Verify the Google token
        idinfo = id_token.verify_oauth2_token(
            credentials.credential, 
            requests.Request(), 
            GOOGLE_CLIENT_ID
        )

        # Extract user info from Google token
        user_id = idinfo['sub']
        email = idinfo['email']
        name = idinfo.get('name')
        picture = idinfo.get('picture')
        
        # Handle user creation/update
        db_user = await handle_user_auth(email, name, picture, user_id)
        
        # Create tokens
        access_token = create_access_token(
            data={
                "sub": user_id,
                "email": email,
                "name": name,
                "db_id": str(db_user["_id"]),
                "role": db_user.get("role", "recruiter")
            }
        )
        
        refresh_token = create_refresh_token(user_id)
        
        # Prepare user data for response
        user_data = {
            "id": str(db_user["_id"]),
            "email": email,
            "name": name,
            "picture": picture,
            "role": db_user.get("role", "recruiter"),
            "created_at": db_user.get("created_at").isoformat() if db_user.get("created_at") else None
        }

        return AuthResponse(
            success=True,
            token=access_token,
            user=user_data,
            expires_in=int(JWT_EXPIRATION_HOURS * 3600)  # Convert to seconds
        )

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

async def handle_user_auth(email: str, name: str, picture: str, google_id: str) -> dict:
    """Handle user creation or update during authentication"""
    try:
        db_user = await db.get_db()["users"].find_one({"email": email})
        
        if not db_user:
            # Create new user
            user_data = {
                "email": email,
                "name": name,
                "picture": picture,
                "google_id": google_id,
                "role": "recruiter",
                "is_active": True,
                "created_at": datetime.utcnow(),
                "last_login": datetime.utcnow()
            }
            result = await db.get_db()["users"].insert_one(user_data)
            db_user = await db.get_db()["users"].find_one({"_id": result.inserted_id})
        else:
            # Update existing user
            await db.get_db()["users"].update_one(
                {"email": email},
                {
                    "$set": {
                        "name": name,
                        "picture": picture,
                        "google_id": google_id,
                        "last_login": datetime.utcnow()
                    }
                }
            )
            # Refresh user data
            db_user = await db.get_db()["users"].find_one({"email": email})
        
        return db_user
        
    except Exception as e:
        logger.error(f"Database error during user auth: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process user data"
        )

@router.post("/refresh")
async def refresh_token(refresh_token: str = Header(..., alias="X-Refresh-Token")):
    """Refresh access token using refresh token"""
    try:
        payload = jwt.decode(refresh_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        
        if payload.get("type") != "refresh_token":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        user_id = payload.get("sub")
        user = await db.get_db()["users"].find_one({"google_id": user_id})
        
        if not user or not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        # Create new access token
        new_access_token = create_access_token({
            "sub": user_id,
            "email": user["email"],
            "name": user["name"],
            "db_id": str(user["_id"]),
            "role": user.get("role", "recruiter")
        })
        
        return {
            "access_token": new_access_token,
            "token_type": "bearer",
            "expires_in": int(JWT_EXPIRATION_HOURS * 3600)
        }
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

@router.get("/validate", response_model=ValidationResponse)
async def validate_token(current_user: dict = Depends(get_current_user)):
    """Validate JWT token and return user info"""
    created_at = current_user.get("created_at")
    return ValidationResponse(
        success=True,
        user={
            "id": str(current_user["_id"]),
            "email": current_user["email"],
            "name": current_user["name"],
            "picture": current_user.get("picture"),
            "role": current_user.get("role", "recruiter"),
            "created_at": created_at.isoformat() if created_at else None
        }
    )

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """Logout endpoint - invalidate token on server side if needed"""
    # For stateless JWT, you might want to implement a token blacklist
    # or just return success since client will remove the token
    
    # Optional: Update last_logout timestamp
    try:
        await db.get_db()["users"].update_one(
            {"_id": current_user["_id"]},
            {"$set": {"last_logout": datetime.utcnow()}}
        )
    except Exception as e:
        logger.warning(f"Failed to update logout timestamp: {str(e)}")
    
    return {"success": True, "message": "Logged out successfully"}

# Optional: Admin endpoint to check user tokens
@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    return {
        "id": str(current_user["_id"]),
        "email": current_user["email"],
        "name": current_user["name"],
        "picture": current_user.get("picture"),
        "role": current_user.get("role"),
        "created_at": current_user.get("created_at").isoformat() if current_user.get("created_at") else None,
        "last_login": current_user.get("last_login").isoformat() if current_user.get("last_login") else None
    }