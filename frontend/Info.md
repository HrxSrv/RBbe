# RecruitBot Frontend Development Guide

## Project Overview

**✅ SYSTEM STATUS: READY FOR FULL PIPELINE TESTING**

RecruitBot is now an **internal HR tool** with AI-powered resume analysis and automated call scheduling. The complete pipeline is implemented and ready for testing: HR uploads candidate resume → text extraction → Gemini analysis → call scheduling.

**🚀 PIPELINE COMPONENTS READY:**
- ✅ Authentication & RBAC (Google OAuth + JWT)
- ✅ Job Management (Internal dev endpoints)
- ✅ Resume Upload System (HR uploads for candidates)
- ✅ Text Extraction Service (PDF, DOC, DOCX)
- ✅ Gemini VLM Analysis (Resume analysis with job context)
- ✅ Call Scheduling System (NEW - Ready for VAPI integration)
- ✅ Prompt Management System (Database-driven prompts)

## Architecture Stack

### Backend
- **FastAPI** with **MongoDB Atlas**
- **Beanie ODM** for async database operations
- **Google OAuth 2.0** + **JWT** authentication
- **Pydantic v2** for validation
- **Gemini VLM integration** for resume analysis
- **VAPI** integration points for automated calls
- **Prompt Management** - Database-driven prompt system

### Database
- **MongoDB Atlas**: `recruitbot_dev`
- **Collections**: customers, users, jobs, candidates, calls, prompts

## Base URLs

- **Development**: `http://localhost:8000`
- **API Base**: `http://localhost:8000/api/v1`
- **Documentation**: `http://localhost:8000/docs`

## Authentication System

### Google OAuth 2.0 Flow

1. **Initiate OAuth**: `GET /api/v1/auth/google`
2. **Handle Callback**: `GET /api/v1/auth/google/callback`
3. **Get User Info**: `GET /api/v1/auth/me`
4. **Logout**: `POST /api/v1/auth/logout`

### JWT Token Handling

```javascript
// Store token from OAuth callback
localStorage.setItem('access_token', response.access_token);

// Include in API requests
headers: {
  'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
  'Content-Type': 'application/json'
}
```

### User Roles & Permissions

#### Role Hierarchy
1. **super_admin** - Platform administrator
2. **company_admin** - Company owner/admin
3. **recruiter** - HR team member
4. **viewer** - Read-only access

#### Key Permissions
- `read_customers`, `write_customers`
- `read_users`, `write_users`, `invite_users`
- `read_jobs`, `write_jobs`, `delete_jobs`
- `read_candidates`, `write_candidates`
- `read_calls`, `write_calls`, `schedule_calls`
- `read_analytics`, `admin_access`

## API Endpoints

### Authentication
```
GET    /api/v1/auth/google              # Initiate Google OAuth
GET    /api/v1/auth/google/callback     # OAuth callback
GET    /api/v1/auth/me                  # Get current user
POST   /api/v1/auth/logout              # Logout user
```

### System & Testing
```
GET    /api/v1/health                   # Health check
GET    /api/v1/test-db                  # Database connection test
POST   /api/v1/create-sample-data       # Create sample data (dev only)
POST   /api/v1/test-complete-pipeline   # 🆕 Test complete pipeline (NEW)
```

### Customers (Companies)
```
POST   /api/v1/customers/register       # Public company registration
GET    /api/v1/customers                # List customers (filtered by role)
GET    /api/v1/customers/{customer_id}  # Get customer details
PUT    /api/v1/customers/{customer_id}  # Update customer
DELETE /api/v1/customers/{customer_id}  # Soft delete customer
```

### Users
```
GET    /api/v1/users/me                 # Get current user profile
PUT    /api/v1/users/me                 # Update current user profile
GET    /api/v1/users/company            # List company users
PUT    /api/v1/users/{user_id}/deactivate # Deactivate user
```

### Invitations
```
POST   /api/v1/invitations              # Create invitation
GET    /api/v1/invitations              # List pending invitations
POST   /api/v1/invitations/{token}/accept # Accept invitation
```

