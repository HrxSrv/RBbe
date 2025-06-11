from typing import Dict, Any, List, Optional, Union
from datetime import datetime
import json
import asyncio
from pathlib import Path
from loguru import logger
from fastapi import HTTPException, status

# Opik integration for tracking
try:
    from opik import track
    from opik import opik_context
    from app.config.opik_config import OpikConfig
    OPIK_AVAILABLE = True
    logger.info("Opik tracking available for Gemini service")
except ImportError:
    OPIK_AVAILABLE = False
    logger.warning("Opik not available. Install with: pip install opik")

# Gemini integration
try:
    import google.generativeai as genai
    from google.generativeai.types import HarmCategory, HarmBlockThreshold
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logger.warning("google-generativeai not available. Install with: pip install google-generativeai")

# Import our services and models
from app.services.text_extraction import TextExtractionResult
from app.models.job import Job
from app.config.settings import settings

class ResumeAnalysisResult:
    """
    Structured result from Gemini resume analysis.
    """
    def __init__(self, data: Dict[str, Any]):
        self.overall_score = data.get("overall_score", 0.0)
        self.skills_extracted = data.get("skills_extracted", [])
        self.experience_years = data.get("experience_years", 0)
        self.experience_level = data.get("experience_level", "entry")
        self.education = data.get("education", {})
        self.previous_roles = data.get("previous_roles", [])
        self.key_achievements = data.get("key_achievements", [])
        self.analysis_summary = data.get("analysis_summary", "")
        self.strengths = data.get("strengths", [])
        self.areas_for_improvement = data.get("areas_for_improvement", [])
        self.confidence_score = data.get("confidence_score", 0.0)
        self.contact_info = data.get("contact_info", {})
        
        # Enhanced Q&A readiness (Day 2 integration)
        self.qa_readiness_score = data.get("qa_readiness_score", 0.0)
        self.question_predictions = data.get("question_predictions", [])
        self.interview_recommendations = data.get("interview_recommendations", [])
        
        # Job matching (if job context provided)
        self.job_match_score = data.get("job_match_score", 0.0)
        self.job_specific_strengths = data.get("job_specific_strengths", [])
        self.job_specific_gaps = data.get("job_specific_gaps", [])
        
        # Processing metadata
        self.processing_method = data.get("processing_method", "text_analysis")
        self.analysis_timestamp = datetime.utcnow()
        self.parsing_error = data.get("parsing_error", None)
        
    def to_dict(self) -> Dict[str, Any]:
        return {
            "overall_score": self.overall_score,
            "skills_extracted": self.skills_extracted,
            "experience_years": self.experience_years,
            "experience_level": self.experience_level,
            "education": self.education,
            "previous_roles": self.previous_roles,
            "key_achievements": self.key_achievements,
            "analysis_summary": self.analysis_summary,
            "strengths": self.strengths,
            "areas_for_improvement": self.areas_for_improvement,
            "confidence_score": self.confidence_score,
            "contact_info": self.contact_info,
            "qa_readiness_score": self.qa_readiness_score,
            "question_predictions": self.question_predictions,
            "interview_recommendations": self.interview_recommendations,
            "job_match_score": self.job_match_score,
            "job_specific_strengths": self.job_specific_strengths,
            "job_specific_gaps": self.job_specific_gaps,
            "processing_method": self.processing_method,
            "analysis_timestamp": self.analysis_timestamp.isoformat(),
            "parsing_error": self.parsing_error
        }

