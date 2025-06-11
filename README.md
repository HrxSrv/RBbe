# RecruitBot - Smart Candidate Hiring Platform

**✅ SYSTEM STATUS: READY FOR FULL PIPELINE TESTING**

Platform for smart candidate hiring with AI-powered resume analysis and automated call scheduling. **Complete pipeline implemented and ready for testing**: HR uploads candidate resume → text extraction → Gemini analysis → call scheduling.

## 🎯 Project Overview

RecruitBot is an **internal HR tool** that combines:
- **Company Management** - Customer onboarding and team management
- **Internal Job Management** - HR-only access to job postings with full question visibility  
- **HR Resume Upload System** - HR uploads candidate resumes with optional candidate info
- **Resume Analysis** - VLM-powered resume evaluation and candidate matching
- **Upload Tracking & Audit** - Complete audit trail of who uploaded each candidate
- **Call Scheduling System** - Automated call scheduling with VAPI integration points
- **Prompt Management** - Database-driven prompt system for AI customization
- **Analytics Dashboard** - Performance metrics and hiring insights

## 🏗️ Architecture

- **FastAPI** - Modern, fast web framework with automatic API documentation
- **MongoDB Atlas** - Cloud NoSQL database with Beanie ODM
- **Beanie ODM** - Async MongoDB ODM with Pydantic v2 integration
- **Google OAuth 2.0** - Authentication system with JWT tokens
- **Gemini VLM Integration** - Resume analysis and candidate scoring
- **VAPI Integration Points** - Voice AI for automated candidate calls
- **Prompt Management System** - Database-driven prompt customization
- **Pydantic v2** - Type-safe data validation and serialization

## 📊 Current Development Status

### ✅ **COMPLETE PIPELINE READY FOR TESTING**

**🚀 ALL PIPELINE COMPONENTS IMPLEMENTED:**
1. ✅ **Authentication & RBAC** - Google OAuth + JWT with 4-tier role system
2. ✅ **Job Management** - Internal dev endpoints with full question access
3. ✅ **Resume Upload System** - HR uploads with optional candidate fields
4. ✅ **Text Extraction Service** - Multi-format processing (PDF, DOC, DOCX)
5. ✅ **Gemini VLM Analysis** - Intelligent resume analysis with job context
6. ✅ **Call Scheduling System** - NEW: Complete call management with VAPI integration
7. ✅ **Prompt Management System** - Database-driven prompt customization

**🆕 LATEST ADDITIONS:**
- ✅ **Call Scheduling Endpoints** - `/calls/schedule`, `/calls/`, `/calls/{id}`
- ✅ **Pipeline Test Endpoint** - `/test-complete-pipeline` for comprehensive testing
- ✅ **Prompt Management** - Complete CRUD system for AI prompt customization
- ✅ **Upload Tracking** - Full audit trail with `uploaded_by` and `upload_source`

### ✅ **Day 1 - Foundation, Authentication & RBAC** (100% COMPLETED)

**Database Models & Schemas:**
- ✅ Customer model (company details, subscription plans, timestamps)
- ✅ User model (role-based access: super_admin, company_admin, recruiter, viewer)
- ✅ Job model (job postings with requirements, salary, location)
- ✅ Candidate model (resume analysis, application tracking)
- ✅ Call model (VAPI call scheduling and results)
- ✅ Prompt model (database-driven prompt system)
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
- ✅ **NEW**: Internal job listing endpoints (`/jobs/dev/list` - auth required)
- ✅ **NEW**: Internal job detail view endpoint (`/jobs/dev/{id}` - auth required)
- ✅ **Enhanced**: Full access to interview questions including ideal answers for internal users
- ✅ Advanced filtering for internal job management (location, type, remote)
- ✅ HR-focused browsing with authentication and customer isolation

### ✅ **Day 3: Resume Processing & VLM Integration** (100% COMPLETED)

**Complete Resume-to-VLM Workflow with Internal HR Upload System**

#### **✅ Core Infrastructure Implementation**:
- ✅ **File Upload Infrastructure** - Secure multipart upload with validation
- ✅ **Text Extraction Service** - Multi-format processing (PDF, DOC, DOCX) 
- ✅ **Gemini VLM Integration** - Intelligent resume analysis with job context
- ✅ **Internal HR Upload System** - Authentication-required HR tool for candidate management
- ✅ **Complete Internal Management** - Comprehensive company tools with RBAC

