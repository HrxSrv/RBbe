# VAPI Microservice - Project Context

## 🎯 Overview

**VAPI Microservice** is a standalone voice AI service that integrates with the main RecruitBot platform to conduct automated candidate interviews. This microservice runs independently and communicates with the main RecruitBot API through webhooks and HTTP requests.

## 🏗️ Architecture Context

### Main RecruitBot System (Separate Codebase)
- **FastAPI** backend with MongoDB Atlas
- **Google OAuth** + JWT authentication  
- **Complete pipeline**: Job management → Resume upload → AI analysis → Call scheduling
- **Base URL**: `http://localhost:8000` (main RecruitBot API)

### VAPI Microservice (This Codebase)
- **Independent FastAPI** service for voice AI
- **VAPI.ai** integration for voice calls
- **Webhook handling** for call events
- **Prompt management** integration with main system
- **Base URL**: `http://localhost:8001` (VAPI microservice)

## 🔄 Integration Flow

### 1. Call Scheduling (Main System → VAPI)
```
Main RecruitBot API (localhost:8000)
├── HR schedules call via POST /calls/schedule
├── Stores call record in MongoDB
├── Sends request to VAPI microservice
└── VAPI microservice creates VAPI call
```

### 2. Call Execution (VAPI → Candidate)
```
VAPI Microservice (localhost:8001)
├── Retrieves prompts from main system
├── Creates VAPI assistant with job-specific questions  
├── Initiates call to candidate
└── Handles real-time call events
```

### 3. Results Processing (VAPI → Main System)
```
VAPI Microservice receives webhook
├── Processes call transcript
├── Analyzes Q&A responses using Gemini
├── Sends results back to main system
└── Main system updates candidate record
```

## 📊 Key Data Models

### Call Model (From Main RecruitBot)
```javascript
{
  "id": "call_id_123",
  "candidate_id": "candidate_456", 
  "job_id": "job_789",
  "customer_id": "company_abc",
  "scheduled_time": "2024-01-15T10:00:00Z",
  "call_type": "screening|interview|follow_up",
  "status": "scheduled|in_progress|completed|failed|cancelled",
  "vapi_call_id": null, // Set by VAPI microservice
  "vapi_assistant_id": null, // Set by VAPI microservice
  "candidate_score": null, // Updated by VAPI after call
  "call_transcript": null, // Updated by VAPI after call
  "call_summary": null, // Updated by VAPI after call
  "scheduled_by": "hr_user_id",
  "duration_minutes": null,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Job Model (With Interview Questions)
```javascript
{
  "id": "job_789",
  "title": "Senior Python Developer",
  "company_name": "TechCorp",
  "questions": [
    {
      "question": "What is your experience with FastAPI?",
      "ideal_answer": "I have 3+ years experience building REST APIs with FastAPI...",
      "weight": 1.5
    },
    {
      "question": "How do you handle database optimization?", 
      "ideal_answer": "I use indexing strategies, query optimization...",
      "weight": 1.0
    }
  ]
}
```

### Candidate Model (With Resume Analysis)
```javascript
{
  "id": "candidate_456",
  "personal_info": {
    "name": "Alice Johnson",
    "email": "alice@example.com", 
    "phone": "+1-555-0123"
  },
  "resume_analysis": {
    "skills": ["Python", "FastAPI", "React"],
    "experience_years": 6,
    "overall_score": 87.5,
    "analysis_summary": "Strong technical background..."
  }
}
```

### Prompt Model (Database-driven Prompts)
```javascript
{
  "id": "prompt_123",
  "customer_id": "company_abc", // null for default prompts
  "prompt_type": "VAPI_INTERVIEW|VAPI_FIRST_MESSAGE",
  "title": "Interview Assistant Prompt",
  "content": "You are an AI interviewer for {company_name}. Ask questions about {job_title}...",
  "variables": ["company_name", "job_title", "candidate_name"],
  "is_active": true,
  "version": "1.0"
}
```

## 🔗 API Integration Points

### Main RecruitBot API Endpoints (localhost:8000)

#### Authentication
```bash
# Get JWT token for service-to-service communication
POST /api/v1/auth/service-token
Headers: {"X-Service-Key": "vapi-service-secret"}
```

#### Data Retrieval
```bash
# Get call details
GET /api/v1/calls/{call_id}
Headers: {"Authorization": "Bearer {service_token}"}

# Get job with questions  
GET /api/v1/jobs/dev/{job_id}
Headers: {"Authorization": "Bearer {service_token}"}

