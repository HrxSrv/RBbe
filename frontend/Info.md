# RecruitBot Frontend Development Guide

## Project Overview

**⚠️ ARCHITECTURE UPDATE: Internal HR Tool (No Public Access)**

RecruitBot is now an **internal HR tool** with AI-powered resume analysis and automated call scheduling. All operations require authentication and are designed for HR team use. The platform enables HR teams to manage job postings internally, upload candidate resumes, analyze candidates through VLM integration, and schedule automated calls via VAPI.

## Architecture Stack

### Backend
- **FastAPI** with **MongoDB Atlas**
- **Beanie ODM** for async database operations
- **Google OAuth 2.0** + **JWT** authentication
- **Pydantic v2** for validation
- **VLM integration** for resume analysis
- **VAPI** for automated calls

### Database
- **MongoDB Atlas**: `recruitbot_dev`
- **Collections**: customers, users, jobs, candidates, calls

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

### System
```
GET    /api/v1/health                   # Health check
GET    /api/v1/test-db                  # Database connection test
POST   /api/v1/create-sample-data       # Create sample data (dev only)
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

### Jobs (Internal HR Tool - Updated ✅)
```
GET    /api/v1/jobs                     # List jobs with filtering & pagination (auth required)
POST   /api/v1/jobs                     # Create job with questions (auth required)
GET    /api/v1/jobs/{job_id}            # Get job details with questions (auth required)
PUT    /api/v1/jobs/{job_id}            # Update job including questions (auth required)
DELETE /api/v1/jobs/{job_id}            # Soft delete job (auth required)
POST   /api/v1/jobs/{job_id}/publish    # Publish job (Draft → Active) (auth required)
GET    /api/v1/jobs/{job_id}/analytics  # Job performance metrics (auth required)

# ⚠️ CHANGED: Public endpoints converted to internal dev endpoints
GET    /api/v1/jobs/dev/list            # Internal job listing (auth required, full access including ideal answers)
GET    /api/v1/jobs/dev/{job_id}        # Internal job details (auth required, full access including ideal answers)

# Enhanced Testing
POST   /api/v1/test-day2-enhanced-features          # Test enhanced Q&A features
GET    /api/v1/test-internal-tool-architecture      # Test internal tool architecture changes
```

### Candidates (Internal HR Upload System - Updated ✅)
```
# Core Candidate Management (Auth Required)
GET    /api/v1/candidates                   # List candidates with filtering (auth required)
POST   /api/v1/candidates                   # Create candidate manually (auth required)
GET    /api/v1/candidates/{candidate_id}    # Get candidate details with Q&A data (auth required)
PUT    /api/v1/candidates/{candidate_id}    # Update candidate (auth required)

# ⚠️ REMOVED: Public candidate application endpoints
# POST   /api/v1/candidates/public/apply-to-job/{job_id}    # REMOVED - No longer public
# GET    /api/v1/candidates/public/application-status/{email} # REMOVED - No longer public

# ✅ NEW: HR Resume Upload System (Auth Required)
POST   /api/v1/candidates/upload-resume-for-job/{job_id}  # Upload resume for specific job (auth required)
POST   /api/v1/candidates/upload-resume                   # Upload resume to general candidate pool (auth required)
POST   /api/v1/candidates/{id}/associate-job/{job_id}     # Associate existing candidate with job (auth required)

# File Upload & Processing (Completed ✅)
POST   /api/v1/candidates/upload-resume         # Upload & analyze resume with VLM (auth required)
GET    /api/v1/candidates/files/{id}/metadata   # Get file metadata (auth required)
DELETE /api/v1/candidates/files/{id}            # Delete uploaded file (auth required)

# Text Extraction Service (Completed ✅)
POST   /api/v1/candidates/test-text-extraction-service  # Test text extraction (auth required)
GET    /api/v1/candidates/test-text-extraction/{id}     # Test specific file extraction (auth required)

