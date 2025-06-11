from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union
from enum import Enum


# Voice Provider Models
class VoiceProvider(str, Enum):
    ELEVEN_LABS = "11labs"
    OPENAI = "openai"
    DEEPGRAM = "deepgram"
    TAVUS = "tavus"


class VoiceConfig(BaseModel):
    """Voice configuration for VAPI assistant"""
    provider: VoiceProvider = VoiceProvider.ELEVEN_LABS
    voiceId: str = "21m00Tcm4TlvDq8ikWAM"  # Default ElevenLabs voice


# Transcriber Models
class TranscriberProvider(str, Enum):
    DEEPGRAM = "deepgram"
    TALKSCRIBER = "talkscriber"


class TranscriberConfig(BaseModel):
    """Transcriber configuration for speech-to-text"""
    provider: TranscriberProvider = TranscriberProvider.DEEPGRAM
    language: str = "en"
    model: str = "whisper"


# Model Provider Models  
class ModelProvider(str, Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    VAPI = "vapi"
    XAI = "xai"


class ModelMessage(BaseModel):
    """System/user message for model configuration"""
    role: str  # "system", "user", "assistant"
    content: str


class ModelConfig(BaseModel):
    """AI model configuration for conversation"""
    provider: ModelProvider = ModelProvider.OPENAI
    model: str = "gpt-4"
    temperature: float = 0.7
    maxTokens: Optional[int] = 1000
    messages: List[ModelMessage] = []


# Assistant Configuration Models
class AssistantServer(BaseModel):
    """Webhook server configuration"""
    url: str
    timeoutSeconds: Optional[int] = 20
    secret: Optional[str] = None


class ArtifactPlan(BaseModel):
    """Recording and transcript configuration"""
    recordingEnabled: bool = True
    videoRecordingEnabled: bool = False
    transcriptPlan: Dict[str, bool] = {"enabled": True}


class StartSpeakingPlan(BaseModel):
    """Configuration for when assistant starts speaking"""
    waitSeconds: float = 0.4
    smartEndpointingEnabled: bool = True


class StopSpeakingPlan(BaseModel):
    """Configuration for when assistant stops speaking"""
    numWords: int = 2
    voiceSeconds: float = 0.3
    backoffSeconds: float = 1.0


# Main Assistant Models
class VAPIAssistantRequest(BaseModel):
    """Request model for creating VAPI assistant"""
    name: str
    firstMessage: str
    firstMessageMode: str = "assistant-speaks-first"
    
    # Core components
    transcriber: TranscriberConfig
    model: ModelConfig
    voice: VoiceConfig
    
    # Configuration
    maxDurationSeconds: int = 1800  # 30 minutes
    silenceTimeoutSeconds: int = 30
    backgroundSound: str = "off"
    backgroundDenoisingEnabled: bool = True
    
    # Plans
    artifactPlan: Optional[ArtifactPlan] = None
    startSpeakingPlan: Optional[StartSpeakingPlan] = None
    stopSpeakingPlan: Optional[StopSpeakingPlan] = None
    
    # Server webhooks
    server: Optional[AssistantServer] = None
    
    # Messages for system prompt
    serverMessages: List[str] = [
        "conversation-update",
        "end-of-call-report", 
        "transcript",
        "tool-calls"
    ]
    
    # Metadata
    metadata: Optional[Dict[str, Any]] = None


class VAPIAssistantResponse(BaseModel):
    """Response model from VAPI assistant creation"""
    id: str
    orgId: str
    createdAt: str
    updatedAt: str
    name: str
    firstMessage: str
    transcriber: Dict[str, Any]
    model: Dict[str, Any]
    voice: Dict[str, Any]


# Call Models
class TwilioConfig(BaseModel):
    """Twilio configuration for phone number"""
    twilioAccountSid: str
    twilioAuthToken: str
    twilioPhoneNumber: str  # The Twilio phone number to use for outbound calls


class PhoneNumberObject(BaseModel):
    """Complete phone number object for VAPI call (when not using phoneNumberId)"""
    provider: str = "twilio"
    twilioAccountSid: str
    twilioAuthToken: str
    twilioPhoneNumber: str
    name: Optional[str] = None


class CallCustomer(BaseModel):
    """Customer/destination configuration for VAPI call"""
    number: str  # Phone number in E.164 format (e.g., "+919073554610") 
    numberE164CheckEnabled: Optional[bool] = True
    name: Optional[str] = None  # Customer name
    extension: Optional[str] = None  # Phone extension if needed
    sipUri: Optional[str] = None  # SIP URI for SIP calls


class VAPICallRequest(BaseModel):
    """Request model for initiating VAPI call"""
    # Assistant configuration - use either assistantId OR assistant object
    assistantId: Optional[str] = None
    assistant: Optional[Dict[str, Any]] = None  # Can provide assistant config directly
    
    # Phone number configuration - REQUIRED: either phoneNumberId OR phoneNumber
    phoneNumberId: Optional[str] = None  # If using existing phone number from VAPI
    phoneNumber: Optional[PhoneNumberObject] = None  # Complete phone number with Twilio config
    
    # Customer configuration - WHO to call
    customer: Optional[CallCustomer] = None  # Customer to call
    
    # Call configuration
    maxDurationSeconds: Optional[int] = 600  # 10 minutes default
    
    # Metadata
    metadata: Optional[Dict[str, Any]] = None


class VAPICallResponse(BaseModel):
    """Response model from VAPI call initiation"""
    id: str
    orgId: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
    status: Optional[str] = None
    assistantId: Optional[str] = None
    phoneNumber: Optional[str] = None
    phoneNumberId: Optional[str] = None  # May be included instead of phoneNumber
    customerId: Optional[str] = None
    customer: Optional[Dict[str, Any]] = None
    type: Optional[str] = None  # Call type (outboundPhoneCall, etc.)
    
    class Config:
        extra = "allow"  # Allow additional fields from VAPI response


# Webhook Models
class VAPIWebhookMessage(BaseModel):
    """Base webhook message from VAPI"""
    type: str
    call: Optional[Dict[str, Any]] = None
    message: Optional[Dict[str, Any]] = None
    timestamp: Optional[str] = None


class CallCompletedWebhook(BaseModel):
    """Webhook payload for completed call"""
    type: str = "call.completed"
    call: Dict[str, Any]
    transcript: Optional[str] = None
    recording: Optional[str] = None
    summary: Optional[str] = None
    duration: Optional[int] = None


# Job Context Models for Assistant Creation
class JobContextForAssistant(BaseModel):
    """Job context for creating interview assistant"""
    job_id: str
    job_title: str
    job_description: str
    requirements: List[str]
    questions: List[Dict[str, Any]]  # JobQuestion objects
    company_name: str
    experience_level: Optional[str] = None


class CandidateContextForAssistant(BaseModel):
    """Candidate context for personalized interview"""
    candidate_name: str
    candidate_email: Optional[str] = None
    resume_summary: Optional[str] = None
    relevant_skills: List[str] = []
    experience_years: Optional[int] = None 