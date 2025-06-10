from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2AuthorizationCodeBearer
from app.config.settings import settings
from app.config.database import db
from jose import JWTError, jwt
from datetime import datetime
from bson import ObjectId

oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl=f"{settings.base_url}{settings.api_v1_prefix}/auth/google/login",
    tokenUrl=f"{settings.base_url}{settings.api_v1_prefix}/auth/google/callback"
)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            token, 
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
        
    user = await db.get_db()["users"].find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise credentials_exception
        
    return user