# VLM Integration & Analysis (Completed ✅)
POST   /api/v1/candidates/analyze-resume/{id}    # Complete VLM analysis with job context (auth required)
POST   /api/v1/candidates/qa-assessment/{id}     # Q&A readiness evaluation (auth required)
POST   /api/v1/candidates/batch-analyze          # Batch resume processing (auth required)
GET    /api/v1/candidates/gemini-service-test    # Test Gemini service availability (auth required)

# Day 3 Testing Endpoints (Completed ✅)
GET    /api/v1/test-day3-step1-file-upload       # Test file upload system (auth required)
GET    /api/v1/test-day3-step2-text-extraction   # Test text extraction service (auth required)
GET    /api/v1/test-day3-step3-gemini-integration # Test complete VLM integration (auth required)
```

### Calls (Day 4-5 Planned)
```
GET    /api/v1/calls                       # List calls with filtering
POST   /api/v1/calls/schedule              # Schedule VAPI call with job questions
GET    /api/v1/calls/{call_id}             # Get call details & transcript with Q&A results
PUT    /api/v1/calls/{call_id}/status      # Update call status
POST   /api/v1/calls/{call_id}/reschedule  # Reschedule call
GET    /api/v1/calls/analytics             # Call performance metrics
POST   /api/v1/webhooks/vapi               # VAPI webhook handler for Q&A results
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

### Call
```javascript
{
  "id": "string",
  "candidate_id": "string",
  "job_id": "string",
  "customer_id": "string",
  "vapi_call_id": "string",
  "scheduled_time": "2024-01-01T10:00:00Z",
  "duration_minutes": 30,
  "call_type": "screening|interview|follow_up",
  "status": "scheduled|in_progress|completed|failed|cancelled",
  "call_result": {
    "transcript": "string",
    "summary": "string",
    "sentiment": "positive|neutral|negative",
    "key_points": ["string"],
    "recommendation": "proceed|hold|reject"
  },
  "scheduled_by": "string", // user_id
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Invitation
```javascript
{
  "token": "string",
  "email": "string",
  "role": "company_admin|recruiter|viewer",
  "customer_id": "string",
  "invited_by": "string", // user_id
  "expires_at": "2024-01-08T00:00:00Z",
  "is_accepted": false,
  "created_at": "2024-01-01T00:00:00Z"
}
```

## Request/Response Examples

### Company Registration
```javascript
// POST /api/v1/customers/register
{
  "company_name": "Tech Innovations Inc",
  "domain": "techinnovations.com",
  "industry": "Technology",
  "size": "medium",
  "contact_email": "admin@techinnovations.com",
  "phone": "+1-555-0123",
  "address": {
    "street": "123 Innovation Drive",
    "city": "San Francisco",
    "state": "CA",
    "country": "USA",
    "postal_code": "94105"
  }
}

// Response
{
  "id": "60f7b1b9c9e77c001f5e4b8a",
  "company_name": "Tech Innovations Inc",
  "subscription_plan": "free",
  "is_active": true,
  // ... other fields
}
```

### Create Invitation
```javascript
// POST /api/v1/invitations
{
  "email": "recruiter@techinnovations.com",
  "role": "recruiter"
}

// Response
{
  "token": "inv_1234567890abcdef",
  "email": "recruiter@techinnovations.com",
  "role": "recruiter",
  "expires_at": "2024-01-08T00:00:00Z",
  "invitation_url": "http://localhost:3000/accept-invitation?token=inv_1234567890abcdef"
}
```

## Error Handling

### Standard Error Response
```javascript
{
  "detail": "Error message",
  "status_code": 400,
  "error_type": "validation_error"
}
```

### Common HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **422**: Unprocessable Entity (validation error)
- **500**: Internal Server Error

### Permission Errors
```javascript
{
  "detail": "Insufficient permissions: requires 'write_jobs'",
  "status_code": 403,
  "error_type": "permission_error"
}
```

## Frontend State Management

### User Context
```javascript
const UserContext = {
  user: {
    id: "string",
    email: "string",
    full_name: "string",
    role: "string",
    customer_id: "string",
    permissions: ["string"]
  },
  isAuthenticated: boolean,
  isLoading: boolean
}
```

### Role-Based UI Components
```javascript
// Example permission checks
const canCreateJobs = user.permissions.includes('write_jobs');
const canInviteUsers = user.permissions.includes('invite_users');
const isCompanyAdmin = user.role === 'company_admin';
const isSuperAdmin = user.role === 'super_admin';
```

## Environment Variables

```env
# Required for API communication
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id

