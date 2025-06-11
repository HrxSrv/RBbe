#!/usr/bin/env python3
"""
VAPI Service Runner Script
Run the VAPI service for development
"""

import uvicorn
import sys
from pathlib import Path

# Add the vapi directory to Python path
vapi_dir = Path(__file__).parent
sys.path.insert(0, str(vapi_dir))

from config.settings import settings

if __name__ == "__main__":
    print(f"🚀 Starting VAPI Service...")
    print(f"📍 Host: {settings.service_host}")
    print(f"🔌 Port: {settings.service_port}")
    print(f"🐛 Debug: {settings.debug}")
    print(f"🎯 VAPI URL: {settings.vapi_base_url}")
    print("-" * 50)
    
    uvicorn.run(
        "main:app",
        host=settings.service_host,
        port=settings.service_port,
        reload=settings.debug,
        log_level="info" if not settings.debug else "debug"
    ) 