#### **✅ Step 1: File Upload System** - COMPLETED
- ✅ Secure file upload with MIME type validation (PDF, DOC, DOCX)
- ✅ File size limits and security checks (10MB max)
- ✅ Organized storage structure (`uploads/resumes/{customer_id}/{candidate_id}/`)
- ✅ Complete file lifecycle management (upload, metadata, cleanup)
- ✅ Internal HR authentication-only architecture
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

#### **✅ Step 4: Internal HR Upload System** - COMPLETED
- ✅ **HR Upload Endpoints**: `/candidates/upload-resume-for-job/{job_id}`, `/candidates/upload-resume`, `/candidates/{id}/associate-job/{job_id}`
- ✅ **Internal Management**: `/candidates/`, `/candidates/{id}`, `/candidates/analyze-resume/{id}`, etc.
- ✅ **Data Flow**: HR Login → Upload Resume → Customer ID → File Storage → Candidate Profile
- ✅ **Security**: Universal authentication requirement with proper RBAC integration
- ✅ **Upload Tracking**: Complete audit trail with `uploaded_by` and `upload_source` fields
- ✅ **Optional Fields**: VLM-ready system with "To be extracted by VLM" placeholders

### 🆕 **Pipeline Completion: Call Scheduling & Prompt Management** (NEW)

#### **✅ Call Scheduling System** - COMPLETED
- ✅ **Complete Call Management**: Schedule, list, view, update call status
- ✅ **VAPI Integration Points**: Ready for voice AI integration
- ✅ **Call Data Model**: Comprehensive tracking with candidate/job context
- ✅ **Analytics Ready**: Performance metrics and success tracking
- ✅ **Reschedule Support**: Call rescheduling with history tracking

#### **✅ Prompt Management System** - COMPLETED
- ✅ **Database-driven Prompts**: 5 prompt types (VAPI_INTERVIEW, VAPI_FIRST_MESSAGE, GEMINI_RESUME_TEXT, etc.)
- ✅ **Complete CRUD API**: Create, read, update, delete prompts with versioning
- ✅ **Customer-specific Overrides**: Company-specific prompt customization
- ✅ **Variable Mapping**: Dynamic prompt variables for personalization
- ✅ **Usage Tracking**: Analytics on prompt performance and usage
- ✅ **Fallback System**: Default prompts with customer overrides

#### **✅ Pipeline Test System** - COMPLETED
- ✅ **Complete Pipeline Test**: `/test-complete-pipeline` endpoint
- ✅ **Component Validation**: Tests all 6 pipeline components
- ✅ **Integration Verification**: End-to-end workflow validation
- ✅ **Frontend Integration Guide**: Complete API usage documentation

**API Endpoints Implemented:**
```bash
# INTERNAL AUTHENTICATION-REQUIRED SYSTEM
# Job Management
GET    /api/v1/jobs/dev/list                           # Internal job listing
GET    /api/v1/jobs/dev/{job_id}                       # Internal job details

# HR Resume Upload
POST   /api/v1/candidates/upload-resume-for-job/{job_id}   # Upload for specific job
POST   /api/v1/candidates/upload-resume                    # Upload to general pool
POST   /api/v1/candidates/{id}/associate-job/{job_id}      # Associate with job

# Candidate Management
GET    /api/v1/candidates/                              # List company candidates
GET    /api/v1/candidates/{id}                          # Get candidate details
PUT    /api/v1/candidates/{id}/status                   # Update application status
POST   /api/v1/candidates/analyze-resume/{id}           # Trigger VLM analysis
POST   /api/v1/candidates/qa-assessment/{id}            # Q&A readiness evaluation

# 🆕 Call Scheduling (NEW)
POST   /api/v1/calls/schedule                          # Schedule call
GET    /api/v1/calls/                                  # List calls with filtering
GET    /api/v1/calls/{call_id}                         # Get call details
PUT    /api/v1/calls/{call_id}/status                  # Update call status

# 🆕 Prompt Management (NEW)
GET    /api/v1/prompts/                                # List prompts
POST   /api/v1/prompts/                                # Create prompt
GET    /api/v1/prompts/{prompt_id}                     # Get prompt details
PUT    /api/v1/prompts/{prompt_id}                     # Update prompt

# Testing & Validation
POST   /api/v1/test-complete-pipeline                  # 🆕 Complete pipeline test
GET    /api/v1/test-day3-step1-file-upload             # File upload validation
GET    /api/v1/test-day3-step2-text-extraction         # Text extraction validation  
GET    /api/v1/test-day3-step3-gemini-integration      # VLM integration validation
```

