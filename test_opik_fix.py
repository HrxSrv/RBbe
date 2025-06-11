#!/usr/bin/env python3
"""
Simple test to validate Opik tracking fixes.
"""

import asyncio
import os

# Set up environment for testing
os.environ["ENVIRONMENT"] = "dev"

async def test_opik_tracking_fix():
    """Test the Opik tracking fixes we made."""
    print("🔧 Testing Opik tracking fixes...")
    
    # Test 1: Import fixes
    try:
        from app.services.gemini_service import GeminiService
        from app.services.text_extraction import TextExtractionResult
        from app.config.opik_config import OpikConfig
        print("✅ Import test passed")
    except Exception as e:
        print(f"❌ Import test failed: {e}")
        return False
    
    # Test 2: TextExtractionResult constructor fix
    try:
        extraction_result = TextExtractionResult(
            text="Test resume text",
            method="direct_text",
            confidence=0.95,
            metadata={"source": "test", "page_count": 1},
            needs_vlm_processing=False
        )
        print("✅ TextExtractionResult constructor test passed")
        print(f"   - Text length: {len(extraction_result.text)}")
        print(f"   - Method: {extraction_result.method}")
        print(f"   - Confidence: {extraction_result.confidence}")
    except Exception as e:
        print(f"❌ TextExtractionResult constructor test failed: {e}")
        return False
    
    # Test 3: Opik configuration
    try:
        opik_info = OpikConfig.get_project_info()
        print("✅ Opik configuration test passed")
        print(f"   - Available: {opik_info['available']}")
        print(f"   - Workspace: {opik_info['workspace']}")
        print(f"   - Project: {opik_info['project']}")
    except Exception as e:
        print(f"❌ Opik configuration test failed: {e}")
        return False
    
    # Test 4: Service availability (should not crash)
    try:
        availability = await GeminiService.test_service_availability()
        print("✅ Service availability test passed")
        print(f"   - Available: {availability.get('available', False)}")
        if not availability.get('available'):
            print(f"   - Note: {availability.get('error', 'Service not available')}")
    except Exception as e:
        print(f"❌ Service availability test failed: {e}")
        print(f"   - This is expected if Gemini API key is not configured")
    
    print("\n🎉 All basic tests completed!")
    print("💡 You can now run the full test suite with: python test_gemini_opik_integration.py")
    
    return True

if __name__ == "__main__":
    asyncio.run(test_opik_tracking_fix()) 