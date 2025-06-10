from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from datetime import datetime
from loguru import logger

from app.config.settings import settings
from app.config.database import db
from app.core.logging_config import setup_logging
from app.core.middleware import log_requests, setup_cors
from app.api.v1.routes import router
from app.schemas.schemas import ErrorResponse

setup_logging()

app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    version="1.0.0"
)

setup_cors(app)
app.middleware("http")(log_requests)

app.include_router(router, prefix=settings.api_v1_prefix)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}")
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            detail="Internal server error",
            status_code=500,
            timestamp=datetime.now()
        ).dict()
    )

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.app_name}"}

@app.on_event("startup")
async def startup_event():
    logger.info("Connecting to MongoDB...")
    await db.connect_db()
    logger.info("Connected to MongoDB")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Closing MongoDB connection...")
    await db.close_db()
    logger.info("MongoDB connection closed")

if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting {settings.app_name} on {settings.environment}")
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )