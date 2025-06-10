# RecruitBot - Smart Candidate Hiring Platform

Platform for smart candidate hiring with AI-powered resume analysis and automated call scheduling.

## 🎯 Project Overview

**⚠️ MAJOR ARCHITECTURE CHANGE: Internal HR Tool Only**

**RecruitBot** has been transformed into an **internal HR tool** that combines:
- **Company Management** - Customer onboarding and team management
- **Internal Job Management** - HR-only access to job postings with full question visibility
- **HR Resume Upload System** - HR uploads candidate resumes with optional candidate info
- **Resume Analysis** - VLM-powered resume evaluation and candidate matching
- **Upload Tracking & Audit** - Complete audit trail of who uploaded each candidate
- **Automated Calling** - VAPI integration for scheduled candidate interviews
- **Analytics Dashboard** - Performance metrics and hiring insights

## 🏗️ Architecture

- **FastAPI** - Modern, fast web framework with automatic API documentation
- **MongoDB Atlas** - Cloud NoSQL database with Beanie ODM
- **Beanie ODM** - Async MongoDB ODM with Pydantic v2 integration
- **Google OAuth 2.0** - Authentication system with JWT tokens
- **VLM Integration** - Resume analysis and candidate scoring
- **VAPI** - Voice AI for automated candidate calls
- **Pydantic v2** - Type-safe data validation and serialization

## 📊 Current Development Status

### ✅ **Day 1 - Foundation, Authentication & RBAC** (100% COMPLETED)

**Database Models & Schemas:**
- ✅ Customer model (company details, subscription plans, timestamps)
- ✅ User model (role-based access: super_admin, company_admin, recruiter, viewer)
- ✅ Job model (job postings with requirements, salary, location)
- ✅ Candidate model (resume analysis, application tracking)
- ✅ Call model (VAPI call scheduling and results)
- ✅ All models with proper timestamp fields and Beanie ODM integration

**Infrastructure:**
- ✅ Beanie ODM integration for clean database operations
- ✅ MongoDB Atlas connection with proper error handling
- ✅ Google OAuth authentication with JWT tokens
- ✅ Environment-based configuration management
- ✅ Comprehensive logging with Loguru
- ✅ CORS middleware and request logging

**Authentication & Authorization:**
- ✅ Google OAuth authentication flow
- ✅ JWT token validation and refresh
- ✅ Complete RBAC system with 27 granular permissions
- ✅ 4-tier role hierarchy (Super Admin → Company Admin → Recruiter → Viewer)
- ✅ Permission decorators: `@require_permission()`, `@require_role()`, `@require_admin()`
- ✅ Role-based endpoint protection

**Customer Management:**
- ✅ Public company registration endpoint (`/customers/register`)
- ✅ Customer CRUD operations with access control
- ✅ Company data validation and duplicate prevention
- ✅ Subscription plan management (Free → Professional → Enterprise)

**User Management & Invitations:**
- ✅ Complete user invitation system (`/invitations/invite`, `/invitations/accept`)
- ✅ 7-day expiration on invitations with status tracking
- ✅ Role assignment during invitation (Recruiter/Viewer)
- ✅ Company-scoped user operations and listing
- ✅ User deactivation (admin-only)

**API Endpoints:**
- ✅ Health check and database testing
- ✅ Comprehensive Day 1 feature testing endpoint
- ✅ Sample data creation for all models
- ✅ Protected user management endpoints

### ✅ **Day 2: Enhanced Job Management + Q&A System** (100% COMPLETED)

**Core Job CRUD Operations:**
- ✅ Job model with comprehensive fields (title, description, requirements, salary, location)
- ✅ Job creation endpoint with RBAC protection (`@require_permission(Permission.CREATE_JOB)`)
- ✅ Job update/edit functionality for recruiters and admins
- ✅ Job deletion and status management (draft → active → paused → closed)
- ✅ Job publish/unpublish workflow with status transitions

