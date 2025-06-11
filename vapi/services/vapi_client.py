import httpx
import json
from typing import Dict, Any, Optional, List
from loguru import logger

from config.settings import settings
from models.vapi_models import (
    VAPIAssistantRequest, 
    VAPIAssistantResponse, 
    VAPICallRequest, 
    VAPICallResponse
)


class VAPIClient:
    """VAPI API Client for managing assistants and calls"""
    
    def __init__(self):
        self.base_url = settings.vapi_base_url
        self.api_key = settings.vapi_api_key
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    async def test_connection(self) -> bool:
        """Test VAPI API connectivity"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/assistant",
                    headers=self.headers,
                    timeout=10.0
                )
                success = response.status_code == 200
                logger.info(f"VAPI connection test: {'SUCCESS' if success else 'FAILED'} (Status: {response.status_code})")
                return success
        except Exception as e:
            logger.error(f"VAPI connection test failed: {e}")
            return False
    
    async def create_assistant(self, assistant_data: VAPIAssistantRequest) -> Optional[VAPIAssistantResponse]:
        """Create a new VAPI assistant"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/assistant",
                    headers=self.headers,
                    json=assistant_data.model_dump(exclude_none=True),
                    timeout=30.0
                )
                
                if response.status_code == 201:
                    data = response.json()
                    logger.info(f"Assistant created successfully: {data.get('id')}")
                    return VAPIAssistantResponse(**data)
                else:
                    logger.error(f"Failed to create assistant: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error creating assistant: {e}")
            return None
    
    async def get_assistant(self, assistant_id: str) -> Optional[Dict[str, Any]]:
        """Get assistant details by ID"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/assistant/{assistant_id}",
                    headers=self.headers,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    logger.info(f"Retrieved assistant: {assistant_id}")
                    return data
                else:
                    logger.error(f"Failed to get assistant {assistant_id}: {response.status_code}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error getting assistant {assistant_id}: {e}")
            return None
    
    async def list_assistants(self) -> List[Dict[str, Any]]:
        """List all assistants"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/assistant",
                    headers=self.headers,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    logger.info(f"Retrieved {len(data)} assistants")
                    return data
                else:
                    logger.error(f"Failed to list assistants: {response.status_code}")
                    return []
                    
        except Exception as e:
            logger.error(f"Error listing assistants: {e}")
            return []
    
    async def delete_assistant(self, assistant_id: str) -> bool:
        """Delete an assistant"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.delete(
                    f"{self.base_url}/assistant/{assistant_id}",
                    headers=self.headers,
                    timeout=10.0
                )
                
                success = response.status_code == 200
                if success:
                    logger.info(f"Assistant deleted successfully: {assistant_id}")
                else:
                    logger.error(f"Failed to delete assistant {assistant_id}: {response.status_code}")
                return success
                
        except Exception as e:
            logger.error(f"Error deleting assistant {assistant_id}: {e}")
            return False
    
    async def initiate_call(self, call_data: VAPICallRequest) -> Optional[VAPICallResponse]:
        """Initiate a call using VAPI"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/call",
                    headers=self.headers,
                    json=call_data.model_dump(exclude_none=True),
                    timeout=30.0
                )
                
                if response.status_code == 201:
                    data = response.json()
                    logger.info(f"Call initiated successfully: {data.get('id')}")
                    return VAPICallResponse(**data)
                else:
                    logger.error(f"Failed to initiate call: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error initiating call: {e}")
            return None
    
    async def get_call(self, call_id: str) -> Optional[Dict[str, Any]]:
        """Get call details by ID"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/call/{call_id}",
                    headers=self.headers,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    logger.info(f"Retrieved call: {call_id}")
                    return data
                else:
                    logger.error(f"Failed to get call {call_id}: {response.status_code}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error getting call {call_id}: {e}")
            return None