**Technical Implementation Highlights:**
- **Internal HR tool architecture**: All operations require authentication
- **Multi-model VLM strategy** for cost-effective processing
- **Smart routing logic** based on text extraction confidence (<0.7 triggers vision)
- **Enhanced Q&A integration** with Day 2 job questions system
- **Robust error handling** with graceful degradation and detailed logging
- **RBAC security** throughout all internal operations
- **Customer data isolation** with automatic job-to-company association
- **Upload tracking and audit trail** for compliance and monitoring
- **Complete call scheduling workflow** ready for VAPI integration
- **Database-driven prompt management** for AI customization

**Pipeline Status**: COMPLETE AND READY FOR FRONTEND TESTING

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

# Gemini API
GEMINI_API_KEY=your-gemini-api-key
```

### Run Development Server

```bash
# Start the server
uv run run.py dev

# Verify health
curl http://localhost:8000/api/v1/health
```

## 🧪 Testing the Complete Pipeline

### 🆕 Test Complete Pipeline (NEW)
```bash
# Test the complete pipeline functionality
curl -X POST -H "Authorization: Bearer $ACCESS_TOKEN" \
  http://localhost:8000/api/v1/test-complete-pipeline
```

This comprehensive test validates:
- ✅ **Data Verification**: Customer, user, job models and relationships
- ✅ **File Upload**: Secure multipart upload with validation 
- ✅ **Text Extraction**: Multi-format processing with quality assessment
- ✅ **Gemini Analysis**: VLM integration with job context
- ✅ **Call Scheduling**: Complete call management system
- ✅ **Prompt System**: Database-driven prompt management
- ✅ **Authentication**: JWT token validation throughout
- ✅ **RBAC**: Role-based access control verification
- ✅ **Frontend Integration**: Complete API usage guide

### Manual Testing with Real Resume
```bash
# 1. Create sample data
curl -X POST http://localhost:8000/api/v1/create-sample-data

# 2. Get authentication token (replace with your Google OAuth flow)
# ACCESS_TOKEN=your_jwt_token_here

# 3. List available jobs
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
  http://localhost:8000/api/v1/jobs/dev/list

# 4. Upload real resume for specific job
curl -X POST -H "Authorization: Bearer $ACCESS_TOKEN" \
  http://localhost:8000/api/v1/candidates/upload-resume-for-job/YOUR_JOB_ID \
  -F "resume=@sampleresume.pdf" \
  -F "candidate_name=Test Candidate" \
  -F "candidate_email=test@example.com"

# 5. Trigger analysis (automatic during upload, but can be re-run)
curl -X POST -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  http://localhost:8000/api/v1/candidates/analyze-resume/CANDIDATE_ID \
  -d '{"job_id": "YOUR_JOB_ID"}'

# 6. Schedule call
curl -X POST -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  http://localhost:8000/api/v1/calls/schedule \
  -d '{
    "candidate_id": "CANDIDATE_ID",
    "job_id": "YOUR_JOB_ID", 
    "scheduled_time": "2024-01-15T10:00:00Z",
    "call_type": "screening"
  }'
```

### Test Individual Components
```bash
# Test Day 1 RBAC system
curl http://localhost:8000/api/v1/test-day1-features

# Test Day 2 job management with Q&A
curl -X POST http://localhost:8000/api/v1/test-day2-enhanced-features

# Test Day 3 VLM integration
curl -X GET http://localhost:8000/api/v1/test-day3-step3-gemini-integration

# Test internal tool architecture
curl -X GET http://localhost:8000/api/v1/test-internal-tool-architecture
```

## 📚 API Documentation

### 🆕 Pipeline Endpoints (Ready for Frontend)

**Authentication Flow:**
```bash
GET    /api/v1/auth/google              # Initiate Google OAuth
GET    /api/v1/auth/me                  # Get current user info
POST   /api/v1/auth/logout              # Logout user
```

**Complete HR Workflow:**
```bash
# 1. Job Management
GET    /api/v1/jobs/dev/list            # List company jobs
GET    /api/v1/jobs/dev/{job_id}        # Get job with questions