class GeminiService:
    """
    Service for integrating with Google Gemini for resume analysis and Q&A assessment.
    Handles both text-only and vision-based processing with intelligent routing.
    """
    
    # Gemini model configurations
    TEXT_MODEL = "gemini-1.5-flash"  # Cost-effective for text analysis
    VISION_MODEL = "gemini-1.5-pro"  # More capable for vision tasks
    
    # Safety settings (if available)
    SAFETY_SETTINGS = None
    GENERATION_CONFIG = {
        "temperature": 0.1,  # Low temperature for consistent results
        "top_p": 0.8,
        "top_k": 40,
        "max_output_tokens": 4096
    }
    
    @classmethod
    def _init_safety_settings(cls):
        """Initialize safety settings if Gemini is available."""
        if GEMINI_AVAILABLE:
            try:
                cls.SAFETY_SETTINGS = {
                    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                }
            except Exception as e:
                logger.warning(f"Could not initialize safety settings: {e}")
                cls.SAFETY_SETTINGS = None
    
    @classmethod
    @classmethod
    async def initialize(cls, api_key: Optional[str] = None):
        """Initialize Gemini with API key."""
        if not GEMINI_AVAILABLE:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Gemini integration not available. Install with: pip install google-generativeai"
            )
        
        try:
            cls._init_safety_settings()
            
            # Hardcode the API key directly
            genai.configure(api_key="AIzaSyAoTrxXVJbeTdDejsMRT1rF0Y7ORVSWnGA")
            
            logger.info("Gemini service initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Gemini: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to initialize Gemini service: {str(e)}"
            )
    
    @classmethod
    @track(name="gemini_resume_text_analysis", tags=["gemini", "resume", "text_analysis"])
    async def analyze_resume_text(
        cls, 
        extracted_text: str, 
        job_context: Optional[Job] = None
    ) -> ResumeAnalysisResult:
        """
        Analyze resume using extracted text with Gemini text model.
        """
        if not GEMINI_AVAILABLE:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Gemini not available for analysis"
            )
        
        try:
            # Add metadata to Opik tracking
            if OPIK_AVAILABLE:
                try:
                    opik_context.update_current_span(
                        metadata={
                            "analysis_type": "text_analysis",
                            "text_length": len(extracted_text),
                            "has_job_context": job_context is not None,
                            "job_title": job_context.title if job_context else None,
                            "model_used": cls.TEXT_MODEL
                        }
                    )
                except Exception as e:
                    logger.warning(f"Failed to update Opik span metadata: {e}")
            
            # Initialize model
            model = genai.GenerativeModel(
                model_name=cls.TEXT_MODEL,
                safety_settings=cls.SAFETY_SETTINGS,
                generation_config=cls.GENERATION_CONFIG
            )
            
            # Get prompt from database
            from app.services.prompt_service import PromptService
            
            # Convert job context to dict format
            job_context_dict = None
            if job_context:
                job_context_dict = {
                    "title": job_context.title,
                    "description": job_context.description,
                    "requirements": job_context.requirements,
                    "experience_level": getattr(job_context, 'experience_level', None),
                    "location": job_context.location,
                    "job_type": job_context.job_type
                }
            
            # Get customer_id if available (assuming it's passed through job_context or can be extracted)
            customer_id = getattr(job_context, 'customer_id', None) if job_context else None
            
            prompt = await PromptService.get_gemini_resume_text_prompt(
                extracted_text, 
                job_context_dict, 
                customer_id
            )
            
            # Generate analysis
            response = await cls._generate_content_async(model, prompt)
            
            # Parse response
            analysis_data = cls._parse_analysis_response(response.text)
            analysis_data["processing_method"] = "gemini_text_analysis"
            
            return ResumeAnalysisResult(analysis_data)
            
        except Exception as e:
            logger.error(f"Gemini text analysis failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Resume analysis failed: {str(e)}"
            )
    
    @classmethod
    @track(name="gemini_resume_vision_analysis", tags=["gemini", "resume", "vision_analysis"])
    async def analyze_resume_vision(
        cls, 
        file_path: str, 
        job_context: Optional[Job] = None
    ) -> ResumeAnalysisResult:
        """
        Analyze resume using Gemini Vision for image-based or complex documents.
        """
        if not GEMINI_AVAILABLE:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Gemini not available for vision analysis"
            )
        
        try:
            # Add metadata to Opik tracking
            if OPIK_AVAILABLE:
                try:
                    opik_context.update_current_span(
                        metadata={
                            "analysis_type": "vision_analysis",
                            "file_path": file_path,
                            "has_job_context": job_context is not None,
                            "job_title": job_context.title if job_context else None,
                            "model_used": cls.VISION_MODEL
                        }
                    )
                except Exception as e:
                    logger.warning(f"Failed to update Opik span metadata: {e}")
            
            # Initialize vision model
            model = genai.GenerativeModel(
                model_name=cls.VISION_MODEL,
                safety_settings=cls.SAFETY_SETTINGS,
                generation_config=cls.GENERATION_CONFIG
            )
            
            # Upload file for vision analysis
            file = genai.upload_file(path=file_path)
            
            # Get prompt from database
            from app.services.prompt_service import PromptService
            
            # Convert job context to dict format
            job_context_dict = None
            if job_context:
                job_context_dict = {
                    "title": job_context.title,
                    "description": job_context.description,
                    "requirements": job_context.requirements,
                    "experience_level": getattr(job_context, 'experience_level', None),
                    "location": job_context.location,
                    "job_type": job_context.job_type
                }
            
            # Get customer_id if available
            customer_id = getattr(job_context, 'customer_id', None) if job_context else None
            
            prompt = await PromptService.get_gemini_resume_vision_prompt(
                job_context_dict, 
                customer_id
            )
            
            # Generate analysis with file
            response = await cls._generate_content_async(model, [prompt, file])
            
            # Parse response
            analysis_data = cls._parse_analysis_response(response.text)
            analysis_data["processing_method"] = "gemini_vision_analysis"
            
            return ResumeAnalysisResult(analysis_data)
            
        except Exception as e:
            logger.error(f"Gemini vision analysis failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Vision analysis failed: {str(e)}"
            )
    
    @classmethod
    @track(name="gemini_qa_readiness_assessment", tags=["gemini", "qa", "assessment"])
    async def assess_qa_readiness(
        cls,
        resume_analysis: ResumeAnalysisResult,
        job_questions: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Assess candidate's readiness to answer specific job questions based on resume.
        """
        if not GEMINI_AVAILABLE:
            return {
                "qa_readiness_score": 0.0,
                "question_assessments": [],
                "interview_recommendations": ["Gemini not available for Q&A assessment"],
                "overall_assessment": "Q&A assessment unavailable",
                "error": "Gemini not available"
            }
        
        try:
            # Add metadata to Opik tracking
            if OPIK_AVAILABLE:
                try:
                    opik_context.update_current_span(
                        metadata={
                            "assessment_type": "qa_readiness",
                            "num_questions": len(job_questions),
                            "candidate_score": resume_analysis.overall_score,
                            "candidate_experience": resume_analysis.experience_level,
                            "model_used": cls.TEXT_MODEL
                        }
                    )
                except Exception as e:
                    logger.warning(f"Failed to update Opik span metadata: {e}")
            
            model = genai.GenerativeModel(
                model_name=cls.TEXT_MODEL,
                safety_settings=cls.SAFETY_SETTINGS,
                generation_config=cls.GENERATION_CONFIG
            )
            
            # Get prompt from database
            from app.services.prompt_service import PromptService
            
            # Convert resume analysis to dict if it's not already
            resume_analysis_dict = resume_analysis.to_dict() if hasattr(resume_analysis, 'to_dict') else resume_analysis
            
            # Get customer_id if available (this might need to be passed as a parameter in the future)
            customer_id = None  # TODO: Pass customer_id through the call chain
            
            prompt = await PromptService.get_gemini_qa_assessment_prompt(
                resume_analysis_dict,
                job_questions,
                customer_id
            )
            
            response = await cls._generate_content_async(model, prompt)
            
            return cls._parse_qa_assessment_response(response.text)
            
        except Exception as e:
            logger.error(f"Q&A readiness assessment failed: {e}")
            return {
                "qa_readiness_score": 0.0,
                "question_assessments": [],
                "interview_recommendations": ["Manual assessment required due to error"],
                "overall_assessment": "Assessment failed",
                "error": str(e)
            }
    
    @classmethod
    @track(name="gemini_complete_resume_analysis", tags=["gemini", "resume", "complete_analysis"])
    async def analyze_resume_complete(
        cls,
        extraction_result: TextExtractionResult,
        file_path: str,
        job_context: Optional[Job] = None
    ) -> ResumeAnalysisResult:
        """
        Complete resume analysis workflow with intelligent routing.
        """
        try:
            # Add metadata to Opik tracking
            if OPIK_AVAILABLE:
                try:
                    opik_context.update_current_span(
                        metadata={
                            "workflow_type": "complete_analysis",
                            "extraction_confidence": extraction_result.confidence,
                            "needs_vlm": extraction_result.needs_vlm_processing,
                            "has_job_context": job_context is not None,
                            "job_title": job_context.title if job_context else None,
                            "file_path": file_path
                        }
                    )
                except Exception as e:
                    logger.warning(f"Failed to update Opik span metadata: {e}")
            
            # Decide between text and vision analysis based on extraction quality
            if extraction_result.needs_vlm_processing or extraction_result.confidence < 0.7:
                logger.info(f"Using Gemini Vision for complex document analysis (confidence: {extraction_result.confidence})")
                analysis = await cls.analyze_resume_vision(file_path, job_context)
            else:
                logger.info(f"Using Gemini text analysis for extracted content (confidence: {extraction_result.confidence})")
                analysis = await cls.analyze_resume_text(extraction_result.text, job_context)
            
            # Enhance with Q&A assessment if job context and questions provided
            if job_context and hasattr(job_context, 'questions') and job_context.questions:
                logger.info(f"Assessing Q&A readiness for {len(job_context.questions)} questions")
                qa_assessment = await cls.assess_qa_readiness(analysis, job_context.questions)
                
                # Update analysis with Q&A data
                analysis.qa_readiness_score = qa_assessment.get("qa_readiness_score", 0.0)
                analysis.question_predictions = qa_assessment.get("question_assessments", [])
                analysis.interview_recommendations = qa_assessment.get("interview_recommendations", [])
            
            logger.info(f"Complete resume analysis finished - Score: {analysis.overall_score}, Method: {analysis.processing_method}")
            return analysis
            
        except Exception as e:
            logger.error(f"Complete resume analysis failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Complete resume analysis failed: {str(e)}"
            )
    
    @classmethod
    def _build_text_analysis_prompt(cls, text: str, job_context: Optional[Job] = None) -> str:
        """
        Build comprehensive prompt for text-based resume analysis.
        """
        base_prompt = f"""
You are an expert HR analyst specializing in resume evaluation. Analyze this resume thoroughly and provide a comprehensive assessment.

Resume Text:
{text}

Provide your analysis in the following JSON format:
{{
    "overall_score": (0-100 score based on resume quality and completeness),
    "skills_extracted": ["skill1", "skill2", "skill3", ...],
    "experience_years": (total years of professional experience),
    "experience_level": "entry|junior|mid|senior|lead|executive",
    "education": {{
        "degree": "highest degree obtained",
        "university": "university name",
        "graduation_year": year_if_available,
        "gpa": gpa_if_available
    }},
    "previous_roles": [
        {{
            "title": "job title",
            "company": "company name",
            "duration_years": estimated_years_in_role,
            "technologies": ["tech1", "tech2"]
        }}
    ],
    "key_achievements": ["achievement1", "achievement2", "achievement3"],
    "analysis_summary": "comprehensive 2-3 sentence summary of candidate profile",
    "strengths": ["strength1", "strength2", "strength3"],
    "areas_for_improvement": ["area1", "area2"],
    "confidence_score": (0.0-1.0 confidence in this analysis),
    "contact_info": {{
        "email": "email_if_found",
        "phone": "phone_if_found",
        "location": "location_if_found",
        "linkedin": "linkedin_if_found"
    }}
}}
        """
        
        if job_context:
            job_prompt = f"""

Job Context for Matching Analysis:
Title: {job_context.title}
Description: {job_context.description}
Requirements: {job_context.requirements}
Skills Required: {getattr(job_context, 'skills_required', [])}
Experience Level: {getattr(job_context, 'experience_level', 'not_specified')}
Location: {job_context.location}
Job Type: {job_context.job_type}

Based on this job context, enhance your analysis by adding these fields:
"job_match_score": (0-100 how well candidate matches this specific job),
"job_specific_strengths": ["strength1", "strength2"],
"job_specific_gaps": ["gap1", "gap2"]
            """
            base_prompt += job_prompt
        
        base_prompt += "\n\nReturn ONLY valid JSON without additional text or markdown formatting."
        
        return base_prompt
    
    @classmethod
    def _build_vision_analysis_prompt(cls, job_context: Optional[Job] = None) -> str:
        """
        Build prompt for vision-based resume analysis.
        """
        base_prompt = """
You are an expert HR analyst. Analyze this resume document (which may be an image, scanned PDF, or complex layout) and extract all relevant information.

Extract and analyze:
1. Personal information (name, contact details)
2. Professional experience (roles, companies, durations, achievements)
3. Education (degrees, universities, years)
4. Skills and technologies
5. Projects and achievements
6. Overall qualifications assessment

Provide your analysis in the following JSON format:
{
    "overall_score": (0-100 score based on resume quality and completeness),
    "skills_extracted": ["skill1", "skill2", "skill3", ...],
    "experience_years": (total years of professional experience),
    "experience_level": "entry|junior|mid|senior|lead|executive",
    "education": {
        "degree": "highest degree obtained",
        "university": "university name", 
        "graduation_year": year_if_available,
        "gpa": gpa_if_available
    },
    "previous_roles": [
        {
            "title": "job title",
            "company": "company name",
            "duration_years": estimated_years_in_role,
            "technologies": ["tech1", "tech2"]
        }
    ],
    "key_achievements": ["achievement1", "achievement2", "achievement3"],
    "analysis_summary": "comprehensive 2-3 sentence summary of candidate profile",
    "strengths": ["strength1", "strength2", "strength3"],
    "areas_for_improvement": ["area1", "area2"],
    "confidence_score": (0.0-1.0 confidence in this analysis),
    "contact_info": {
        "email": "email_if_found",
        "phone": "phone_if_found",
        "location": "location_if_found",
        "linkedin": "linkedin_if_found"
    }
}
        """
        
        if job_context:
            job_prompt = f"""

Job Context for Matching Analysis:
Title: {job_context.title}
Description: {job_context.description}
Requirements: {job_context.requirements}
Skills Required: {getattr(job_context, 'skills_required', [])}
Experience Level: {getattr(job_context, 'experience_level', 'not_specified')}

Based on this job context, enhance your analysis by adding these fields:
"job_match_score": (0-100 how well candidate matches this specific job),
"job_specific_strengths": ["strength1", "strength2"],
"job_specific_gaps": ["gap1", "gap2"]
            """
            base_prompt += job_prompt
        
        base_prompt += "\n\nReturn ONLY valid JSON without additional text or markdown formatting."
        
        return base_prompt
    
    @classmethod
    def _build_qa_assessment_prompt(
        cls, 
        resume_analysis: ResumeAnalysisResult, 
        job_questions: List[Dict[str, Any]]
    ) -> str:
        """
        Build prompt for Q&A readiness assessment.
        """
        questions_text = "\n".join([
            f"Q{i+1}: {q.get('question', '')} (Weight: {q.get('weight', 1.0)})"
            for i, q in enumerate(job_questions)
        ])
        
        prompt = f"""
You are an interview preparation specialist. Based on this candidate's resume analysis, assess their readiness to answer specific job interview questions.

Candidate Profile Summary:
- Experience: {resume_analysis.experience_years} years ({resume_analysis.experience_level} level)
- Skills: {', '.join(resume_analysis.skills_extracted[:10])}
- Previous Roles: {', '.join([role.get('title', '') for role in resume_analysis.previous_roles[:3]])}
- Key Achievements: {', '.join(resume_analysis.key_achievements[:3])}
- Overall Score: {resume_analysis.overall_score}/100

Interview Questions to Assess:
{questions_text}

Provide assessment in JSON format:
{{
    "qa_readiness_score": (0-100 overall readiness score),
    "question_assessments": [
        {{
            "question": "question text",
            "readiness_score": (0-100 score for this question),
            "predicted_answer_quality": "poor|fair|good|excellent",
            "reasoning": "why this score based on resume background",
            "preparation_suggestions": ["suggestion1", "suggestion2"]
        }}
    ],
    "interview_recommendations": ["recommendation1", "recommendation2"],
    "overall_assessment": "summary of interview readiness"
}}

Return ONLY valid JSON without additional text or markdown formatting.
        """
        
        return prompt
    
    @classmethod
    @track(type="llm", name="gemini_api_call", tags=["gemini", "api", "generation"])
    async def _generate_content_async(cls, model, prompt: Union[str, List]) -> Any:
        """
        Generate content asynchronously with retry logic and Opik tracking.
        """
        max_retries = 3
        retry_delay = 1
        
        # Extract model name for tracking
        model_name = getattr(model, '_model_name', 'unknown')
        
        # Add input information to tracking if Opik is available
        if OPIK_AVAILABLE:
            try:
                opik_context.update_current_span(
                    input={
                        "prompt": prompt if isinstance(prompt, str) else "multimodal_prompt"
                    },
                    metadata={
                        "model_name": model_name,
                        "max_retries": max_retries,
                        "prompt_type": "text" if isinstance(prompt, str) else "multimodal"
                    }
                )
            except Exception as e:
                logger.warning(f"Failed to update Opik span metadata: {e}")
        
        for attempt in range(max_retries):
            try:
                # Run the synchronous generate_content in a thread pool
                response = await asyncio.get_event_loop().run_in_executor(
                    None, model.generate_content, prompt
                )
                
                # Update Opik tracking with response information
                if OPIK_AVAILABLE:
                    try:
                        # Extract usage metadata if available
                        usage_metadata = None
                        if hasattr(response, 'usage_metadata') and response.usage_metadata:
                            usage = response.usage_metadata
                            usage_metadata = {
                                "prompt_tokens": getattr(usage, 'prompt_token_count', 0),
                                "completion_tokens": getattr(usage, 'candidates_token_count', 0),
                                "total_tokens": getattr(usage, 'total_token_count', 0)
                            }
                        
                        opik_context.update_current_span(
                            output={
                                "response_text": response.text if hasattr(response, 'text') else "response_generated"
                            },
                            provider="google_ai",
                            model=model_name,
                            usage=usage_metadata,
                            metadata={
                                "attempt": attempt + 1,
                                "success": True,
                                "response_candidates": len(response.candidates) if hasattr(response, 'candidates') else 1
                            }
                        )
                    except Exception as e:
                        logger.warning(f"Failed to update Opik span with response data: {e}")
                
                return response
                
            except Exception as e:
                if attempt < max_retries - 1:
                    logger.warning(f"Gemini API attempt {attempt + 1} failed: {e}. Retrying in {retry_delay}s...")
                    
                    # Update Opik tracking with retry information
                    if OPIK_AVAILABLE:
                        try:
                            opik_context.update_current_span(
                                metadata={
                                    "attempt": attempt + 1,
                                    "retry_error": str(e),
                                    "retrying": True
                                }
                            )
                        except Exception as opik_e:
                            logger.warning(f"Failed to update Opik span with retry info: {opik_e}")
                    
                    await asyncio.sleep(retry_delay)
                    retry_delay *= 2  # Exponential backoff
                else:
                    # Update Opik tracking with final failure
                    if OPIK_AVAILABLE:
                        try:
                            opik_context.update_current_span(
                                metadata={
                                    "attempt": attempt + 1,
                                    "final_error": str(e),
                                    "success": False
                                }
                            )
                        except Exception as opik_e:
                            logger.warning(f"Failed to update Opik span with error info: {opik_e}")
                    raise e
    
    @classmethod
    def _parse_analysis_response(cls, response_text: str) -> Dict[str, Any]:
        """
        Parse Gemini response and extract JSON analysis.
        """
        try:
            # Clean response text
            cleaned_text = response_text.strip()
            
            # Remove markdown code blocks if present
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]
            elif cleaned_text.startswith("```"):
                cleaned_text = cleaned_text[3:]
            
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]
            
            # Parse JSON
            analysis_data = json.loads(cleaned_text.strip())
            
            # Validate and set default values for required fields
            required_fields = {
                "overall_score": 50.0,
                "skills_extracted": [],
                "experience_years": 0,
                "experience_level": "entry",
                "education": {},
                "previous_roles": [],
                "key_achievements": [],
                "analysis_summary": "Resume analysis completed",
                "strengths": [],
                "areas_for_improvement": [],
                "confidence_score": 0.5,
                "contact_info": {}
            }
            
            for field, default_value in required_fields.items():
                if field not in analysis_data:
                    analysis_data[field] = default_value
            
            return analysis_data
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini response as JSON: {e}")
            logger.error(f"Response text: {response_text[:500]}...")
            
            # Return default analysis structure with error information
            return {
                "overall_score": 25.0,
                "skills_extracted": [],
                "experience_years": 0,
                "experience_level": "entry",
                "education": {},
                "previous_roles": [],
                "key_achievements": [],
                "analysis_summary": "Analysis parsing failed - manual review required",
                "strengths": [],
                "areas_for_improvement": ["Resume analysis needs manual review"],
                "confidence_score": 0.1,
                "contact_info": {},
                "parsing_error": f"JSON parsing failed: {str(e)}"
            }
    
    @classmethod
    def _parse_qa_assessment_response(cls, response_text: str) -> Dict[str, Any]:
        """
        Parse Q&A assessment response.
        """
        try:
            # Clean and parse similar to analysis response
            cleaned_text = response_text.strip()
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]
            elif cleaned_text.startswith("```"):
                cleaned_text = cleaned_text[3:]
            
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]
            
            assessment_data = json.loads(cleaned_text.strip())
            
            # Validate required fields
            if "qa_readiness_score" not in assessment_data:
                assessment_data["qa_readiness_score"] = 0.0
            if "question_assessments" not in assessment_data:
                assessment_data["question_assessments"] = []
            if "interview_recommendations" not in assessment_data:
                assessment_data["interview_recommendations"] = []
            if "overall_assessment" not in assessment_data:
                assessment_data["overall_assessment"] = "Assessment completed"
            
            return assessment_data
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Q&A assessment response: {e}")
            return {
                "qa_readiness_score": 0.0,
                "question_assessments": [],
                "interview_recommendations": ["Manual assessment required due to parsing error"],
                "overall_assessment": "Assessment parsing failed",
                "parsing_error": str(e)
            }
    
    @classmethod
    @track(name="gemini_batch_resume_analysis", tags=["gemini", "batch", "resume", "analysis"])
    async def batch_analyze_resumes(
        cls,
        extraction_results: Dict[str, TextExtractionResult],
        file_paths: Dict[str, str],
        job_context: Optional[Job] = None
    ) -> Dict[str, ResumeAnalysisResult]:
        """
        Analyze multiple resumes in batch with concurrency control.
        """
        # Add metadata to Opik tracking
        if OPIK_AVAILABLE:
            try:
                opik_context.update_current_span(
                    metadata={
                        "batch_type": "resume_analysis",
                        "batch_size": len(extraction_results),
                        "has_job_context": job_context is not None,
                        "job_title": job_context.title if job_context else None,
                        "max_concurrent": 3
                    }
                )
            except Exception as e:
                logger.warning(f"Failed to update Opik span metadata: {e}")
        
        max_concurrent = 3  # Limit concurrent requests to Gemini API
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def analyze_single(file_key: str) -> tuple[str, ResumeAnalysisResult]:
            async with semaphore:
                try:
                    extraction_result = extraction_results[file_key]
                    file_path = file_paths[file_key]
                    
                    logger.info(f"Starting batch analysis for {file_key}")
                    analysis = await cls.analyze_resume_complete(
                        extraction_result, file_path, job_context
                    )
                    logger.info(f"Completed batch analysis for {file_key} - Score: {analysis.overall_score}")
                    return file_key, analysis
                    
                except Exception as e:
                    logger.error(f"Batch analysis failed for {file_key}: {e}")
                    # Return error analysis
                    error_data = {
                        "overall_score": 0.0,
                        "skills_extracted": [],
                        "experience_years": 0,
                        "experience_level": "entry",
                        "education": {},
                        "previous_roles": [],
                        "key_achievements": [],
                        "analysis_summary": f"Analysis failed: {str(e)}",
                        "strengths": [],
                        "areas_for_improvement": ["Manual review required"],
                        "confidence_score": 0.0,
                        "contact_info": {},
                        "processing_method": "batch_analysis_failed",
                        "error": str(e)
                    }
                    return file_key, ResumeAnalysisResult(error_data)
        
        # Execute batch analysis
        tasks = [analyze_single(file_key) for file_key in extraction_results.keys()]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        analysis_results = {}
        for result in results:
            if isinstance(result, Exception):
                logger.error(f"Batch analysis task failed: {result}")
                continue
            
            file_key, analysis = result
            analysis_results[file_key] = analysis
        
        logger.info(f"Batch analysis completed: {len(analysis_results)}/{len(extraction_results)} successful")
        
        # Update Opik tracking with batch outcome
        if OPIK_AVAILABLE:
            try:
                success_rate = len(analysis_results) / len(extraction_results) if extraction_results else 0
                opik_context.update_current_span(
                    metadata={
                        "batch_outcome": "completed",
                        "successful_analyses": len(analysis_results),
                        "failed_analyses": len(extraction_results) - len(analysis_results),
                        "success_rate": success_rate
                    }
                )
            except Exception as e:
                logger.warning(f"Failed to update Opik span with batch outcome: {e}")
        
        return analysis_results
    
    @classmethod
    @track(name="gemini_service_test", tags=["gemini", "test", "availability"])
    async def test_service_availability(cls) -> Dict[str, Any]:
        """
        Test if Gemini service is available and working.
        """
        try:
            if not GEMINI_AVAILABLE:
                return {
                    "available": False,
                    "error": "google-generativeai not installed",
                    "install_command": "pip install google-generativeai"
                }
            
            # Try to initialize (this checks API key)
            await cls.initialize()
            
            # Test with a simple prompt
            model = genai.GenerativeModel(
                model_name=cls.TEXT_MODEL,
                safety_settings=cls.SAFETY_SETTINGS,
                generation_config=cls.GENERATION_CONFIG
            )
            
            test_prompt = "Return this exact JSON: {'test': 'success', 'status': 'working'}"
            response = await cls._generate_content_async(model, test_prompt)
            
            return {
                "available": True,
                "model": cls.TEXT_MODEL,
                "test_response": response.text[:100] + "..." if len(response.text) > 100 else response.text,
                "status": "Service working correctly"
            }
            
        except Exception as e:
            return {
                "available": False,
                "error": str(e),
                "status": "Service initialization failed"
            } 