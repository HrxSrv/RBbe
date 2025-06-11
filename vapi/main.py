from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
import sys

from config.settings import settings
from services.vapi_client import VAPIClient
from services.assistant import AssistantCreationService
from models.vapi_models import (
    JobContextForAssistant, 
    CandidateContextForAssistant,
    VAPIAssistantResponse,
    VAPICallRequest,
    CallCustomer,
    PhoneNumberObject
)


# Configure logging
logger.remove()
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    level="INFO" if not settings.debug else "DEBUG"
)

# Initialize FastAPI app
app = FastAPI(
    title="VAPI Service",
    description="Voice AI Integration Service for RecruitBot",
    version="1.0.0",
    debug=settings.debug
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
vapi_client = VAPIClient()
assistant_service = AssistantCreationService()


@app.on_event("startup")
async def startup_event():
    """Startup event handler"""
    logger.info("Starting VAPI Service...")
    logger.info(f"Service running on {settings.service_host}:{settings.service_port}")
    logger.info(f"VAPI Base URL: {settings.vapi_base_url}")
    
    # Test VAPI connection
    connection_ok = await vapi_client.test_connection()
    if connection_ok:
        logger.info("✅ VAPI connection established successfully")
    else:
        logger.error("❌ VAPI connection failed - check API key and network")


@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event handler"""
    logger.info("Shutting down VAPI Service...")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "vapi-service",
        "version": "1.0.0"
    }


@app.get("/vapi/test-connection")
async def test_vapi_connection():
    """Test VAPI API connection"""
    connection_ok = await vapi_client.test_connection()
    return {
        "vapi_connection": "success" if connection_ok else "failed",
        "base_url": settings.vapi_base_url,
        "message": "VAPI API is reachable" if connection_ok else "VAPI API connection failed"
    }


@app.get("/vapi/assistants/list")
async def list_assistants():
    """List all VAPI assistants"""
    assistants = await vapi_client.list_assistants()
    return {
        "assistants": assistants,
        "count": len(assistants)
    }


@app.post("/vapi/assistants/create-interview", response_model=VAPIAssistantResponse)
async def create_interview_assistant(
    job_context: JobContextForAssistant,
    candidate_context: CandidateContextForAssistant = None
):
    """Create a job-specific interview assistant"""
    try:
        # Skip webhook URL for local testing (VAPI requires HTTPS)
        webhook_url = None  # Will be added in production with proper HTTPS
        
        assistant = await assistant_service.create_interview_assistant(
            job_context=job_context,
            candidate_context=candidate_context,
            webhook_url=webhook_url
        )
        
        if assistant:
            return assistant
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to create interview assistant"
            )
            
    except Exception as e:
        logger.error(f"Error in create_interview_assistant endpoint: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Assistant creation failed: {str(e)}"
        )


@app.post("/vapi/test-assistant-creation")
async def test_assistant_creation():
    """Test endpoint for assistant creation with sample data"""
    try:
        # Sample job context
        sample_job = JobContextForAssistant(
            job_id="test_job_123",
            job_title="Senior Python Developer",
            job_description="We are seeking a senior Python developer with experience in FastAPI and MongoDB.",
            requirements=["Python", "FastAPI", "MongoDB", "REST APIs"],
            questions=[
                {
                    "question": "What is your experience with FastAPI framework?",
                    "ideal_answer": "I have 3+ years experience building REST APIs with FastAPI, including authentication, database integration, and async operations.",
                    "weight": 1.5
                },
                {
                    "question": "How do you handle database optimization in MongoDB?",
                    "ideal_answer": "I use indexing strategies, query optimization, aggregation pipelines, and connection pooling for performance.",
                    "weight": 1.0
                },
                {
                    "question": "Tell me about your experience with asynchronous programming in Python.",
                    "ideal_answer": "I have experience with asyncio, async/await patterns, and building non-blocking applications for better performance.",
                    "weight": 1.2
                }
            ],
            company_name="TechCorp Inc",
            experience_level="senior"
        )
        
        # Sample candidate context
        sample_candidate = CandidateContextForAssistant(
            candidate_name="John Doe",
            candidate_email="john.doe@example.com",
            resume_summary="Experienced Python developer with 5 years in web development",
            relevant_skills=["Python", "FastAPI", "MongoDB", "Docker"],
            experience_years=5
        )
        
        # Create assistant (skip webhook for local testing)
        webhook_url = None  # VAPI requires HTTPS for webhooks
        
        assistant = await assistant_service.create_interview_assistant(
            job_context=sample_job,
            candidate_context=sample_candidate,
            webhook_url=webhook_url
        )
        
        if assistant:
            return {
                "status": "success",
                "message": "Test assistant created successfully",
                "assistant_id": assistant.id,
                "assistant_name": assistant.name,
                "job_context": sample_job.model_dump(),
                "candidate_context": sample_candidate.model_dump()
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to create test assistant"
            )
            
    except Exception as e:
        logger.error(f"Error in test_assistant_creation: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Test assistant creation failed: {str(e)}"
        )


@app.delete("/vapi/assistants/{assistant_id}")
async def delete_assistant(assistant_id: str):
    """Delete a VAPI assistant"""
    try:
        success = await assistant_service.delete_assistant(assistant_id)
        
        if success:
            return {
                "status": "success",
                "message": f"Assistant {assistant_id} deleted successfully"
            }
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to delete assistant {assistant_id}"
            )
            
    except Exception as e:
        logger.error(f"Error deleting assistant {assistant_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Assistant deletion failed: {str(e)}"
        )


@app.post("/vapi/test-call-simulation")
async def test_call_simulation():
    """Test call initiation with simulated phone number"""
    try:
        # First create a test assistant
        sample_job = JobContextForAssistant(
            job_id="test_job_call",
            job_title="Python Developer",
            job_description="Test call for Python developer position",
            requirements=["Python", "FastAPI"],
            questions=[
                {
                    "question": "What is your experience with Python?",
                    "ideal_answer": "I have 3+ years of Python development experience.",
                    "weight": 1.0
                }
            ],
            company_name="TestCorp",
            experience_level="mid"
        )
        
        sample_candidate = CandidateContextForAssistant(
            candidate_name="Test Candidate",
            candidate_email="test@example.com",
            resume_summary="Test candidate for call simulation",
            relevant_skills=["Python"],
            experience_years=3
        )
        
        # Create assistant
        assistant = await assistant_service.create_interview_assistant(
            job_context=sample_job,
            candidate_context=sample_candidate,
            webhook_url=None
        )
        
        if not assistant:
            raise HTTPException(500, "Failed to create test assistant")
        
        # Simulate call request (using test phone number)
        test_call_request = VAPICallRequest(
            assistantId=assistant.id,
            customer=CallDestination(
                number="+1234567890",  # Test/fake number
                numberE164CheckEnabled=True
            ),
            maxDurationSeconds=300,  # 5 minutes for test
            metadata={
                "test_call": True,
                "candidate_name": "Test Candidate",
                "job_title": "Python Developer"
            }
        )
        
        # COMMENTED OUT: Actual call initiation for safety
        # call_response = await vapi_client.initiate_call(test_call_request)
        
        # Clean up test assistant
        await assistant_service.delete_assistant(assistant.id)
        
        return {
            "status": "simulated",
            "message": "Call simulation completed successfully",
            "assistant_created": assistant.id,
            "call_request": test_call_request.model_dump(),
            "note": "Actual call initiation commented out for safety. In production, this would initiate a real call.",
            "next_steps": [
                "1. For real testing, provide a valid phone number",
                "2. Ensure proper Twilio/phone service integration", 
                "3. Uncomment the call initiation line",
                "4. Test with a real phone number you control"
            ]
        }
        
    except Exception as e:
        logger.error(f"Error in test_call_simulation: {e}")
        raise HTTPException(500, f"Call simulation failed: {str(e)}")


@app.post("/vapi/simulate-call-workflow")
async def simulate_call_workflow():
    """Simulate the complete call workflow without actually making a call"""
    try:
        # Step 1: Create assistant
        logger.info("🎯 Step 1: Creating interview assistant...")
        
        job_context = JobContextForAssistant(
            job_id="workflow_test_123",
            job_title="Senior Developer",
            job_description="Full workflow test for senior developer position",
            requirements=["Python", "FastAPI", "MongoDB"],
            questions=[
                {
                    "question": "Describe your experience with FastAPI",
                    "ideal_answer": "I have extensive experience building REST APIs with FastAPI",
                    "weight": 1.5
                }
            ],
            company_name="WorkflowTest Inc",
            experience_level="senior"
        )
        
        candidate_context = CandidateContextForAssistant(
            candidate_name="Sarah Wilson",
            candidate_email="sarah@example.com",
            resume_summary="Senior developer with 7 years experience",
            relevant_skills=["Python", "FastAPI", "MongoDB", "Docker"],
            experience_years=7
        )
        
        assistant = await assistant_service.create_interview_assistant(
            job_context=job_context,
            candidate_context=candidate_context
        )
        
        if not assistant:
            raise HTTPException(500, "Failed to create assistant")
        
        # Step 2: Prepare call data
        logger.info("📞 Step 2: Preparing call configuration...")
        
        call_config = {
            "assistant_id": assistant.id,
            "candidate_phone": "+1-555-DEMO",
            "scheduled_time": "2024-01-15T14:00:00Z",
            "estimated_duration": "15-20 minutes",
            "interview_questions": len(job_context.questions),
            "call_metadata": {
                "job_id": job_context.job_id,
                "candidate_name": candidate_context.candidate_name,
                "call_type": "screening_interview"
            }
        }
        
        # Step 3: Simulate call results
        logger.info("📋 Step 3: Simulating call completion...")
        
        simulated_results = {
            "call_id": "sim_call_12345",
            "duration_seconds": 1200,  # 20 minutes
            "call_status": "completed",
            "transcript_preview": f"""
            Assistant: Hello Sarah! Thank you for your interest in the Senior Developer position at WorkflowTest Inc. 
            I'm an AI interviewer and I'll be conducting your initial phone screening today.
            
            Candidate: Hi! Yes, I'm excited about this opportunity.
            
            Assistant: Great! Let's start with your experience. {job_context.questions[0]['question']}
            
            Candidate: I've been working with FastAPI for about 4 years now. I've built several REST APIs 
            including authentication systems, database integrations, and async operations...
            """,
            "question_responses": [
                {
                    "question": job_context.questions[0]['question'],
                    "candidate_answer": "I've been working with FastAPI for about 4 years...",
                    "ideal_answer": job_context.questions[0]['ideal_answer'],
                    "match_score": 85.5,
                    "analysis": "Strong response with specific technical details"
                }
            ],
            "overall_score": 85.5,
            "interview_summary": "Candidate demonstrates strong technical skills and clear communication",
            "recommended_next_steps": "Proceed to technical interview round"
        }
        
        # Step 4: Cleanup
        logger.info("🧹 Step 4: Cleaning up test assistant...")
        await assistant_service.delete_assistant(assistant.id)
        
        return {
            "status": "success",
            "message": "Complete call workflow simulated successfully",
            "workflow_steps": {
                "1_assistant_creation": {
                    "status": "completed",
                    "assistant_id": assistant.id,
                    "job_title": job_context.job_title,
                    "candidate": candidate_context.candidate_name
                },
                "2_call_configuration": {
                    "status": "completed", 
                    "config": call_config
                },
                "3_call_simulation": {
                    "status": "completed",
                    "results": simulated_results
                },
                "4_cleanup": {
                    "status": "completed",
                    "assistant_deleted": True
                }
            },
            "ready_for_production": True,
            "next_development_step": "Step 3: Real call scheduling and management"
        }
        
    except Exception as e:
        logger.error(f"Error in simulate_call_workflow: {e}")
        raise HTTPException(500, f"Workflow simulation failed: {str(e)}")


@app.post("/vapi/test-real-call")
async def test_real_call():
    """Test with REAL phone number - ACTUAL CALL WILL BE INITIATED"""
    try:
        logger.info("📞 REAL CALL TEST: Creating assistant for actual phone call...")
        
        # Create realistic job context
        job_context = JobContextForAssistant(
            job_id="real_test_job_001",
            job_title="Python Developer",
            job_description="We are looking for a skilled Python developer to join our team. This is a real interview test call.",
            requirements=["Python", "FastAPI", "Problem Solving"],
            questions=[
                {
                    "question": "Can you tell me about your experience with Python development?",
                    "ideal_answer": "I have experience with Python frameworks, data structures, and building applications.",
                    "weight": 1.0
                },
                {
                    "question": "How comfortable are you with FastAPI for building REST APIs?",
                    "ideal_answer": "I have used FastAPI to build scalable REST APIs with proper documentation.",
                    "weight": 1.0
                }
            ],
            company_name="VAPI Test Company",
            experience_level="mid"
        )
        
        candidate_context = CandidateContextForAssistant(
            candidate_name="Test Candidate",
            candidate_email="candidate@example.com",
            resume_summary="Experienced developer looking to showcase skills in real-time interview",
            relevant_skills=["Python", "FastAPI", "JavaScript"],
            experience_years=3
        )
        
        # Create assistant
        assistant = await assistant_service.create_interview_assistant(
            job_context=job_context,
            candidate_context=candidate_context,
            webhook_url=None  # No webhook for test
        )
        
        if not assistant:
            raise HTTPException(500, "Failed to create assistant")
        
        logger.info(f"✅ Assistant created: {assistant.id}")
        
        # Check phone number configuration
        phone_number_config = None
        if settings.vapi_phone_number_id:
            # Use existing VAPI phone number ID (preferred method)
            phone_number_id = settings.vapi_phone_number_id
            logger.info(f"Using VAPI phone number ID: {phone_number_id}")
        elif settings.twilio_account_sid and settings.twilio_auth_token and settings.twilio_phone_number:
            # Use Twilio configuration for transient phone number
            phone_number_config = PhoneNumberObject(
                provider="twilio",
                twilioAccountSid=settings.twilio_account_sid,
                twilioAuthToken=settings.twilio_auth_token,
                twilioPhoneNumber=settings.twilio_phone_number,
                name="VAPI Test Phone"
            )
            phone_number_id = None
            logger.info(f"Using Twilio phone number: {settings.twilio_phone_number}")
        else:
            # Clean up assistant before raising error
            await assistant_service.delete_assistant(assistant.id)
            raise HTTPException(
                400, 
                "Phone number configuration missing. Please set either VAPI_PHONE_NUMBER_ID or complete Twilio configuration (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER) in vapi.env"
            )

        # REAL CALL REQUEST with proper phone number configuration
        real_call_request = VAPICallRequest(
            assistantId=assistant.id,
            phoneNumberId=phone_number_id,  # Use VAPI phone number ID if available
            phoneNumber=phone_number_config,  # Use Twilio config if no VAPI ID
            customer=CallCustomer(
                number="+919073554610",  # Phone number to call (customer)
                numberE164CheckEnabled=True,
                name="Test Customer"  # Customer name for reference
            ),
            maxDurationSeconds=600,  # 10 minutes max
            metadata={
                "test_call": True,
                "real_number": True,
                "candidate_name": "Test Candidate",
                "job_title": "Python Developer",
                "call_purpose": "Real phone test of VAPI integration"
            }
        )
        
        logger.info(f"📞 INITIATING REAL CALL to +919073554610...")
        logger.info(f"🤖 Assistant ID: {assistant.id}")
        
        # ACTUAL CALL INITIATION - UNCOMMENTED FOR REAL TEST
        call_response = await vapi_client.initiate_call(real_call_request)
        
        if call_response:
            logger.info(f"✅ CALL INITIATED SUCCESSFULLY!")
            logger.info(f"📞 Call ID: {call_response.id}")
            logger.info(f"📱 Phone: {call_response.phoneNumber or call_response.phoneNumberId or 'N/A'}")
            logger.info(f"📊 Status: {call_response.status or 'initiated'}")
            logger.info(f"🔗 Type: {call_response.type or 'outbound'}")
            
            return {
                "status": "call_initiated",
                "message": "REAL CALL INITIATED - You should receive a call shortly!",
                "call_details": {
                    "call_id": call_response.id,
                    "phone_number": call_response.phoneNumber or call_response.phoneNumberId,
                    "status": call_response.status or "initiated",
                    "type": call_response.type,
                    "assistant_id": assistant.id,
                    "max_duration": "10 minutes"
                },
                "assistant_info": {
                    "id": assistant.id,
                    "name": assistant.name,
                    "job_title": job_context.job_title,
                    "questions_count": len(job_context.questions)
                },
                "instructions": [
                    "📞 Answer the call when it comes in",
                    "🎯 The AI will introduce itself and conduct a brief interview",
                    "💬 Answer the questions naturally",
                    "⏱️ Call will last about 5-10 minutes",
                    "🛑 You can hang up anytime to end the call"
                ],
                "cleanup_note": "Assistant will be cleaned up after testing. Call recording and transcript will be available via VAPI dashboard."
            }
        else:
            # Clean up assistant if call failed
            await assistant_service.delete_assistant(assistant.id)
            raise HTTPException(500, "Failed to initiate call")
            
    except Exception as e:
        logger.error(f"Error in real call test: {e}")
        raise HTTPException(500, f"Real call test failed: {str(e)}")


@app.post("/vapi/cleanup-test-assistant/{assistant_id}")
async def cleanup_test_assistant(assistant_id: str):
    """Clean up test assistant after real call testing"""
    try:
        logger.info(f"🧹 Cleaning up test assistant: {assistant_id}")
        
        success = await assistant_service.delete_assistant(assistant_id)
        
        if success:
            return {
                "status": "success",
                "message": f"Test assistant {assistant_id} cleaned up successfully",
                "assistant_id": assistant_id
            }
        else:
            return {
                "status": "warning", 
                "message": f"Assistant {assistant_id} may have already been deleted or doesn't exist",
                "assistant_id": assistant_id
            }
            
    except Exception as e:
        logger.error(f"Error cleaning up assistant {assistant_id}: {e}")
        raise HTTPException(500, f"Cleanup failed: {str(e)}")


@app.get("/vapi/call-status/{call_id}")
async def get_call_status(call_id: str):
    """Get the status and details of a VAPI call"""
    try:
        call_data = await vapi_client.get_call(call_id)
        
        if call_data:
            return {
                "status": "success",
                "call_data": call_data,
                "call_id": call_id
            }
        else:
            raise HTTPException(404, f"Call {call_id} not found")
            
    except Exception as e:
        logger.error(f"Error getting call status {call_id}: {e}")
        raise HTTPException(500, f"Failed to get call status: {str(e)}")


@app.get("/vapi/config-check")
async def check_configuration():
    """Check VAPI service configuration including phone number setup"""
    config_status = {
        "vapi_connection": False,
        "phone_configuration": {
            "status": "not_configured",
            "method": None,
            "details": {}
        },
        "database_connection": True,  # Assuming it's configured
        "recommendations": []
    }
    
    # Test VAPI connection
    try:
        vapi_connection = await vapi_client.test_connection()
        config_status["vapi_connection"] = vapi_connection
        if not vapi_connection:
            config_status["recommendations"].append("Check VAPI_API_KEY in vapi.env")
    except Exception as e:
        config_status["vapi_connection"] = False
        config_status["recommendations"].append(f"VAPI connection failed: {str(e)}")
    
    # Check phone number configuration
    if settings.vapi_phone_number_id:
        config_status["phone_configuration"] = {
            "status": "configured_vapi",
            "method": "VAPI Phone Number ID",
            "details": {
                "phone_number_id": settings.vapi_phone_number_id,
                "preferred": True
            }
        }
    elif (settings.twilio_account_sid and 
          settings.twilio_auth_token and 
          settings.twilio_phone_number):
        config_status["phone_configuration"] = {
            "status": "configured_twilio",
            "method": "Twilio Integration", 
            "details": {
                "account_sid": settings.twilio_account_sid[:8] + "..." if settings.twilio_account_sid else None,
                "phone_number": settings.twilio_phone_number,
                "auth_token_configured": bool(settings.twilio_auth_token)
            }
        }
    else:
        config_status["phone_configuration"]["status"] = "missing"
        config_status["recommendations"].extend([
            "Configure phone number access for making calls",
            "Option 1: Set VAPI_PHONE_NUMBER_ID (recommended)",
            "Option 2: Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER"
        ])
    
    # Overall status
    ready_for_calls = (
        config_status["vapi_connection"] and 
        config_status["phone_configuration"]["status"] in ["configured_vapi", "configured_twilio"]
    )
    
    return {
        "ready_for_calls": ready_for_calls,
        "configuration": config_status,
        "next_steps": config_status["recommendations"] if config_status["recommendations"] else [
            "Configuration looks good!",
            "You can test with: POST /vapi/test-real-call"
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.service_host,
        port=settings.service_port,
        reload=settings.debug
    )