### Jobs (Internal HR Tool)
```
GET    /api/v1/jobs/dev/list            # Internal job listing (auth required)
GET    /api/v1/jobs/dev/{job_id}        # Internal job details (auth required)
GET    /api/v1/jobs                     # List jobs with filtering & pagination (auth required)
POST   /api/v1/jobs                     # Create job with questions (auth required)
GET    /api/v1/jobs/{job_id}            # Get job details with questions (auth required)
PUT    /api/v1/jobs/{job_id}            # Update job including questions (auth required)
DELETE /api/v1/jobs/{job_id}            # Soft delete job (auth required)
POST   /api/v1/jobs/{job_id}/publish    # Publish job (Draft → Active) (auth required)
GET    /api/v1/jobs/{job_id}/analytics  # Job performance metrics (auth required)
```

### Candidates (Internal HR Upload System)
```
# HR Resume Upload System (Auth Required)
POST   /api/v1/candidates/upload-resume-for-job/{job_id}  # Upload resume for specific job
POST   /api/v1/candidates/upload-resume                   # Upload resume to general pool
POST   /api/v1/candidates/{id}/associate-job/{job_id}     # Associate candidate with job

# Core Candidate Management (Auth Required)
GET    /api/v1/candidates                   # List candidates with filtering
POST   /api/v1/candidates                   # Create candidate manually
GET    /api/v1/candidates/{candidate_id}    # Get candidate details
PUT    /api/v1/candidates/{candidate_id}    # Update candidate

# Analysis & Processing (Auth Required)
POST   /api/v1/candidates/analyze-resume/{id}    # Complete VLM analysis with job context
POST   /api/v1/candidates/qa-assessment/{id}     # Q&A readiness evaluation
POST   /api/v1/candidates/batch-analyze          # Batch resume processing
GET    /api/v1/candidates/gemini-service-test    # Test Gemini service availability

# File Management (Auth Required)
GET    /api/v1/candidates/files/{id}/metadata   # Get file metadata
DELETE /api/v1/candidates/files/{id}            # Delete uploaded file
```

### 🆕 Calls (Call Scheduling System - NEW)
```
POST   /api/v1/calls/schedule              # Schedule call with candidate/job context
GET    /api/v1/calls/                      # List calls with filtering
GET    /api/v1/calls/{call_id}             # Get call details
PUT    /api/v1/calls/{call_id}/status      # Update call status
POST   /api/v1/calls/{call_id}/reschedule  # Reschedule call
GET    /api/v1/calls/analytics             # Call performance metrics
```

### 🆕 Prompts (Prompt Management System)
```
GET    /api/v1/prompts/                    # List prompts with filtering
POST   /api/v1/prompts/                    # Create prompt
GET    /api/v1/prompts/{prompt_id}         # Get prompt details
PUT    /api/v1/prompts/{prompt_id}         # Update prompt
DELETE /api/v1/prompts/{prompt_id}         # Delete prompt
GET    /api/v1/prompts/types               # Get available prompt types
```

## 🚀 COMPLETE PIPELINE WORKFLOW

### Frontend Implementation Guide