# Get candidate details
GET /api/v1/candidates/{candidate_id}  
Headers: {"Authorization": "Bearer {service_token}"}

# Get prompts for company
GET /api/v1/prompts/?customer_id={customer_id}&prompt_type=VAPI_INTERVIEW
Headers: {"Authorization": "Bearer {service_token}"}
```

#### Results Update
```bash
# Update call status and results
PUT /api/v1/calls/{call_id}/status
Headers: {"Authorization": "Bearer {service_token}"}
Body: {
  "status": "completed",
  "vapi_call_id": "vapi_123",
  "call_transcript": "...",
  "call_summary": "...",
  "candidate_score": 85.7,
  "duration_minutes": 25
}

# Update candidate with call results  
PUT /api/v1/candidates/{candidate_id}/call-results
Headers: {"Authorization": "Bearer {service_token}"}
Body: {
  "call_id": "call_123",
  "qa_results": [...],
  "overall_score": 88.5
}
```

## 🔄 Required VAPI Microservice Endpoints

### Call Management
```bash
# Initiate VAPI call (called by main system)
POST /vapi/calls/initiate
Body: {
  "call_id": "call_123",
  "candidate_phone": "+1-555-0123",
  "scheduled_time": "2024-01-15T10:00:00Z"
}

# Get call status
GET /vapi/calls/{call_id}/status

# Cancel scheduled call
DELETE /vapi/calls/{call_id}
```

### Webhook Handlers
```bash
# VAPI webhook for call events
POST /vapi/webhooks/call-events
Body: {VAPI webhook payload}

# VAPI webhook for call completion  
POST /vapi/webhooks/call-completed
Body: {VAPI webhook payload with transcript}
```

### Health & Testing
```bash
# Health check
GET /vapi/health

# Test VAPI integration
GET /vapi/test-vapi-connection

# Test main system integration
GET /vapi/test-main-system-connection
```

## 🛠️ Technical Requirements

### Environment Variables
```env
# VAPI Configuration
VAPI_API_KEY=your_vapi_api_key
VAPI_PHONE_NUMBER=+1-555-VAPI-NUM
VAPI_WEBHOOK_SECRET=webhook_secret_key

# Main System Integration
MAIN_SYSTEM_URL=http://localhost:8000
SERVICE_AUTH_KEY=vapi-service-secret
SERVICE_NAME=vapi-microservice

# Gemini for Q&A Analysis
GEMINI_API_KEY=your_gemini_api_key

# Database (Optional - for local caching)
MONGODB_URL=mongodb://localhost:27017/vapi_cache

# Service Configuration
VAPI_SERVICE_PORT=8001
VAPI_SERVICE_HOST=0.0.0.0
LOG_LEVEL=INFO
```

### Dependencies
```python
# Core Framework
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.0

# VAPI Integration  
requests==2.31.0
aiohttp==3.9.0
websockets==12.0

# AI & Analysis
google-generativeai==0.3.2

# Utilities
python-jose[cryptography]==3.3.0
python-multipart==0.0.6
loguru==0.7.2
asyncio==3.4.3
```

## 🔧 Implementation Priorities

### Phase 1: Core Infrastructure
1. **FastAPI Setup** - Basic service with health checks
2. **Main System Integration** - Service-to-service authentication
3. **VAPI Connection** - Basic VAPI.ai integration testing
4. **Webhook Handling** - Receive and process VAPI webhooks

### Phase 2: Call Management  
1. **Call Initiation** - Create VAPI calls from main system requests
2. **Assistant Creation** - Dynamic assistant creation with job-specific prompts
3. **Call Monitoring** - Real-time call status tracking
4. **Error Handling** - Failed call retry logic and notification

### Phase 3: AI Integration
1. **Prompt Management** - Fetch and apply company-specific prompts
2. **Q&A Processing** - Analyze call transcripts for question responses
3. **Scoring System** - Grade candidate responses against ideal answers
4. **Results Reporting** - Send structured results back to main system

### Phase 4: Advanced Features
1. **Cron Jobs** - Scheduled call management and cleanup
2. **Analytics** - Call performance metrics and insights
3. **Retry Logic** - Handle failed calls and rescheduling
4. **Monitoring** - Service health and performance monitoring

## 📋 Workflow Implementation

### 1. Call Scheduling Workflow
```python
# Triggered by main system POST /vapi/calls/initiate
async def initiate_call(call_request: CallRequest):
    # 1. Fetch call details from main system
    call_data = await fetch_call_details(call_request.call_id)
    
    # 2. Fetch job and candidate data
    job_data = await fetch_job_details(call_data.job_id)
    candidate_data = await fetch_candidate_details(call_data.candidate_id)
    
    # 3. Fetch company-specific prompts
    prompts = await fetch_prompts(call_data.customer_id, "VAPI_INTERVIEW")
    
    # 4. Create VAPI assistant with job questions
    assistant = await create_vapi_assistant(job_data, prompts)
    
    # 5. Schedule VAPI call
    vapi_call = await schedule_vapi_call(
        assistant_id=assistant.id,
        phone=candidate_data.phone,
        scheduled_time=call_data.scheduled_time
    )
    
    # 6. Update main system with VAPI IDs
    await update_call_vapi_info(call_request.call_id, vapi_call.id, assistant.id)
    
    return {"status": "scheduled", "vapi_call_id": vapi_call.id}