# 2. Resume Upload & Processing  
POST   /api/v1/candidates/upload-resume-for-job/{job_id}  # Upload resume
GET    /api/v1/candidates/{id}                            # View candidate

# 3. Analysis & Evaluation
POST   /api/v1/candidates/analyze-resume/{id}             # Trigger analysis
POST   /api/v1/candidates/qa-assessment/{id}              # Q&A readiness

# 4. Call Scheduling
POST   /api/v1/calls/schedule           # Schedule interview
GET    /api/v1/calls/                   # List scheduled calls
GET    /api/v1/calls/{call_id}          # Get call details

# 5. Prompt Management
GET    /api/v1/prompts/                 # List prompts  
POST   /api/v1/prompts/                 # Create custom prompt
PUT    /api/v1/prompts/{id}             # Update prompt
```

**System & Testing:**
```bash
GET    /api/v1/health                   # Health check
POST   /api/v1/create-sample-data       # Create test data
POST   /api/v1/test-complete-pipeline   # 🆕 Test complete system
```

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
│       ├── users.py       # User management
│       ├── jobs.py        # Job management
│       ├── candidates.py  # Candidate & resume processing
│       ├── calls.py       # 🆕 Call scheduling (NEW)
│       └── prompts.py     # 🆕 Prompt management (NEW)
├── models/                 # Beanie document models
│   ├── __init__.py        # Model imports & rebuilding
│   ├── customer.py        # Customer/Company model
│   ├── user.py           # User model with roles
│   ├── job.py            # Job posting model
│   ├── candidate.py      # Candidate profile model
│   ├── call.py           # Call scheduling model
│   └── prompt.py         # 🆕 Prompt model (NEW)
├── schemas/               # Pydantic request/response schemas
│   └── schemas.py
└── services/              # Business logic services
    ├── google_oauth.py
    ├── file_upload.py     # File upload & validation
    ├── text_extraction.py # Multi-format text extraction
    ├── gemini_service.py  # VLM integration
    └── prompt_service.py  # 🆕 Prompt management (NEW)
```

### Database Collections

**MongoDB Collections:**
- `customers` - Company data with subscription plans
- `users` - Team members with role-based access  
- `jobs` - Job postings with interview questions
- `candidates` - Candidate profiles with resume analysis and upload tracking
- `calls` - Scheduled calls with VAPI integration points
- `prompts` - 🆕 Database-driven prompt system (NEW)

## 🔒 Security Features

- **JWT token authentication** with Google OAuth
- **Role-based access control** with 27 granular permissions
- **4-tier role hierarchy** (Super Admin → Company Admin → Recruiter → Viewer)
- **Customer data isolation** - users only see their company's data
- **Upload audit trail** - complete tracking of who uploaded each resume
- **Environment-based secrets management**
- **CORS protection** and input validation
- **Secure file upload** with MIME type validation

## 🎯 Next Steps

1. ✅ **Day 1 COMPLETED** - Foundation, Authentication & RBAC
2. ✅ **Day 2 COMPLETED** - Enhanced Job Management + Q&A System
3. ✅ **Day 3 COMPLETED** - Resume Processing & VLM Integration
4. ✅ **Pipeline COMPLETED** - Call Scheduling & Prompt Management
5. **Frontend Development** - React/Next.js implementation of complete workflow
6. **VAPI Integration** - Voice AI for automated interviews
7. **Production Deployment** - Railway/Docker deployment with monitoring

## 🚀 Ready for Frontend Development

**✅ COMPLETE BACKEND PIPELINE:**
- Authentication & authorization system
- Job management with interview questions
- Resume upload with text extraction
- Gemini VLM analysis with job context
- Call scheduling with VAPI integration points
- Prompt management for AI customization
- Complete API documentation and testing

**🎯 FRONTEND PRIORITIES:**
1. **Authentication Flow** - Google OAuth integration
2. **HR Dashboard** - Job management and candidate overview
3. **Resume Upload Interface** - Drag & drop with progress indicators
4. **Candidate Review** - Analysis results and scoring display
5. **Call Scheduling** - Calendar integration and management
6. **Analytics Dashboard** - Performance metrics and insights

---

**Current Status:** ✅ **COMPLETE PIPELINE READY FOR FRONTEND TESTING**
**Next Step:** Frontend implementation of complete HR workflow
**VAPI Integration:** Backend endpoints ready, voice integration pending 