#### 1. **HR Login & Authentication**
```javascript
// Initiate Google OAuth
window.location.href = '/api/v1/auth/google';

// After callback, store token
localStorage.setItem('access_token', response.access_token);

// Get user info
const userResponse = await fetch('/api/v1/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

#### 2. **Job Selection**
```javascript
// List company jobs
const jobsResponse = await fetch('/api/v1/jobs/dev/list', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Get specific job with questions
const jobResponse = await fetch(`/api/v1/jobs/dev/${jobId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

#### 3. **Resume Upload**
```javascript
// Upload candidate resume for specific job
const formData = new FormData();
formData.append('resume', fileInput.files[0]);
formData.append('candidate_name', 'John Doe'); // Optional
formData.append('candidate_email', 'john@example.com'); // Optional
formData.append('candidate_phone', '+1-555-0123'); // Optional
formData.append('candidate_location', 'New York, NY'); // Optional

const uploadResponse = await fetch(`/api/v1/candidates/upload-resume-for-job/${jobId}`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

const candidate = await uploadResponse.json();
```

#### 4. **Text Extraction (Automatic)**
```javascript
// Text extraction happens automatically during upload
// Check extraction quality in candidate response
const { resume_analysis } = candidate;
console.log('Text extraction confidence:', resume_analysis.text_extraction_confidence);
```

#### 5. **Resume Analysis**
```javascript
// Trigger Gemini analysis with job context
const analysisResponse = await fetch(`/api/v1/candidates/analyze-resume/${candidate.id}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    job_id: jobId,
    force_vision: false // Let system decide based on text quality
  })
});

const analysis = await analysisResponse.json();
```

#### 6. **Call Scheduling**
```javascript
// Schedule call based on analysis results
const callResponse = await fetch('/api/v1/calls/schedule', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    candidate_id: candidate.id,
    job_id: jobId,
    scheduled_time: '2024-01-15T10:00:00Z',
    call_type: 'screening',
    notes: 'Initial screening based on resume analysis'
  })
});

const scheduledCall = await callResponse.json();
```

## 🧪 Testing the Complete Pipeline

### Pipeline Test Endpoint
```javascript
// Test the complete pipeline functionality
const pipelineTest = await fetch('/api/v1/test-complete-pipeline', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});

const testResults = await pipelineTest.json();
console.log('Pipeline test results:', testResults);
```

### Manual Testing with Real Resume
```bash
# 1. Create sample data
curl -X POST http://localhost:8000/api/v1/create-sample-data

# 2. Test complete pipeline
curl -X POST -H "Authorization: Bearer $ACCESS_TOKEN" \
  http://localhost:8000/api/v1/test-complete-pipeline

# 3. Upload real resume (replace with your token and file)
curl -X POST -H "Authorization: Bearer $ACCESS_TOKEN" \
  http://localhost:8000/api/v1/candidates/upload-resume-for-job/YOUR_JOB_ID \
  -F "resume=@sampleresume.pdf" \
  -F "candidate_name=Test Candidate" \
  -F "candidate_email=test@example.com"
```

## Data Models

### Customer (Company)
```javascript
{
  "id": "string",
  "company_name": "string",
  "domain": "string",
  "industry": "string",
  "size": "startup|small|medium|large|enterprise",
  "subscription_plan": "free|starter|professional|enterprise",
  "contact_email": "string",
  "phone": "string",
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "postal_code": "string"
  },
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### User
```javascript
{
  "id": "string",
  "email": "string",
  "full_name": "string",
  "role": "super_admin|company_admin|recruiter|viewer",
  "customer_id": "string", // null for super_admin
  "google_id": "string",
  "avatar_url": "string",
  "is_active": true,
  "last_login": "2024-01-01T00:00:00Z",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Job (Enhanced with Questions)
```javascript
{
  "id": "string",
  "customer_id": "string",
  "title": "string",
  "description": "string",
  "requirements": ["string"],
  "nice_to_have": ["string"],
  "department": "string",
  "employment_type": "full_time|part_time|contract|internship",
  "experience_level": "entry|junior|mid|senior|lead|executive",
  "location_type": "remote|hybrid|onsite",
  "location": {
    "city": "string",
    "state": "string",
    "country": "string"
  },
  "salary_range": {
    "min_amount": 50000,
    "max_amount": 100000,
    "currency": "USD"
  },
  "skills_required": ["string"],
  "status": "draft|active|paused|closed",
  
  // Enhanced: Interview Questions System
  "questions": [
    {
      "question": "What is your experience with FastAPI?",
      "ideal_answer": "I have 3+ years experience building REST APIs with FastAPI, including authentication, database integration, and async operations.", // Hidden in public endpoints
      "weight": 1.5  // Question importance (1.0 = normal, >1.0 = higher importance)
    },
    {
      "question": "How do you handle database optimization?",
      "ideal_answer": "I use indexing strategies, query optimization, connection pooling, and caching mechanisms like Redis for performance.",
      "weight": 1.0
    }
  ],
  
  "application_deadline": "2024-12-31T23:59:59Z",
  "created_by": "string", // user_id
  "applications_count": 0,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Candidate (Enhanced with Q&A Data for Day 3)
```javascript
{
  "id": "string",
  "customer_id": "string",
  
  // Personal Information
  "personal_info": {
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "phone": "+1-555-0123",
    "location": "New York, NY",
    "linkedin_url": "https://linkedin.com/in/alice",
    "portfolio_url": "https://alice-portfolio.com"
  },
  
  // Resume & File Management
  "resume_file_path": "/uploads/resumes/candidate_id/resume.pdf",
  "resume_file_type": "application/pdf",
  "original_filename": "alice_johnson_resume.pdf",
  "resume_text": "Extracted text content...",
  
  // VLM Analysis Results
  "resume_analysis": {
    "overall_score": 87.5,
    "skills_extracted": ["Python", "FastAPI", "React", "MongoDB"],
    "experience_years": 6,
    "experience_level": "senior",
    "education": {
      "degree": "BS Computer Science",
      "university": "Stanford University",
      "graduation_year": 2018,
      "gpa": 3.8
    },
    "previous_roles": [
      {
        "title": "Senior Software Engineer",
        "company": "TechCorp",
        "duration_years": 3.5,
        "technologies": ["Python", "React", "AWS"]
      }
    ],
    "key_achievements": ["Led team of 5 engineers", "Increased system performance by 40%"],
    "analysis_summary": "Strong technical background with leadership experience...",
    "strengths": ["Strong Python skills", "Leadership experience"],
    "areas_for_improvement": ["Limited mobile development experience"],
    "vlm_confidence_score": 0.94,
    "analysis_version": "v1.0",
    "analysis_timestamp": "2024-01-01T10:00:00Z"
  },
  
  // Job Applications with Enhanced Q&A
  "applications": [
    {
      "job_id": "job_objectid",
      "application_date": "2024-01-01T00:00:00Z",
      "application_status": "applied", // applied, screening, interviewing, offered, hired, rejected
      "matching_score": 87.5,
      "job_specific_analysis": {
        "skill_match_percentage": 90,
        "experience_match": "strong",
        "education_match": "excellent",
        "location_match": "compatible",
        "salary_expectations_match": "within_range"
      },
      "recruiter_notes": "Strong candidate, schedule screening call",
      "rejection_reason": null,
      "offer_details": null,
      
      // Enhanced: Call Q&A Results
      "call_qa": {
        "call_id": "call_objectid",
        "call_date": "2024-01-02T10:00:00Z",
        "questions_answers": [
          {
            "question": "What is your experience with FastAPI?",
            "answer": "I have been working with FastAPI for about 4 years, primarily building microservices and REST APIs. I've implemented authentication, worked with async/await patterns, and integrated with various databases.",
            "ideal_answer": "I have 3+ years experience building REST APIs with FastAPI, including authentication, database integration, and async operations.",
            "score": 92.5, // 0-100 score for this specific answer
            "analysis": "Excellent answer that exceeds the ideal response with specific technical details and real-world experience."
          },
          {
            "question": "How do you handle database optimization?",
            "answer": "I focus on proper indexing, query optimization, and use connection pooling. I also implement caching with Redis for frequently accessed data.",
            "ideal_answer": "I use indexing strategies, query optimization, connection pooling, and caching mechanisms like Redis for performance.",
            "score": 95.0,
            "analysis": "Perfect answer that matches all key points of the ideal response."
          }
        ],
        "overall_score": 93.75, // Overall interview performance score
        "interview_summary": "Candidate demonstrates exceptional technical skills with excellent FastAPI and database optimization knowledge. Strong fit for senior roles.",
        "call_duration_minutes": 35
      }
    }
  ],
  
  // Aggregate Statistics
  "total_applications": 1,
  "average_matching_score": 87.5,
  "best_matching_job_id": "job_objectid",
  "application_success_rate": 0.0,
  
  // Status & Metadata
  "candidate_status": "active", // active, hired, inactive, blacklisted
  "source": "direct_upload", // direct_upload, job_portal, referral, linkedin
  "tags": ["python", "senior", "leadership"],
  "last_activity": "2024-01-01T10:00:00Z",
  
  // ✅ NEW: Upload Tracking Fields (Internal HR Tool)
  "uploaded_by": "hr_user_id_12345",        // ID of HR user who uploaded the resume
  "upload_source": "hr_upload",             // Source tracking for internal uploads
  
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 🆕 Call Model (Updated)
```javascript
{
  "id": "string",
  "candidate_id": "string",
  "job_id": "string",
  "customer_id": "string",
  "scheduled_time": "2024-01-15T10:00:00Z",
  "call_type": "screening|interview|follow_up",
  "status": "scheduled|in_progress|completed|failed|cancelled",
  "duration_minutes": 30,
  "vapi_call_id": "string", // VAPI integration ID
  "vapi_assistant_id": "string",
  "call_summary": "string",
  "call_transcript": "string",
  "candidate_score": 85.5,
  "interviewer_notes": "string",
  "next_steps": "string",
  "scheduled_by": "string", // user_id who scheduled
  "rescheduled_count": 0,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 🆕 Prompt Model (New)
```javascript
{
  "id": "string",
  "customer_id": "string", // null for default prompts
  "prompt_type": "VAPI_INTERVIEW|VAPI_FIRST_MESSAGE|GEMINI_RESUME_TEXT|GEMINI_RESUME_VISION|GEMINI_QA_ASSESSMENT",
  "title": "Interview Assistant Prompt",
  "content": "You are an AI interviewer for {company_name}. Ask questions about {job_title}...",
  "variables": ["company_name", "job_title", "candidate_name"],
  "is_active": true,
  "is_default": false, // System default prompts
  "version": "1.0",
  "usage_count": 0,
  "created_by": "string", // user_id
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## 🎯 Frontend Development Priorities

### Phase 1: Core Workflow (READY NOW)
1. **Authentication Flow** - Google OAuth integration
2. **Job Management** - List/view jobs with questions
3. **Resume Upload** - File upload with candidate info
4. **Candidate Review** - View analysis results
5. **Call Scheduling** - Schedule interviews

### Phase 2: Enhanced Features 
1. **Prompt Management** - Customize AI prompts
2. **Analytics Dashboard** - Performance metrics
3. **Batch Operations** - Bulk candidate processing
4. **Real-time Updates** - WebSocket integration

### Phase 3: Advanced Features
1. **VAPI Integration** - Voice interview management
2. **Advanced Analytics** - Hiring insights
3. **Team Collaboration** - Multi-user workflows

## 🔧 Development Tips

### Error Handling
All endpoints return standardized error responses:
```javascript
{
  "detail": "Error message",
  "status_code": 400,
  "error_type": "validation_error"
}
```

### Loading States
Most operations are async - implement proper loading indicators:
- File upload progress
- Analysis processing status
- Call scheduling confirmation

### Real-time Features
Consider WebSocket integration for:
- Live analysis updates
- Call status changes
- Team notifications

## 🚀 Ready for Production

**Current System Status:**
- ✅ Complete authentication & RBAC
- ✅ Job management with questions
- ✅ Resume upload & text extraction
- ✅ Gemini VLM analysis
- ✅ Call scheduling system
- ✅ Prompt management
- ✅ Error handling & validation
- ✅ Database models & relationships
- ✅ API documentation

**Missing for Full Production:**
- ⏳ VAPI voice integration (endpoints ready)
- ⏳ Frontend implementation
- ⏳ Production deployment
- ⏳ User acceptance testing

---

**Last Updated**: System Ready for Full Pipeline Testing
**Status**: PRODUCTION READY (excluding VAPI voice calls)
**Next Step**: Frontend implementation of complete workflow 