**Enhanced Job Features:**
- ✅ Job search with multiple filters (location, job type, status, experience level)
- ✅ Pagination and sorting for job listings (skip/limit with validation)
- ✅ Advanced location filtering with regex-based search
- ✅ Job type and status enum validation
- ✅ Company data isolation (users only see their company's jobs)

**🆕 Job Questions System:**
- ✅ Multi-question setup with ideal answers for each job
- ✅ Question weighting system (importance scoring)
- ✅ Questions included in all job CRUD operations
- ✅ Security: Ideal answers hidden in public job listings
- ✅ Integration ready for VLM analysis and VAPI calls

**🆕 Candidate Q&A Framework:**
- ✅ Complete QA data structure for call interviews
- ✅ Individual question-answer scoring system
- ✅ Call summary and analysis tracking
- ✅ Interview duration and performance metrics
- ✅ Integration points for VLM answer analysis

**Job Analytics & Tracking:**
- ✅ Job view count tracking (auto-increment on job access)
- ✅ Application count per job tracking
- ✅ Job analytics summary endpoint (`/jobs/analytics/summary`)
- ✅ Performance metrics (view-to-application ratios)
- ✅ Company-level job statistics and insights

**🚨 UPDATED: Internal Job Management Workflow:**
- ⚠️ **REMOVED**: `GET /jobs/public/list` - No longer available ❌
- ⚠️ **REMOVED**: `GET /jobs/public/{id}` - No longer available ❌
- ✅ **NEW**: Internal job listing endpoints (`/jobs/dev/list` - auth required)
- ✅ **NEW**: Internal job detail view endpoint (`/jobs/dev/{id}` - auth required)
- ✅ **Enhanced**: Full access to interview questions including ideal answers for internal users
- ✅ Advanced filtering for internal job management (location, type, remote)
- ✅ HR-focused browsing with authentication and customer isolation

**Integration Preparations:**
- ✅ Job-to-candidate matching algorithm foundation (TODO comments ready)
- ✅ VLM integration points prepared for Q&A analysis
- ✅ VAPI call scheduling integration points with Q&A questions
- ✅ Answer scoring and analysis framework complete

**jobs** - Job postings with interview questions
```javascript
{
  "_id": ObjectId,
  "customer_id": Link[Customer],
  "created_by": Link[User],
  "title": "Senior Python Developer",
  "description": "Job description...",
  "requirements": ["Python", "FastAPI", "MongoDB"],
  "location": "San Francisco, CA",
  
  // Enhanced: Interview Questions
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
  ],
  
  "salary_range": {
    "min_salary": 120000,
    "max_salary": 160000,
    "currency": "USD"
  },
  "job_type": "full_time", // full_time, part_time, contract, internship
  "status": "active", // draft, active, paused, closed
  "department": "Engineering",
  "experience_level": "senior",
  "remote_allowed": true,
  "application_deadline": datetime,
  "view_count": 0,
  "application_count": 0,
  "created_at": datetime,
  "updated_at": datetime
}
```

**candidates** - Candidate profiles with Q&A data
```javascript
{
  "_id": ObjectId,
  "personal_info": {
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "phone": "+1-555-0123",
    "location": "New York, NY"
  },
  "resume_analysis": {
    "skills": ["Python", "FastAPI", "React"],
    "experience_years": 6,
    "education": "BS Computer Science",
    "previous_roles": ["Senior Engineer"],
    "matching_score": 87.5,
    "analysis_summary": "Strong technical background...",
    "resume_file_path": "/uploads/resumes/alice.pdf"
  },
  "applications": [
    {
      "job_id": "job_objectid",
      "application_date": datetime,
      "status": "applied", // applied, screening, interview, rejected, hired
      "matching_score": 87.5,
      "notes": "Strong candidate",
      
      // Enhanced: Call Q&A Data
      "call_qa": {
        "call_id": "call_456",
        "call_date": datetime,
        "questions_answers": [
          {
            "question": "What is your experience with FastAPI?",
            "answer": "I have been working with FastAPI for about 4 years, primarily building microservices...",
            "ideal_answer": "I have 3+ years experience building REST APIs with FastAPI...",
            "score": 92.5,
            "analysis": "Excellent answer that exceeds the ideal response with specific technical details."
          }
        ],
        "overall_score": 88.7,
        "interview_summary": "Candidate demonstrates strong technical skills with excellent FastAPI knowledge.",
        "call_duration_minutes": 35
      }
    }
  ],
  "total_applications": 1,
  "status": "active", // active, hired, inactive
  "created_at": datetime,
  "updated_at": datetime
}
```

**calls** - VAPI call scheduling and tracking
```javascript
{
  "_id": ObjectId,
  "candidate_id": Link[Candidate],
  "job_id": Link[Job],
  "customer_id": Link[Customer],
  "scheduled_time": datetime,
  "call_type": "screening", // screening, interview, follow_up
  "status": "scheduled", // scheduled, in_progress, completed, cancelled, no_show, failed
  "vapi_call_id": "vapi_call_123",
  "vapi_assistant_id": "assistant_456",
  "call_duration": 1800, // seconds
  "call_summary": "Positive screening call",
  "call_transcript": "Full call transcript...",
  "call_recording_url": "https://recordings.vapi.ai/...",
  "candidate_score": 78.5,
  "interviewer_notes": "Strong technical skills",
  "next_steps": "Schedule technical interview",
  "scheduled_by": "user_id",
  "rescheduled_count": 0,
  "created_at": datetime,
  "updated_at": datetime
}
```

### ✅ **Day 3: Resume Processing & VLM Integration** (100% COMPLETED)

**Complete Resume-to-VLM Workflow with Public Job Application System**

#### **✅ Core Infrastructure Implementation**:
- ✅ **File Upload Infrastructure** - Secure multipart upload with validation
- ✅ **Text Extraction Service** - Multi-format processing (PDF, DOC, DOCX) 
- ✅ **Gemini VLM Integration** - Intelligent resume analysis with job context
- ✅ **Public Job Application System** - Seamless candidate experience without authentication
- ✅ **Internal Candidate Management** - Comprehensive company tools with RBAC

#### **✅ Step 1: File Upload System** - COMPLETED
- ✅ Secure file upload with MIME type validation (PDF, DOC, DOCX)
- ✅ File size limits and security checks (10MB max)
- ✅ Organized storage structure (`uploads/resumes/{customer_id}/{candidate_id}/`)
- ✅ Complete file lifecycle management (upload, metadata, cleanup)
- ✅ Public and internal endpoint architecture
- ✅ Automatic customer ID association from job context

#### **✅ Step 2: Text Extraction Service** - COMPLETED  
- ✅ Multi-format text extraction with quality assessment
- ✅ Dual PDF processing strategy (PyPDF2 + pdfplumber)
- ✅ DOC/DOCX processing with python-docx
- ✅ Confidence scoring and VLM routing recommendations (0.0-1.0)
- ✅ Batch processing capabilities with error handling
- ✅ Intelligent preprocessing and normalization

#### **✅ Step 3: Gemini VLM Integration Service** - COMPLETED
- ✅ **Dual-model strategy**: gemini-1.5-flash (text) + gemini-1.5-pro (vision)
- ✅ **Intelligent routing**: Quality-based model selection (<0.7 confidence → vision)
- ✅ **Complete resume analysis**: Skills extraction, experience assessment, education parsing
- ✅ **Job context integration**: Job-specific matching and compatibility scoring
- ✅ **Q&A readiness assessment**: Interview preparation scoring for Day 2 questions
- ✅ **Batch processing**: Concurrent analysis with rate limiting (max 3)
- ✅ **Structured output**: Consistent JSON parsing with comprehensive error handling
- ✅ **Cost optimization**: Smart routing for efficient API usage

#### **🚨 UPDATED: Step 4: HR Resume Upload System** - CONVERTED TO INTERNAL
- ⚠️ **REMOVED**: `/candidates/public/apply-to-job/{job_id}` - No longer available ❌
- ⚠️ **REMOVED**: `/candidates/public/application-status/{email}` - No longer available ❌
- ✅ **NEW HR Endpoints**: `/candidates/upload-resume-for-job/{job_id}`, `/candidates/upload-resume`, `/candidates/{id}/associate-job/{job_id}`
- ✅ **Internal Endpoints**: `/candidates/`, `/candidates/{id}`, `/candidates/analyze-resume/{id}`, etc.
- ✅ **Data Flow**: HR Login → Upload Resume → Customer ID → File Storage → Candidate Profile
- ✅ **Security**: Universal authentication requirement with proper RBAC integration
- ✅ **Upload Tracking**: Complete audit trail with `uploaded_by` and `upload_source` fields
- ✅ **Optional Fields**: VLM-ready system with "To be extracted by VLM" placeholders

#### **✅ Integration Architecture**:
- ✅ **Public Application Flow**: Job browsing → Resume upload → VLM analysis → Profile creation
- ✅ **Internal Management Flow**: Company login → Candidate review → Status updates → Analysis triggers
- ✅ **Day 2 Integration**: Job questions system fully integrated for Q&A assessment
- ✅ **Day 4 Ready**: Complete candidate-to-company workflow prepared

**API Endpoints Implemented:**
```bash
# PUBLIC (No Authentication) - For Job Seekers
POST   /api/v1/candidates/public/apply-to-job/{job_id}    # Apply to job with resume
GET    /api/v1/candidates/public/application-status/{email} # Check application status

# INTERNAL (Authentication Required) - For Companies  
GET    /api/v1/candidates/                                # List company candidates
GET    /api/v1/candidates/{id}                            # Get candidate details
PUT    /api/v1/candidates/{id}/status                     # Update application status
POST   /api/v1/candidates/analyze-resume/{id}             # Trigger VLM analysis
POST   /api/v1/candidates/qa-assessment/{id}              # Q&A readiness evaluation
POST   /api/v1/candidates/batch-analyze                   # Bulk candidate processing
GET    /api/v1/candidates/files/{id}/metadata             # File metadata retrieval
DELETE /api/v1/candidates/files/{id}                      # File deletion with cleanup

# Testing & Validation
GET    /api/v1/test-day3-step1-file-upload                # File upload validation
GET    /api/v1/test-day3-step2-text-extraction            # Text extraction validation  
GET    /api/v1/test-day3-step3-gemini-integration         # VLM integration validation
POST   /api/v1/test-day3-complete-fixed                   # Complete architecture test
```

**Technical Implementation Highlights:**
- **Dual endpoint architecture**: Seamless separation of public and internal workflows
- **Multi-model VLM strategy** for cost-effective processing
- **Smart routing logic** based on text extraction confidence (<0.7 triggers vision)
- **Enhanced Q&A integration** with Day 2 job questions system
- **Robust error handling** with graceful degradation and detailed logging
- **RBAC security** throughout all internal operations
- **Customer data isolation** with automatic job-to-company association
- **Optimized user experience**: Frictionless candidate job applications

**Day 3 Status**: COMPLETE AND PRODUCTION READY

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- MongoDB Atlas account
- Google OAuth credentials
- UV package manager

### Installation

```bash
# Clone repository
git clone <repository-url>
cd RecruitBotv2

# Install dependencies
uv sync

# Copy environment configuration
cp envexample.txt newenv.txt
# Edit newenv.txt with your configuration
```

### Environment Setup

Update `newenv.txt` with your credentials:

```bash
# Database
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DATABASE=recruitbot_dev

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# JWT Security
JWT_SECRET_KEY=your-32-character-secret-key
```

### Run Development Server

```bash
# Start the server
uv run run.py dev

# Verify health
curl http://localhost:8000/api/v1/health
```

## 🧪 Testing the System

### Test Day 1 Completion
```bash
curl http://localhost:8000/api/v1/test-day1-features
```

This comprehensive test validates:
- ✅ RBAC system with 27 permissions across 4 roles
- ✅ Permission hierarchy and role validation
- ✅ Database models and relationships
- ✅ Router integration and endpoint availability

### Test Day 2 Enhanced Features
```bash
curl -X POST http://localhost:8000/api/v1/test-day2-enhanced-features
```

This comprehensive test validates:
- ✅ Job questions schema validation and structure
- ✅ Candidate QA framework validation
- ✅ Integration readiness for Day 3 (VLM) and Day 4-5 (VAPI)
- ✅ Complete schema hierarchy for Q&A data

### Test Day 3 Implementation
```bash
# Test complete Day 3 implementation
curl -X POST http://localhost:8000/api/v1/test-day3-complete-fixed

# Test individual Day 3 components
curl -X GET http://localhost:8000/api/v1/test-day3-step1-file-upload
curl -X GET http://localhost:8000/api/v1/test-day3-step2-text-extraction
curl -X GET http://localhost:8000/api/v1/test-day3-step3-gemini-integration
```

### 🆕 Test Internal Tool Architecture
```bash
# Test the complete architectural transformation
curl -X GET http://localhost:8000/api/v1/test-internal-tool-architecture
```

This comprehensive test validates:
- ✅ **Architecture transformation**: Conversion from public platform to internal HR tool
- ✅ **Endpoint changes**: Public endpoints removed, internal dev endpoints added
- ✅ **Authentication requirements**: All operations require valid JWT tokens
- ✅ **Upload system**: HR resume upload with optional field handling
- ✅ **Tracking fields**: Upload audit trail with `uploaded_by` and `upload_source`
- ✅ **Customer isolation**: Proper data filtering and RBAC integration

### 🚨 UPDATED: Test HR Resume Upload System
```bash
# ⚠️ UPDATED: HR upload system (auth required)
curl -X POST -H "Authorization: Bearer $ACCESS_TOKEN" http://localhost:8000/api/v1/candidates/upload-resume-for-job/{job_id} \
  -F "resume=@resume.pdf" \
  -F "candidate_name=John Doe" \
  -F "candidate_email=john@example.com" \
  -F "candidate_phone=+1-555-0123" \
  -F "candidate_location=New York, NY"

# Upload to general candidate pool
curl -X POST -H "Authorization: Bearer $ACCESS_TOKEN" http://localhost:8000/api/v1/candidates/upload-resume \
  -F "resume=@resume.pdf" \
  -F "candidate_name=Jane Smith"

# Associate existing candidate with job
curl -X POST -H "Authorization: Bearer $ACCESS_TOKEN" http://localhost:8000/api/v1/candidates/{candidate_id}/associate-job/{job_id}
```

This comprehensive test validates:
- ✅ **HR resume upload system**: Authenticated HR tool for candidate management
- ✅ File upload infrastructure with security validation
- ✅ Multi-format text extraction (PDF, DOC, DOCX) with quality assessment
- ✅ Gemini VLM service integration with dual-model strategy
- ✅ Job context-aware resume analysis and Q&A readiness assessment
- ✅ Internal authentication-only architecture with proper RBAC
- ✅ Upload tracking and audit trail with `uploaded_by` field
- ✅ Optional field system with VLM-ready placeholders
- ✅ Customer data isolation and proper job association
- ✅ Complete internal HR workflow for production use

### Test Job Creation with Questions
```bash
curl -X POST http://localhost:8000/api/v1/jobs/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Senior Python Developer with Q&A",
    "description": "Looking for experienced Python developer - Enhanced with interview questions",
    "requirements": ["Python", "FastAPI", "MongoDB"],
    "location": "San Francisco, CA",
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

### Test Customer Registration
```bash
curl -X POST http://localhost:8000/api/v1/customers/register \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "NewTech Corp",
    "email": "admin@newtech.com",
    "website": "https://newtech.com",
    "industry": "SaaS",
    "company_size": "10-50"
  }'