# Optional
REACT_APP_ENV=development
REACT_APP_VERSION=1.0.0
```

## Sample Data

The backend provides sample data creation endpoint for development:
```
POST /api/v1/create-sample-data
```

This creates:
- 1 sample company
- 4 users with different roles
- 1 sample job posting
- 1 sample candidate
- 1 sample call record

## Security Considerations

1. **JWT Token Storage**: Use `localStorage` or `httpOnly` cookies
2. **CORS**: Backend configured for frontend origin
3. **Permission Checks**: Always validate permissions client-side and server-side
4. **Input Validation**: All inputs validated by Pydantic schemas
5. **Rate Limiting**: Implemented on sensitive endpoints

## Development Workflow

1. **Authentication First**: Implement Google OAuth flow
2. **Role-Based Navigation**: Show/hide features based on user role
3. **Permission Guards**: Protect routes and components
4. **Error Boundaries**: Handle API errors gracefully
5. **Loading States**: Show loading indicators for async operations

## API Testing

Use the FastAPI docs at `http://localhost:8000/docs` for testing endpoints.

Sample authentication header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## File Upload (Day 3 - COMPLETELY FIXED ✅)

### **🚨 MAJOR ARCHITECTURE CHANGE**: Internal HR Tool Only

**BREAKING CHANGE - RecruitBot is now an internal HR tool:**
- **BEFORE**: Public candidate platform with job applications ❌
- **AFTER**: Internal HR tool where HR uploads candidate resumes ✅

⚠️ **REMOVED PUBLIC ENDPOINTS:**
- `POST /api/v1/candidates/public/apply-to-job/{job_id}` - No longer available
- `GET /api/v1/candidates/public/application-status/{email}` - No longer available

### ✅ NEW: HR Resume Upload System (AUTHENTICATION REQUIRED)
```javascript
// HR users upload candidate resumes for specific jobs
const formData = new FormData();
formData.append('resume', fileInput.files[0]); // Note: field name changed from 'file' to 'resume'
formData.append('candidate_name', 'John Doe'); // Optional - "To be extracted by VLM" if not provided
formData.append('candidate_email', 'john@example.com'); // Optional
formData.append('candidate_phone', '+1-555-0123'); // Optional
formData.append('candidate_location', 'New York, NY'); // Optional

// Upload for specific job
const response = await fetch(`/api/v1/candidates/upload-resume-for-job/${jobId}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}` // AUTHENTICATION REQUIRED!
  },
  body: formData
});

// Or upload to general candidate pool
const poolResponse = await fetch(`/api/v1/candidates/upload-resume`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  },
  body: formData
});

const result = await response.json();
// Returns: candidate record with upload tracking (uploaded_by, upload_source)
```

### ✅ NEW: Associate Existing Candidate with Job
```javascript
// Associate existing candidate with a specific job
const response = await fetch(`/api/v1/candidates/${candidateId}/associate-job/${jobId}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
});
```

### Internal Candidate Management (AUTHENTICATION REQUIRED)
```javascript
// Company users manage candidates with authentication
const response = await fetch('/api/v1/candidates/', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Get detailed candidate information
const candidateResponse = await fetch(`/api/v1/candidates/${candidateId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Trigger VLM analysis on candidate resume
const analysisResponse = await fetch(`/api/v1/candidates/analyze-resume/${candidateId}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    job_id: selectedJobId, // Optional: for job-specific analysis
    force_vision: false
  })
});

