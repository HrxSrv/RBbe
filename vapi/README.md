# VAPI Service - Voice AI Integration for RecruitBot

## Overview

This is a separate microservice that handles VAPI (Voice AI) integration for automated candidate interviews in RecruitBot.

## Prerequisites

Before setting up the VAPI service, you need to configure phone number access for making outbound calls. VAPI supports two methods:

### Option 1: VAPI Phone Number (Recommended)
1. Log in to your [VAPI Dashboard](https://dashboard.vapi.ai)
2. Navigate to Phone Numbers section
3. Purchase or configure a phone number
4. Copy the Phone Number ID
5. Set `VAPI_PHONE_NUMBER_ID` in your `vapi.env` file

### Option 2: Twilio Phone Number
1. Create a [Twilio account](https://www.twilio.com/)
2. Purchase a phone number with voice capabilities
3. Get your Account SID and Auth Token from Twilio Console
4. Configure Twilio credentials in `vapi.env`

## Environment Configuration

Copy `vapi.env` and update with your values:

```env
# VAPI API Configuration
VAPI_API_KEY=your_vapi_api_key_here
VAPI_BASE_URL=https://api.vapi.ai

# Option 1: Use VAPI Phone Number (Recommended)
VAPI_PHONE_NUMBER_ID=your_vapi_phone_number_id_here

# Option 2: Use Twilio Phone Number
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here  
TWILIO_PHONE_NUMBER=+1234567890  # Your Twilio phone number in E.164 format

# Database Configuration (same as RecruitBot)
MONGODB_URL=mongodb+srv://...
MONGODB_DATABASE=recruitbot_dev
```

**Note**: You only need to configure ONE of the phone number options. VAPI Phone Number ID is preferred for better integration.

## Architecture

The VAPI service operates as a standalone microservice that:
- Creates job-specific AI assistants for interviews
- Schedules and manages voice calls with candidates using proper phone number configuration
- Processes call transcripts and extracts Q&A data
- Integrates with RecruitBot's MongoDB database for call management

## Service Structure

```
vapi/
├── main.py                 # FastAPI service entry point
├── config/
│   └── settings.py         # VAPI configuration and environment variables
├── services/
│   ├── vapi_client.py      # VAPI API client wrapper
│   ├── assistant.py        # Assistant creation and management
│   ├── call_manager.py     # Call scheduling and tracking
│   └── webhook_handler.py  # Process VAPI webhooks
├── models/
│   └── vapi_models.py      # VAPI-specific Pydantic models
├── api/
│   └── endpoints.py        # VAPI service API endpoints
└── utils/
    └── database.py         # MongoDB connection (shared with RecruitBot)
```

## Integration Points

- **RecruitBot Database**: Connects to same MongoDB for calls, jobs, candidates data
- **VAPI API**: Creates assistants and manages voice calls
- **Phone Integration**: Supports both VAPI managed and Twilio phone numbers
- **Webhooks**: Receives call completion data from VAPI
- **VLM Integration**: Uses existing Gemini service for answer analysis

## Development Workflow

1. **Step 1**: Basic service setup and VAPI client ✅
2. **Step 2**: Assistant creation with job questions ✅
3. **Step 3**: Call scheduling and management (Current)
4. **Step 4**: Webhook processing and Q&A extraction
5. **Step 5**: Integration testing with RecruitBot

## Phone Number Setup Guide

### For VAPI Phone Numbers:
1. Visit [VAPI Dashboard](https://dashboard.vapi.ai)
2. Go to Phone Numbers section
3. Click "Add Phone Number"
4. Choose your country and purchase a number
5. Copy the Phone Number ID
6. Add to `vapi.env`: `VAPI_PHONE_NUMBER_ID=phone_xxxxx`

### For Twilio Phone Numbers:
1. Create [Twilio account](https://console.twilio.com/)
2. Buy a phone number with Voice capability
3. Get Account SID and Auth Token from Console
4. Add to `vapi.env`:
   ```
   TWILIO_ACCOUNT_SID=ACxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

## Testing

### Test Phone Number Configuration:
```bash
curl -X POST "http://localhost:8001/vapi/test-real-call"
```

This endpoint will:
- Validate phone number configuration
- Create a test assistant
- Initiate an actual call to +919073554610
- Return call details and instructions

### Individual Component Testing:
- VAPI API connectivity: `GET /vapi/test-connection`
- Assistant creation: `POST /vapi/test-assistant-creation`
- Call simulation: `POST /vapi/test-call-simulation`

## Error Resolution

### "Need Either phoneNumberId Or phoneNumber" Error:
This error occurs when phone number configuration is missing. Ensure you have configured either:
- `VAPI_PHONE_NUMBER_ID` for VAPI managed numbers, OR
- Complete Twilio configuration (SID, Token, Phone Number)

Check your `vapi.env` file and restart the service after updating configuration. 