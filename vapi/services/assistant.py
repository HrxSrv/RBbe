from typing import Optional, List
from loguru import logger

from config.settings import settings
from models.vapi_models import (
    VAPIAssistantRequest,
    VAPIAssistantResponse,
    TranscriberConfig,
    ModelConfig,
    ModelMessage,
    VoiceConfig,
    ArtifactPlan,
    StartSpeakingPlan,
    StopSpeakingPlan,
    AssistantServer,
    JobContextForAssistant,
    CandidateContextForAssistant
)
from services.vapi_client import VAPIClient


class AssistantCreationService:
    """Service for creating job-specific VAPI assistants"""
    
    def __init__(self):
        self.vapi_client = VAPIClient()
    
    async def create_interview_assistant(
        self,
        job_context: JobContextForAssistant,
        candidate_context: Optional[CandidateContextForAssistant] = None,
        webhook_url: Optional[str] = None
    ) -> Optional[VAPIAssistantResponse]:
        """Create a VAPI assistant tailored for job interview"""
        
        try:
            # Get prompts from database using the prompt service
            try:
                # Import the prompt service (this assumes the vapi module can access the main app)
                import sys
                import os
                sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
                from app.services.prompt_service import PromptService
                
                # Convert job context to dict format for prompt service
                job_context_dict = {
                    "company_name": job_context.company_name,
                    "job_title": job_context.job_title,
                    "experience_level": job_context.experience_level,
                    "requirements": job_context.requirements,
                    "questions": job_context.questions
                }
                
                # Convert candidate context to dict format
                candidate_context_dict = None
                if candidate_context:
                    candidate_context_dict = {
                        "candidate_name": candidate_context.candidate_name,
                        "relevant_skills": candidate_context.relevant_skills,
                        "experience_years": candidate_context.experience_years,
                        "resume_summary": candidate_context.resume_summary
                    }
                
                # Get prompts from database
                system_prompt = await PromptService.get_vapi_interview_prompt(
                    job_context_dict, 
                    candidate_context_dict,
                    None  # customer_id - TODO: extract from job_context or pass as parameter
                )
                
                first_message = await PromptService.get_vapi_first_message(
                    job_context_dict,
                    candidate_context_dict,
                    None  # customer_id - TODO: extract from job_context or pass as parameter
                )
                
                logger.info("✅ Successfully retrieved prompts from database")
                
            except Exception as e:
                logger.warning(f"⚠️ Failed to retrieve prompts from database, using fallback: {e}")
                # Fallback to original hardcoded prompt building
                system_prompt = self._build_interview_system_prompt(job_context, candidate_context)
                first_message = self._build_first_message(job_context, candidate_context)
            
            # Create assistant configuration (name must be ≤40 chars)
            short_name = f"Interview - {job_context.job_title}"[:40]
            assistant_config = VAPIAssistantRequest(
                name=short_name,
                firstMessage=first_message,
                firstMessageMode="assistant-speaks-first",
                
                # Core components
                transcriber=TranscriberConfig(
                    provider="deepgram",
                    language="en",
                    model="nova-2"
                ),
                model=ModelConfig(
                    provider="openai",
                    model="gpt-4",
                    temperature=0.3,  # Lower temperature for consistent interviews
                    maxTokens=800,
                    messages=[
                        ModelMessage(role="system", content=system_prompt)
                    ]
                ),
                voice=VoiceConfig(
                    provider=settings.default_voice_provider,
                    voiceId=settings.default_voice_id
                ),
                
                # Configuration
                maxDurationSeconds=settings.max_call_duration_seconds,
                silenceTimeoutSeconds=settings.silence_timeout_seconds,
                backgroundSound="off",
                backgroundDenoisingEnabled=True,
                
                # Plans
                artifactPlan=ArtifactPlan(
                    recordingEnabled=settings.recording_enabled,
                    videoRecordingEnabled=False,
                    transcriptPlan={"enabled": True}
                ),
                startSpeakingPlan=StartSpeakingPlan(
                    waitSeconds=0.4,
                    smartEndpointingEnabled=True
                ),
                stopSpeakingPlan=StopSpeakingPlan(
                    numWords=3,
                    voiceSeconds=0.5,
                    backoffSeconds=1.0
                ),
                
                # Webhook configuration
                server=AssistantServer(
                    url=webhook_url,
                    timeoutSeconds=20,
                    secret=settings.webhook_secret
                ) if webhook_url else None,
                
                # Metadata for tracking
                metadata={
                    "job_id": job_context.job_id,
                    "job_title": job_context.job_title,
                    "company": job_context.company_name,
                    "candidate_name": candidate_context.candidate_name if candidate_context else "Unknown",
                    "interview_type": "screening"
                }
            )
            
            # Create assistant via VAPI
            assistant = await self.vapi_client.create_assistant(assistant_config)
            
            if assistant:
                logger.info(f"✅ Interview assistant created for job: {job_context.job_title}")
                logger.info(f"📝 Assistant ID: {assistant.id}")
                return assistant
            else:
                logger.error(f"❌ Failed to create assistant for job: {job_context.job_title}")
                return None
                
        except Exception as e:
            logger.error(f"Error creating interview assistant: {e}")
            return None
    
    def _build_interview_system_prompt(
        self,
        job_context: JobContextForAssistant,
        candidate_context: Optional[CandidateContextForAssistant] = None
    ) -> str:
        """Build comprehensive system prompt for interview assistant"""
        
        # Base interview prompt
        prompt = f"""You are a professional AI interviewer conducting a phone screening for {job_context.company_name}.

JOB DETAILS:
- Position: {job_context.job_title}
- Experience Level: {job_context.experience_level or 'Not specified'}
- Key Requirements: {', '.join(job_context.requirements)}

INTERVIEW OBJECTIVES:
1. Assess candidate's technical qualifications and experience
2. Evaluate communication skills and cultural fit
3. Ask the specified interview questions and gather detailed responses
4. Maintain a professional, friendly, and engaging tone

INTERVIEW STRUCTURE:
1. Brief introduction and job overview
2. Ask the prepared interview questions one by one
3. Allow candidate to ask questions about the role
4. Conclude with next steps

INTERVIEW QUESTIONS TO ASK:
"""
        
        # Add job-specific questions
        for i, question in enumerate(job_context.questions, 1):
            question_text = question.get('question', 'No question text')
            prompt += f"\n{i}. {question_text}"
        
        # Add candidate context if available
        if candidate_context:
            prompt += f"""

CANDIDATE CONTEXT:
- Name: {candidate_context.candidate_name}
- Relevant Skills: {', '.join(candidate_context.relevant_skills)}
- Experience: {candidate_context.experience_years} years (if provided)
- Resume Summary: {candidate_context.resume_summary or 'Not provided'}

Use this context to personalize the conversation and ask relevant follow-up questions."""
        
        # Interview guidelines
        prompt += """

INTERVIEW GUIDELINES:
- Keep responses concise and professional
- Ask one question at a time and wait for complete answers
- Take notes on key points for each answer
- Probe for specific examples when appropriate
- If candidate gives brief answers, ask for more details
- Maintain conversation flow and show active listening
- Thank candidate for their time at the end

IMPORTANT: Focus on gathering detailed responses to each question. The transcript will be analyzed to match answers against ideal responses."""
        
        return prompt
    
    def _build_first_message(
        self,
        job_context: JobContextForAssistant,
        candidate_context: Optional[CandidateContextForAssistant] = None
    ) -> str:
        """Build personalized first message for the interview"""
        
        candidate_name = candidate_context.candidate_name if candidate_context else "there"
        
        message = f"""Hello {candidate_name}! Thank you for your interest in the {job_context.job_title} position at {job_context.company_name}. 

I'm an AI interviewer and I'll be conducting your initial phone screening today. This should take about 15-20 minutes, and I'll be asking you some questions about your experience and qualifications for this role.

Are you ready to begin the interview?"""
        
        return message
    
    async def get_assistant_by_job(self, job_id: str) -> Optional[str]:
        """Get existing assistant ID for a job (placeholder for future caching)"""
        # TODO: Implement assistant caching/storage
        # For now, we'll create new assistants each time
        return None
    
    async def delete_assistant(self, assistant_id: str) -> bool:
        """Delete a VAPI assistant"""
        try:
            success = await self.vapi_client.delete_assistant(assistant_id)
            if success:
                logger.info(f"✅ Assistant deleted: {assistant_id}")
            else:
                logger.error(f"❌ Failed to delete assistant: {assistant_id}")
            return success
        except Exception as e:
            logger.error(f"Error deleting assistant {assistant_id}: {e}")
            return False 