// Assess Q&A readiness for job questions
const qaResponse = await fetch(`/api/v1/candidates/qa-assessment/${candidateId}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    job_id: jobIdWithQuestions
  })
});

// Update candidate application status
const statusResponse = await fetch(`/api/v1/candidates/${candidateId}/status`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    new_status: 'screening', // applied, screening, interview, rejected, hired
    notes: 'Moving to screening phase'
  })
});
```

### File Type Support
- **PDF**: `.pdf` files with text extraction
- **DOC/DOCX**: Microsoft Word documents
- **Size Limit**: 10MB per file
- **OCR Support**: Image-based PDFs with text recognition
- **Batch Limit**: Up to 50 files per batch upload

### VLM Analysis Response
```javascript
{
  "candidate_id": "string",
  "analysis_status": "completed|processing|failed",
  "resume_analysis": {
    "overall_score": 87.5,
    "processing_time_ms": 3500,
    "confidence_score": 0.94,
    "extracted_data": {
      "personal_info": {...},
      "skills": [...],
      "experience": [...],
      "education": {...}
    },
    "job_matching": {
      "job_id": "string",
      "match_score": 85.2,
      "skill_alignment": 90,
      "experience_fit": 80
    }
  },
  "file_metadata": {
    "original_filename": "resume.pdf",
    "file_size_bytes": 245760,
    "pages_processed": 2,
    "text_extraction_method": "direct|ocr"
  }
}
```

## Real-time Features (Future)

Consider WebSocket integration for:
- Live call status updates
- Real-time notifications
- Collaborative candidate review

## Testing Day 2 Enhanced Features

### Comprehensive Enhanced Testing Endpoint
```bash
# Test all Day 2 enhanced features (job questions + candidate Q&A)
curl -X POST http://localhost:8000/api/v1/test-day2-enhanced-features
```

### Job Creation with Questions Testing
```bash
# Create job with interview questions
curl -X POST "http://localhost:8000/api/v1/jobs/" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Python Developer with Q&A",
    "description": "Enhanced job with interview questions",
    "requirements": ["Python", "FastAPI", "MongoDB"],
    "location": "Remote",
    "job_type": "full_time",
    "questions": [
      {
        "question": "What is your experience with FastAPI?",
        "ideal_answer": "I have 3+ years experience building REST APIs with FastAPI, including authentication, database integration, and async operations.",
        "weight": 1.5
      },
      {
        "question": "How do you handle database optimization?",
        "ideal_answer": "I use indexing strategies, query optimization, connection pooling, and caching mechanisms like Redis for performance.",
        "weight": 1.0
      }
    ]
  }'
```

### Public Job Listings with Security Testing
```bash
# Browse public jobs (questions with hidden ideal answers)
# ⚠️ UPDATED: Internal dev endpoints (auth required)
curl -H "Authorization: Bearer $ACCESS_TOKEN" "http://localhost:8000/api/v1/jobs/dev/list?limit=5"
curl -H "Authorization: Bearer $ACCESS_TOKEN" "http://localhost:8000/api/v1/jobs/dev/list?location=remote&job_type=full_time"

# Get specific public job (ideal answers will be empty strings)
curl http://localhost:8000/api/v1/jobs/public/{job_id}
```

## Testing Day 3 VLM Integration

### Comprehensive Day 3 Testing Endpoints
```bash
# Test complete Gemini VLM integration system
curl -X GET http://localhost:8000/api/v1/test-day3-step3-gemini-integration

# Test file upload infrastructure
curl -X GET http://localhost:8000/api/v1/test-day3-step1-file-upload

# Test text extraction service
curl -X GET http://localhost:8000/api/v1/test-day3-step2-text-extraction
```

### Public Job Application Testing (NO AUTH)
```bash
# Test the FIXED public job application
# ⚠️ UPDATED: HR upload system (auth required)
curl -X POST -H "Authorization: Bearer $ACCESS_TOKEN" http://localhost:8000/api/v1/candidates/upload-resume-for-job/{job_id} \
  -F "resume=@resume.pdf" \
  -F "candidate_name=John Doe" \
  -F "candidate_email=john@example.com" \
  -F "candidate_phone=+1-555-0123" \
  -F "candidate_location=New York, NY" \
  -F "candidate_location=New York, NY"

# Check application status by email (NO AUTH)
curl http://localhost:8000/api/v1/candidates/public/application-status/john@example.com

# Test complete fixed implementation
curl -X POST http://localhost:8000/api/v1/test-day3-complete-fixed
```

### Internal Management Testing (AUTH REQUIRED)
```bash
# Test internal candidate management
curl http://localhost:8000/api/v1/candidates/ \
  -H "Authorization: Bearer {token}"

# Trigger VLM analysis on existing candidate
curl -X POST http://localhost:8000/api/v1/candidates/analyze-resume/{candidate_id} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"job_id": "optional_job_id"}'

# Test text extraction service
curl -X POST http://localhost:8000/api/v1/candidates/test-text-extraction-service \
  -H "Authorization: Bearer {token}"

# Test Gemini service availability
curl -X GET http://localhost:8000/api/v1/candidates/gemini-service-test \
  -H "Authorization: Bearer {token}"
```

### VLM Analysis and Q&A Assessment
```bash
# Analyze resume with job context
curl -X POST http://localhost:8000/api/v1/candidates/analyze-resume/{candidate_id} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"job_id": "optional_job_id"}'

# Assess Q&A readiness for job questions
curl -X POST http://localhost:8000/api/v1/candidates/qa-assessment/{candidate_id} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"job_id": "job_id_with_questions"}'

# Batch process multiple candidates
curl -X POST http://localhost:8000/api/v1/candidates/batch-analyze \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"candidate_ids": ["id1", "id2"], "job_id": "optional_job_id"}'
```

---

## Summary of Day 3 COMPLETE FIX

### Problem Identified and Fixed
- **Original Problem**: Candidates needed authentication/customer_id to upload resumes ❌
- **Root Cause**: All endpoints were designed for internal company use only
- **Solution**: Complete architecture redesign with public/private endpoint separation ✅

### New Architecture
- **Public Endpoints**: Job applications, status checking (no auth required)
- **Internal Endpoints**: Candidate management, VLM analysis (auth required)
- **Data Flow**: Job → Customer ID → File Storage → Candidate Profile

### Key Endpoints for Frontend
```
PUBLIC (No Auth):
POST /candidates/public/apply-to-job/{job_id}
GET  /candidates/public/application-status/{email}

INTERNAL (Auth Required):
GET  /candidates/
GET  /candidates/{id}
PUT  /candidates/{id}/status
POST /candidates/analyze-resume/{id}
POST /candidates/qa-assessment/{id}
```

### Implementation Status
✅ **Step 1**: File Upload Infrastructure - COMPLETE
✅ **Step 2**: Text Extraction Service - COMPLETE  
✅ **Step 3**: Gemini VLM Integration - COMPLETE
✅ **Architecture Fix**: Public/Private Separation - COMPLETE

**Day 3 Status**: COMPLETELY FIXED AND READY FOR PRODUCTION

---

**Last Updated**: MAJOR ARCHITECTURE CHANGE - Internal HR Tool Only ⚠️
**Architecture**: INTERNAL HR TOOL - All operations require authentication
**Previous**: Public job applications + Internal candidate management ❌
**Current**: HR uploads candidate resumes + Internal candidate management ✅

## 🚨 BREAKING CHANGES SUMMARY

### Removed Public Endpoints (No Longer Available):
- `GET /api/v1/jobs/public/list` → `GET /api/v1/jobs/dev/list` (auth required)
- `GET /api/v1/jobs/public/{job_id}` → `GET /api/v1/jobs/dev/{job_id}` (auth required)
- `POST /api/v1/candidates/public/apply-to-job/{job_id}` → REMOVED
- `GET /api/v1/candidates/public/application-status/{email}` → REMOVED

### New HR Upload System:
- `POST /api/v1/candidates/upload-resume-for-job/{job_id}` (auth required)
- `POST /api/v1/candidates/upload-resume` (auth required)
- `POST /api/v1/candidates/{id}/associate-job/{job_id}` (auth required)

### New Model Fields:
- `uploaded_by`: User ID of HR who uploaded
- `upload_source`: "hr_upload" tracking

### Optional Field System:
- All candidate fields (name, email, phone, location) are optional
- Uses "To be extracted by VLM" as placeholder when not provided
- VLM integration ready for automatic info extraction

For questions or clarifications, refer to the backend API documentation at `/docs` or contact the backend development team. 