```

### 2. Webhook Processing Workflow
```python
# Triggered by VAPI webhook POST /vapi/webhooks/call-completed
async def process_call_completion(webhook_data: VAPIWebhook):
    # 1. Validate webhook signature
    validate_webhook_signature(webhook_data)
    
    # 2. Extract call information
    vapi_call_id = webhook_data.call.id
    transcript = webhook_data.call.transcript
    duration = webhook_data.call.duration
    
    # 3. Find corresponding call in main system
    call_data = await find_call_by_vapi_id(vapi_call_id)
    
    # 4. Fetch job questions for analysis
    job_data = await fetch_job_details(call_data.job_id)
    
    # 5. Analyze Q&A responses using Gemini
    qa_analysis = await analyze_qa_responses(transcript, job_data.questions)
    
    # 6. Calculate overall candidate score
    overall_score = calculate_candidate_score(qa_analysis)
    
    # 7. Update main system with results
    await update_call_results(call_data.id, {
        "status": "completed",
        "call_transcript": transcript,
        "call_summary": qa_analysis.summary,
        "candidate_score": overall_score,
        "duration_minutes": duration,
        "qa_results": qa_analysis.detailed_results
    })
    
    # 8. Update candidate record with call results
    await update_candidate_call_results(call_data.candidate_id, qa_analysis)
```

### 3. Cron Job Requirements
```python
# Scheduled tasks to implement

# Every 5 minutes: Check for scheduled calls
async def check_scheduled_calls():
    """Check for calls that should be initiated now"""
    
# Every hour: Cleanup completed calls  
async def cleanup_completed_calls():
    """Remove old call data and update statuses"""
    
# Every 30 minutes: Retry failed calls
async def retry_failed_calls():
    """Retry calls that failed due to network issues"""
    
# Daily: Send analytics to main system
async def send_daily_analytics():
    """Send call performance metrics to main system"""
```

## 🔍 Testing Strategy

### Unit Tests
- VAPI integration functions
- Webhook signature validation
- Q&A analysis logic
- Scoring calculations

### Integration Tests  
- Main system API communication
- VAPI call creation and management
- End-to-end call workflow
- Error handling and retries

### Load Tests
- Concurrent call handling
- Webhook processing under load
- Main system integration limits

## 📈 Monitoring & Logging

### Key Metrics
- Calls scheduled vs. completed
- Average call duration
- Call success rate
- Q&A analysis accuracy
- System response times

### Log Events
- Call initiation requests
- VAPI API interactions
- Webhook processing
- Main system API calls
- Error conditions and retries

## 🚀 Deployment

### Standalone Deployment
- Separate Docker container
- Independent scaling
- Own CI/CD pipeline
- Service discovery integration

### Environment Setup
- Development: `localhost:8001`
- Staging: `https://vapi-staging.recruitbot.com`
- Production: `https://vapi.recruitbot.com`

---

## 📝 Summary

The VAPI microservice is a critical component that:
1. **Receives call requests** from the main RecruitBot system
2. **Manages VAPI.ai integration** for voice calls
3. **Processes call results** using AI analysis
4. **Returns structured data** back to the main system

**Key Success Factors:**
- ✅ Reliable webhook handling
- ✅ Robust error handling and retries
- ✅ Accurate Q&A analysis and scoring
- ✅ Seamless integration with main system
- ✅ Scalable architecture for high call volumes

**Main System Dependencies:**
- Call scheduling API
- Job and candidate data
- Prompt management system
- Results update endpoints

This microservice operates independently but maintains tight integration with the main RecruitBot platform to deliver a seamless hiring experience. 