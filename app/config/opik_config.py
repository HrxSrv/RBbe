import os
from typing import Dict, Any, Optional
from loguru import logger
from app.config.settings import settings

# Opik configuration and initialization
try:
    import opik
    from opik import configure, track
    OPIK_AVAILABLE = True
except ImportError:
    OPIK_AVAILABLE = False
    logger.warning("Opik not available. Install with: pip install opik")

class OpikConfig:
    """
    Opik configuration and utility class for LLM tracking.
    """
    
    _initialized = False
    _configuration_valid = False
    
    @classmethod
    def initialize(cls) -> bool:
        """
        Initialize Opik with configuration from settings.
        Returns True if initialization successful, False otherwise.
        """
        if cls._initialized:
            return cls._configuration_valid
        
        if not OPIK_AVAILABLE:
            logger.warning("Opik not available - LLM tracking disabled")
            cls._initialized = True
            cls._configuration_valid = False
            return False
        
        try:
            # Set environment variables for Opik if they're provided in settings
            if settings.opik_api_key:
                os.environ["OPIK_API_KEY"] = settings.opik_api_key
            
            if settings.opik_workspace:
                os.environ["OPIK_WORKSPACE"] = settings.opik_workspace
            
            if settings.opik_project_name:
                os.environ["OPIK_PROJECT_NAME"] = settings.opik_project_name
            
            # Try to configure Opik
            configure()
            
            logger.info(f"Opik initialized successfully for project: {settings.opik_project_name}")
            cls._initialized = True
            cls._configuration_valid = True
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize Opik: {e}")
            logger.warning("LLM tracking will be disabled")
            cls._initialized = True
            cls._configuration_valid = False
            return False
    
    @classmethod
    def is_available(cls) -> bool:
        """
        Check if Opik is available and properly configured.
        """
        if not cls._initialized:
            cls.initialize()
        return OPIK_AVAILABLE and cls._configuration_valid
    
    @classmethod
    def get_project_info(cls) -> Dict[str, str]:
        """
        Get current Opik project information.
        """
        return {
            "workspace": settings.opik_workspace or "default",
            "project": settings.opik_project_name or "resume-analysis",
            "available": cls.is_available()
        }
    
    @classmethod
    def log_tracking_event(cls, event_type: str, metadata: Dict[str, Any]):
        """
        Log tracking events for debugging purposes.
        """
        if logger.level("DEBUG").no <= logger._min_level:
            logger.debug(f"Opik tracking event: {event_type}, metadata: {metadata}")

# Initialize Opik on module import
def auto_initialize_opik():
    """
    Automatically initialize Opik when the module is imported.
    This ensures Opik is ready when GeminiService is used.
    """
    try:
        success = OpikConfig.initialize()
        if success:
            logger.info("Opik auto-initialization completed successfully")
        else:
            logger.info("Opik auto-initialization skipped (not available or configured)")
    except Exception as e:
        logger.warning(f"Opik auto-initialization failed: {e}")

# Auto-initialize when module is imported
auto_initialize_opik() 