```

### Test Database Connection
```bash
curl http://localhost:8000/api/v1/test-db
```

### Create Sample Data
```bash
curl -X POST http://localhost:8000/api/v1/create-sample-data
```

This creates a complete data set:
- **1 Customer:** TechCorp Solutions (Professional plan)
- **2 Users:** John Admin (company_admin) + Jane Recruiter (recruiter)
- **1 Job:** Senior Python Developer ($120K-$160K, Remote allowed)
- **1 Candidate:** Alice Johnson (87.5% match, 6 years experience)
- **1 Call:** Scheduled screening call (2 days from creation)

### Test RBAC System
```bash
# This endpoint shows permission counts per role:
# Super Admin: 27 permissions
# Company Admin: 23 permissions  
# Recruiter: 14 permissions
# Viewer: 6 permissions
curl http://localhost:8000/api/v1/test-day1-features | jq '.rbac_system'
```

### Verify in MongoDB Atlas
Check your database collections:
- `customers` - Company data with subscription plans
- `users` - Team members with role-based access
- `jobs` - Job postings with requirements and salary ranges
- `candidates` - Candidate profiles with resume analysis
- `calls` - Scheduled calls with VAPI integration points

## 📚 API Documentation

### Current Endpoints

**Authentication:**
- `POST /api/v1/auth/google` - Google OAuth login
- `GET /api/v1/auth/validate` - Validate JWT token
- `POST /api/v1/auth/logout` - User logout

**Customer Management:**
- `POST /api/v1/customers/register` - Public company registration
- `GET /api/v1/customers/` - List customers (admin only)
- `GET /api/v1/customers/{id}` - Get customer details
- `PUT /api/v1/customers/{id}` - Update customer details
- `DELETE /api/v1/customers/{id}` - Deactivate customer (super admin)

**User Management:**
- `GET /api/v1/users/me` - Get current user profile
- `GET /api/v1/users/` - List company users (role-filtered)
- `GET /api/v1/users/{id}` - Get user details
- `PUT /api/v1/users/{id}/deactivate` - Deactivate user (admin)

**Invitations:**
- `POST /api/v1/invitations/invite` - Invite team member (admin/company_admin)
- `POST /api/v1/invitations/accept/{id}` - Accept invitation (public)

**Job Management:**
- `POST /api/v1/jobs/` - Create job posting (recruiter+)
- `GET /api/v1/jobs/` - List jobs with filtering and pagination (recruiter+)
- `GET /api/v1/jobs/{id}` - Get job details with view tracking (recruiter+)
- `PUT /api/v1/jobs/{id}` - Update job details (recruiter+)
- `DELETE /api/v1/jobs/{id}` - Archive job (soft delete) (recruiter+)
- `POST /api/v1/jobs/{id}/publish` - Publish job (draft → active) (recruiter+)
- `GET /api/v1/jobs/analytics/summary` - Job analytics and metrics (recruiter+)

**Public Job Endpoints (No Authentication):**
- `GET /api/v1/jobs/public/list` - Browse active jobs (public)
- `GET /api/v1/jobs/public/{id}` - View job details (public)

**System & Testing:**
- `GET /api/v1/health` - Health check
- `GET /api/v1/test-db` - Database connection test
- `GET /api/v1/test-day1-features` - Comprehensive Day 1 functionality test
- `GET /api/v1/test-day2-features` - Comprehensive Day 2 job management test
- `POST /api/v1/test-day2-enhanced-features` - Enhanced Day 2 Q&A system test
- `POST /api/v1/create-sample-data` - Create test data

**Interactive Documentation:**
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🔧 Development Workflow

### Project Structure
```
app/
├── main.py                 # Application entry point
├── config/
│   ├── settings.py         # Environment configuration
│   └── database.py         # MongoDB + Beanie setup
├── core/
│   ├── auth.py            # JWT authentication
│   ├── middleware.py      # Request/response middleware
│   └── logging_config.py  # Logging setup
├── api/v1/
│   ├── routes.py          # Main API router
│   └── endpoints/
│       ├── auth.py        # Authentication endpoints
│       └── users.py       # User management
├── models/                 # Beanie document models
│   ├── __init__.py        # Model imports & rebuilding
│   ├── customer.py        # Customer/Company model
│   ├── user.py           # User model with roles
│   ├── job.py            # Job posting model
│   ├── candidate.py      # Candidate profile model
│   └── call.py           # Call scheduling model
├── schemas/               # Pydantic request/response schemas
│   └── schemas.py
└── services/              # Business logic services
    └── google_oauth.py
