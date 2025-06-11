from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.config.settings import settings
from loguru import logger

class MongoDB:
    client: AsyncIOMotorClient = None
    
    @classmethod
    async def connect_db(cls):
        logger.info(f"Attempting to connect to MongoDB at: {settings.mongodb_url}")
        logger.info(f"Database name: {settings.mongodb_database}")
        try:
            cls.client = AsyncIOMotorClient(settings.mongodb_url)
            # Test the connection
            await cls.client.admin.command('ping')
            logger.success("Successfully connected to MongoDB")
            
            # Initialize Beanie with models
            from app.models import Customer, User, Job, Candidate, Call, Prompt
            
            await init_beanie(
                database=cls.client[settings.mongodb_database],
                document_models=[Customer, User, Job, Candidate, Call, Prompt]
            )
            logger.success("Beanie ODM initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB or initialize Beanie: {str(e)}")
            raise
        
    @classmethod
    async def close_db(cls):
        if cls.client is not None:
            logger.info("Closing MongoDB connection")
            cls.client.close()
            logger.success("MongoDB connection closed successfully")
            
    @classmethod
    def get_db(cls):
        return cls.client[settings.mongodb_database]

db = MongoDB()