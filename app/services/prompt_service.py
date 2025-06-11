from typing import Optional, Dict, Any
from loguru import logger

from app.models import Prompt
from app.models.prompt import PromptType, PromptStatus


class PromptService:
    """Service for managing and retrieving AI prompts from database"""
    
    @classmethod
    async def get_prompt_content(
        cls,
        prompt_type: PromptType,
        variables: Dict[str, Any],
        customer_id: Optional[str] = None,
        fallback_content: Optional[str] = None
    ) -> str:
        """
        Get rendered prompt content from database.
        
        Args:
            prompt_type: Type of prompt to retrieve
            variables: Variables to inject into prompt
            customer_id: Customer ID for customer-specific prompts
            fallback_content: Fallback content if no prompt found in DB
            
        Returns:
            Rendered prompt content
        """
        try:
            # Get default prompt from database
            prompt = await Prompt.get_default_prompt(prompt_type, customer_id)
            
            if prompt:
                # Track usage
                await prompt.increment_usage()
                
                # Render with variables
                rendered_content = prompt.render_prompt(variables)
                
                logger.info(f"Retrieved prompt from DB: {prompt.name} (type: {prompt_type.value})")
                return rendered_content
            else:
                # No prompt found in database
                if fallback_content:
                    logger.warning(f"No prompt found in DB for {prompt_type.value}, using fallback")
                    return fallback_content.format(**variables)
                else:
                    logger.error(f"No prompt found in DB for {prompt_type.value} and no fallback provided")
                    raise ValueError(f"No prompt available for type: {prompt_type.value}")
                    
        except Exception as e:
            logger.error(f"Error retrieving prompt {prompt_type.value}: {e}")
            
            # Use fallback if available
            if fallback_content:
                logger.warning(f"Error retrieving prompt, using fallback for {prompt_type.value}")
                try:
                    return fallback_content.format(**variables)
                except Exception as fallback_error:
                    logger.error(f"Fallback content formatting failed: {fallback_error}")
                    raise e
            else:
                raise e
    
    @classmethod
    async def get_vapi_interview_prompt(
        cls,
        job_context: Dict[str, Any],
        candidate_context: Optional[Dict[str, Any]] = None,
        customer_id: Optional[str] = None
    ) -> str:
        """Get VAPI interview system prompt from database"""
        
        variables = {
            "company_name": job_context.get("company_name", "Company"),
            "job_title": job_context.get("job_title", "Position"),
            "experience_level": job_context.get("experience_level", "Not specified"),
            "requirements": ", ".join(job_context.get("requirements", [])),
            "questions": cls._format_interview_questions(job_context.get("questions", [])),
            "candidate_name": candidate_context.get("candidate_name", "there") if candidate_context else "there",
            "candidate_skills": ", ".join(candidate_context.get("relevant_skills", [])) if candidate_context else "Not provided",
            "candidate_experience": f"{candidate_context.get('experience_years', 0)} years" if candidate_context else "Not provided",
            "resume_summary": candidate_context.get("resume_summary", "Not provided") if candidate_context else "Not provided"
        }
        
        fallback_content = cls._get_fallback_vapi_interview_prompt()
        
        return await cls.get_prompt_content(
            PromptType.VAPI_INTERVIEW,
            variables,
            customer_id,
            fallback_content
        )
    
    @classmethod
    async def get_vapi_first_message(
        cls,
        job_context: Dict[str, Any],
        candidate_context: Optional[Dict[str, Any]] = None,
        customer_id: Optional[str] = None
    ) -> str:
        """Get VAPI first message from database"""
        
        variables = {
            "candidate_name": candidate_context.get("candidate_name", "there") if candidate_context else "there",
            "job_title": job_context.get("job_title", "Position"),
            "company_name": job_context.get("company_name", "Company")
        }
        
        fallback_content = cls._get_fallback_vapi_first_message()
        
        return await cls.get_prompt_content(
            PromptType.VAPI_FIRST_MESSAGE,
            variables,
            customer_id,
            fallback_content
        )
    
    @classmethod
    async def get_gemini_resume_text_prompt(
        cls,
        resume_text: str,
        job_context: Optional[Dict[str, Any]] = None,
        customer_id: Optional[str] = None
    ) -> str:
        """Get Gemini resume text analysis prompt from database"""
        
        variables = {
            "resume_text": resume_text,
            "job_context": cls._format_job_context(job_context) if job_context else ""
        }
        
        fallback_content = cls._get_fallback_gemini_text_prompt()
        
        return await cls.get_prompt_content(
            PromptType.GEMINI_RESUME_TEXT,
            variables,
            customer_id,
            fallback_content
        )
    
    @classmethod
    async def get_gemini_resume_vision_prompt(
        cls,
        job_context: Optional[Dict[str, Any]] = None,
        customer_id: Optional[str] = None
    ) -> str:
        """Get Gemini resume vision analysis prompt from database"""
        
        variables = {
            "job_context": cls._format_job_context(job_context) if job_context else ""
        }
        
        fallback_content = cls._get_fallback_gemini_vision_prompt()
        
        return await cls.get_prompt_content(
            PromptType.GEMINI_RESUME_VISION,
            variables,
            customer_id,
            fallback_content
        )
    
    @classmethod
    async def get_gemini_qa_assessment_prompt(
        cls,
        resume_analysis: Dict[str, Any],
        job_questions: list,
        customer_id: Optional[str] = None
    ) -> str:
        """Get Gemini Q&A assessment prompt from database"""
        
        variables = {
            "experience_years": resume_analysis.get("experience_years", 0),
            "experience_level": resume_analysis.get("experience_level", "entry"),
            "skills": ", ".join(resume_analysis.get("skills_extracted", [])[:10]),
            "previous_roles": ", ".join([role.get("title", "") for role in resume_analysis.get("previous_roles", [])[:3]]),
            "achievements": ", ".join(resume_analysis.get("key_achievements", [])[:3]),
            "overall_score": resume_analysis.get("overall_score", 0),
            "questions": cls._format_qa_questions(job_questions)
        }
        
        fallback_content = cls._get_fallback_gemini_qa_prompt()
        
        return await cls.get_prompt_content(
            PromptType.GEMINI_QA_ASSESSMENT,
            variables,
            customer_id,
            fallback_content
        )
    
    @classmethod
    def _format_interview_questions(cls, questions: list) -> str:
        """Format interview questions for prompt injection"""
        if not questions:
            return "No specific questions provided."
        
        formatted = []
        for i, question in enumerate(questions, 1):
            question_text = question.get('question', 'No question text')
            formatted.append(f"{i}. {question_text}")
        
        return "\n".join(formatted)
    
    @classmethod
    def _format_job_context(cls, job_context: Dict[str, Any]) -> str:
        """Format job context for prompt injection"""
        if not job_context:
            return ""
        
        context_parts = [
            f"Job Title: {job_context.get('title', 'Not specified')}",
            f"Description: {job_context.get('description', 'Not specified')}",
            f"Requirements: {', '.join(job_context.get('requirements', []))}",
            f"Experience Level: {job_context.get('experience_level', 'Not specified')}",
            f"Location: {job_context.get('location', 'Not specified')}",
            f"Job Type: {job_context.get('job_type', 'Not specified')}"
        ]
        
        return "\n".join(context_parts)
    
    @classmethod
    def _format_qa_questions(cls, questions: list) -> str:
        """Format Q&A questions for assessment prompt"""
        if not questions:
            return "No questions to assess."
        
        formatted = []
        for i, q in enumerate(questions, 1):
            question_text = q.get('question', '')
            weight = q.get('weight', 1.0)
            formatted.append(f"Q{i}: {question_text} (Weight: {weight})")
        
        return "\n".join(formatted)
    
    @classmethod
    def _format_candidate_profile(cls, resume_analysis: Dict[str, Any]) -> str:
        """Format candidate profile for Q&A assessment prompt"""
        profile_parts = [
            f"Experience: {resume_analysis.get('experience_years', 0)} years ({resume_analysis.get('experience_level', 'entry')} level)",
            f"Skills: {', '.join(resume_analysis.get('skills_extracted', [])[:10])}",
            f"Previous Roles: {', '.join([role.get('title', '') for role in resume_analysis.get('previous_roles', [])[:3]])}",
            f"Key Achievements: {', '.join(resume_analysis.get('key_achievements', [])[:3])}",
            f"Overall Score: {resume_analysis.get('overall_score', 0)}/100"
        ]
        
        return "\n".join(profile_parts)
    
    # Fallback prompts (original hardcoded versions)
    @classmethod
    def _get_fallback_vapi_interview_prompt(cls) -> str:
        return """You are a professional AI interviewer conducting a phone screening for {company_name}.

JOB DETAILS:
- Position: {job_title}
- Experience Level: {experience_level}
- Key Requirements: {requirements}

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
{questions}

CANDIDATE CONTEXT:
- Name: {candidate_name}
- Relevant Skills: {candidate_skills}
- Experience: {candidate_experience}
- Resume Summary: {resume_summary}

Use this context to personalize the conversation and ask relevant follow-up questions.

INTERVIEW GUIDELINES:
- Keep responses concise and professional
- Ask one question at a time and wait for complete answers
- Take notes on key points for each answer
- Probe for specific examples when appropriate
- If candidate gives brief answers, ask for more details
- Maintain conversation flow and show active listening
- Thank candidate for their time at the end

IMPORTANT: Focus on gathering detailed responses to each question. The transcript will be analyzed to match answers against ideal responses."""
    
    @classmethod
    def _get_fallback_vapi_first_message(cls) -> str:
        return """Hello {candidate_name}! Thank you for your interest in the {job_title} position at {company_name}. 

I'm an AI interviewer and I'll be conducting your initial phone screening today. This should take about 15-20 minutes, and I'll be asking you some questions about your experience and qualifications for this role.

Are you ready to begin the interview?"""
    
    @classmethod
    def _get_fallback_gemini_text_prompt(cls) -> str:
        return """You are an expert HR analyst specializing in resume evaluation. Analyze this resume thoroughly and provide a comprehensive assessment.

Resume Text:
{resume_text}

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

{job_context}

Return ONLY valid JSON without additional text or markdown formatting."""
    
    @classmethod
    def _get_fallback_gemini_vision_prompt(cls) -> str:
        return """You are an expert HR analyst. Analyze this resume document (which may be an image, scanned PDF, or complex layout) and extract all relevant information.

Extract and analyze:
1. Personal information (name, contact details)
2. Professional experience (roles, companies, durations, achievements)
3. Education (degrees, universities, years)
4. Skills and technologies
5. Projects and achievements
6. Overall qualifications assessment

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

{job_context}

Return ONLY valid JSON without additional text or markdown formatting."""
    
    @classmethod
    def _get_fallback_gemini_qa_prompt(cls) -> str:
        return """You are an interview preparation specialist. Based on this candidate's resume analysis, assess their readiness to answer specific job interview questions.

Candidate Profile Summary:
- Experience: {experience_years} years ({experience_level} level)
- Skills: {skills}
- Previous Roles: {previous_roles}
- Key Achievements: {achievements}
- Overall Score: {overall_score}/100

Interview Questions to Assess:
{questions}

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

Return ONLY valid JSON without additional text or markdown formatting.""" 