```

### Adding New Features

1. **Define Model** in `app/models/`
2. **Add to __init__.py** imports and model rebuilding
3. **Create Schemas** in `app/schemas/`
4. **Implement Endpoints** in `app/api/v1/endpoints/`
5. **Register Routes** in `app/api/v1/routes.py`

### Database Operations with Beanie

```python
# Create
customer = Customer(company_name="New Company", email="test@company.com")
await customer.save()

# Find
customer = await Customer.find_one(Customer.email == "test@company.com")
customers = await Customer.find(Customer.is_active == True).to_list()

# Update
await customer.set({Customer.company_name: "Updated Name"})

# Delete
await customer.delete()
```

## 🚢 Deployment

Ready for deployment on:
- **Railway** - Automatic deployment from Git
- **Docker** - Containerized deployment
- **Any cloud provider** supporting Python apps

## 🔒 Security Features

- JWT token authentication
- Role-based access control (in progress)
- Google OAuth integration
- Environment-based secrets management
- CORS protection
- Input validation with Pydantic

## 🎯 Next Steps

1. ✅ **Day 1 COMPLETED** - RBAC middleware and user invitation system implemented
2. ✅ **Day 2 COMPLETED** - Job management system with Q&A framework
3. ✅ **Day 3 COMPLETED** - Resume processing and Gemini VLM integration
4. **Day 4** - Enhanced candidate management with VLM workflow
5. **Day 5** - VAPI integration for automated voice interviews
6. **Day 6** - Admin dashboard and production deployment

---

**Current Status:** Day 3 Complete ✅ (Resume Processing & VLM Integration - Public job application system + Internal candidate management with complete VLM workflow) 