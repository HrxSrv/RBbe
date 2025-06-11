#!/usr/bin/env python3
"""
Test script for Gemini service with Opik tracking integration.

This script demonstrates all the Opik tracking features implemented in GeminiService:
- Resume text analysis tracking
- Resume vision analysis tracking
- Q&A readiness assessment tracking
- Batch analysis tracking
- Complete analysis workflow tracking
- Service availability testing with tracking

Usage:
    python test_gemini_opik_integration.py
"""

import asyncio
import os
import json
from typing import Dict, Any
from pathlib import Path

# Set up environment for testing
os.environ["ENVIRONMENT"] = "dev"

# Import our services
from app.services.gemini_service import GeminiService, ResumeAnalysisResult
from app.services.text_extraction import TextExtractionResult
from app.models.job import Job
from app.config.opik_config import OpikConfig

# Sample data for testing
SAMPLE_RESUME_TEXT = """
John Doe
Software Engineer
Email: john.doe@email.com
Phone: +1-555-0123
Location: San Francisco, CA

EXPERIENCE:
Senior Software Engineer at TechCorp (2020-2024)
- Developed scalable web applications using Python, FastAPI, and MongoDB
- Led a team of 5 developers on microservices architecture projects
- Implemented CI/CD pipelines reducing deployment time by 70%
- Technologies: Python, FastAPI, MongoDB, Docker, Kubernetes, AWS

Software Engineer at StartupXYZ (2018-2020) 
- Built REST APIs serving 1M+ daily requests
- Developed machine learning models for recommendation systems
- Technologies: Python, Django, PostgreSQL, Redis, TensorFlow

EDUCATION:
Bachelor of Science in Computer Science
Stanford University (2014-2018)
GPA: 3.8/4.0

SKILLS:
Python, FastAPI, Django, MongoDB, PostgreSQL, Docker, Kubernetes, AWS, 
Machine Learning, TensorFlow, REST APIs, Microservices, CI/CD

ACHIEVEMENTS:
- Increased system performance by 40% through database optimization
- Led successful migration of monolith to microservices architecture
- Mentored 10+ junior developers
"""

SAMPLE_JOB_QUESTIONS = [
    {
        "question": "Describe your experience with Python and FastAPI",
        "ideal_answer": "I have extensive experience with Python and FastAPI, building scalable web applications and APIs",
        "weight": 1.5
    },
    {
        "question": "How do you handle database optimization?",
        "ideal_answer": "I use indexing, query optimization, and caching strategies to improve database performance",
        "weight": 1.0
    },
    {
        "question": "Describe your experience with microservices architecture",
        "ideal_answer": "I have led microservices migrations and understand service decomposition, communication patterns, and deployment strategies",
        "weight": 1.2
    }
]

class GeminiOpikTester:
    """
    Comprehensive tester for Gemini service with Opik tracking.
    """
    
    def __init__(self):
        self.results = {}
        
    async def setup(self):
        """Initialize services and check availability."""
        print("🚀 Setting up Gemini + Opik test environment...")
        
        # Check Opik configuration
        opik_info = OpikConfig.get_project_info()
        print(f"📊 Opik Configuration: {opik_info}")
        
        # Test Gemini service availability
        try:
            availability = await GeminiService.test_service_availability()
            print(f"🤖 Gemini Service: {availability}")
            self.results["service_availability"] = {
                "success": availability.get("available", False),
                "details": availability
            }
            if not availability.get("available", False):
                print(f"⚠️  Gemini service not available: {availability.get('error', 'Unknown error')}")
                print("💡 Note: Tests will continue but some may fail due to missing Gemini API key")
        except Exception as e:
            print(f"❌ Gemini service setup failed: {e}")
            self.results["service_availability"] = {"success": False, "error": str(e)}
            print("💡 Note: Tests will continue but may fail due to Gemini service issues")
        
        return True
    
    async def test_text_analysis_tracking(self):
        """Test resume text analysis with Opik tracking."""
        print("\n📝 Testing Text Analysis with Opik Tracking...")
        
        try:
            # Check if Gemini is available first
            availability = await GeminiService.test_service_availability()
            if not availability.get('available', False):
                print(f"⚠️  Skipping test - Gemini not available: {availability.get('error', 'Unknown error')}")
                self.results["text_analysis"] = {"success": False, "error": "Gemini service not available", "skipped": True}
                return False
            
            # Create a mock job context
            job_context = self.create_mock_job()
            
            # Perform text analysis (this should be tracked by Opik)
            analysis = await GeminiService.analyze_resume_text(
                extracted_text=SAMPLE_RESUME_TEXT,
                job_context=job_context
            )
            
            print(f"✅ Text Analysis completed:")
            print(f"   - Overall Score: {analysis.overall_score}")
            print(f"   - Skills Found: {len(analysis.skills_extracted)}")
            print(f"   - Experience Level: {analysis.experience_level}")
            print(f"   - Processing Method: {analysis.processing_method}")
            
            self.results["text_analysis"] = {
                "success": True,
                "score": analysis.overall_score,
                "skills_count": len(analysis.skills_extracted),
                "method": analysis.processing_method
            }
            
            return True
            
        except Exception as e:
            print(f"❌ Text analysis failed: {e}")
            self.results["text_analysis"] = {"success": False, "error": str(e)}
            return False
    
    async def test_qa_readiness_tracking(self):
        """Test Q&A readiness assessment with Opik tracking."""
        print("\n🎯 Testing Q&A Readiness Assessment with Opik Tracking...")
        
        try:
            # Check if Gemini is available first
            availability = await GeminiService.test_service_availability()
            if not availability.get('available', False):
                print(f"⚠️  Skipping test - Gemini not available: {availability.get('error', 'Unknown error')}")
                self.results["qa_assessment"] = {"success": False, "error": "Gemini service not available", "skipped": True}
                return False
            
            # Create mock resume analysis result
            mock_analysis = ResumeAnalysisResult({
                "overall_score": 85.0,
                "skills_extracted": ["Python", "FastAPI", "MongoDB", "Docker", "AWS"],
                "experience_years": 6,
                "experience_level": "senior",
                "analysis_summary": "Experienced software engineer with strong technical skills"
            })
            
            # Perform Q&A assessment (this should be tracked by Opik)
            qa_assessment = await GeminiService.assess_qa_readiness(
                resume_analysis=mock_analysis,
                job_questions=SAMPLE_JOB_QUESTIONS
            )
            
            print(f"✅ Q&A Assessment completed:")
            print(f"   - Readiness Score: {qa_assessment.get('qa_readiness_score', 'N/A')}")
            print(f"   - Questions Assessed: {len(qa_assessment.get('question_assessments', []))}")
            print(f"   - Recommendations: {len(qa_assessment.get('interview_recommendations', []))}")
            
            self.results["qa_assessment"] = {
                "success": True,
                "readiness_score": qa_assessment.get('qa_readiness_score', 0),
                "questions_count": len(qa_assessment.get('question_assessments', [])),
                "recommendations_count": len(qa_assessment.get('interview_recommendations', []))
            }
            
            return True
            
        except Exception as e:
            print(f"❌ Q&A assessment failed: {e}")
            self.results["qa_assessment"] = {"success": False, "error": str(e)}
            return False
    
    async def test_complete_analysis_tracking(self):
        """Test complete resume analysis workflow with Opik tracking."""
        print("\n🔄 Testing Complete Analysis Workflow with Opik Tracking...")
        
        try:
            # Create mock extraction result
            extraction_result = TextExtractionResult(
                text=SAMPLE_RESUME_TEXT,
                method="direct_text",
                confidence=0.95,
                metadata={"source": "test", "page_count": 1},
                needs_vlm_processing=False
            )
            
            # Create mock job context
            job_context = self.create_mock_job()
            
            # Perform complete analysis (this should be tracked by Opik)
            analysis = await GeminiService.analyze_resume_complete(
                extraction_result=extraction_result,
                file_path="test_resume.pdf",
                job_context=job_context
            )
            
            print(f"✅ Complete Analysis completed:")
            print(f"   - Overall Score: {analysis.overall_score}")
            print(f"   - Job Match Score: {analysis.job_match_score}")
            print(f"   - Q&A Readiness: {analysis.qa_readiness_score}")
            print(f"   - Processing Method: {analysis.processing_method}")
            
            self.results["complete_analysis"] = {
                "success": True,
                "overall_score": analysis.overall_score,
                "job_match_score": analysis.job_match_score,
                "qa_readiness_score": analysis.qa_readiness_score,
                "method": analysis.processing_method
            }
            
            return True
            
        except Exception as e:
            print(f"❌ Complete analysis failed: {e}")
            self.results["complete_analysis"] = {"success": False, "error": str(e)}
            return False
    
    async def test_batch_analysis_tracking(self):
        """Test batch analysis with Opik tracking."""
        print("\n📚 Testing Batch Analysis with Opik Tracking...")
        
        try:
            # Create multiple mock extraction results
            extraction_results = {
                "resume_1": TextExtractionResult(
                    text=SAMPLE_RESUME_TEXT,
                    method="direct_text",
                    confidence=0.9,
                    metadata={"source": "test_1", "page_count": 1},
                    needs_vlm_processing=False
                ),
                "resume_2": TextExtractionResult(
                    text=SAMPLE_RESUME_TEXT.replace("John Doe", "Jane Smith"),
                    method="direct_text",
                    confidence=0.85,
                    metadata={"source": "test_2", "page_count": 1},
                    needs_vlm_processing=False
                )
            }
            
            file_paths = {
                "resume_1": "test_resume_1.pdf",
                "resume_2": "test_resume_2.pdf"
            }
            
            # Create mock job context
            job_context = self.create_mock_job()
            
            # Perform batch analysis (this should be tracked by Opik)
            batch_results = await GeminiService.batch_analyze_resumes(
                extraction_results=extraction_results,
                file_paths=file_paths,
                job_context=job_context
            )
            
            print(f"✅ Batch Analysis completed:")
            print(f"   - Resumes Processed: {len(batch_results)}")
            print(f"   - Success Rate: {len(batch_results)}/{len(extraction_results)}")
            
            for key, analysis in batch_results.items():
                print(f"   - {key}: Score {analysis.overall_score}, Method {analysis.processing_method}")
            
            self.results["batch_analysis"] = {
                "success": True,
                "processed_count": len(batch_results),
                "total_count": len(extraction_results),
                "success_rate": len(batch_results) / len(extraction_results)
            }
            
            return True
            
        except Exception as e:
            print(f"❌ Batch analysis failed: {e}")
            self.results["batch_analysis"] = {"success": False, "error": str(e)}
            return False
    
    def create_mock_job(self) -> Job:
        """Create a mock job for testing purposes."""
        # This is a simplified mock - in reality this would be a proper Job model instance
        class MockJob:
            def __init__(self):
                self.title = "Senior Python Developer"
                self.description = "We are looking for an experienced Python developer..."
                self.requirements = ["Python", "FastAPI", "MongoDB", "Docker", "AWS"]
                self.skills_required = ["Python", "FastAPI", "MongoDB"]
                self.experience_level = "senior"
                self.location = "San Francisco, CA"
                self.job_type = "full_time"
                self.questions = SAMPLE_JOB_QUESTIONS
        
        return MockJob()
    
    async def generate_test_report(self):
        """Generate a comprehensive test report."""
        print("\n" + "="*60)
        print("📊 GEMINI + OPIK INTEGRATION TEST REPORT")
        print("="*60)
        
        total_tests = len(self.results)
        successful_tests = sum(1 for result in self.results.values() if result.get("success", False))
        skipped_tests = sum(1 for result in self.results.values() if result.get("skipped", False))
        failed_tests = total_tests - successful_tests - skipped_tests
        
        print(f"Total Tests Run: {total_tests}")
        print(f"Successful Tests: {successful_tests}")
        print(f"Skipped Tests: {skipped_tests}")
        print(f"Failed Tests: {failed_tests}")
        if total_tests > 0:
            print(f"Success Rate: {(successful_tests/total_tests)*100:.1f}%")
        
        print("\nDetailed Results:")
        for test_name, result in self.results.items():
            if result.get("success", False):
                status = "✅ PASS"
            elif result.get("skipped", False):
                status = "⏭️  SKIP"
            else:
                status = "❌ FAIL"
            print(f"  {status} {test_name}")
            if not result.get("success", False) and "error" in result:
                if result.get("skipped", False):
                    print(f"      Reason: {result['error']}")
                else:
                    print(f"      Error: {result['error']}")
        
        print("\n🔍 Opik Dashboard Check:")
        opik_info = OpikConfig.get_project_info()
        if opik_info["available"]:
            print(f"   ✅ Check your Opik dashboard for tracking data:")
            print(f"   📊 Workspace: {opik_info['workspace']}")
            print(f"   📁 Project: {opik_info['project']}")
            print(f"   🌐 Dashboard: https://www.comet.com/opik/")
        else:
            print("   ❌ Opik not available - tracking data not recorded")
        
        print("\n🏁 Test completed! Check the Opik dashboard to verify tracking data.")

async def main():
    """Run the comprehensive Gemini + Opik integration test."""
    print("🧪 GEMINI + OPIK INTEGRATION TEST SUITE")
    print("=" * 50)
    
    tester = GeminiOpikTester()
    
    # Setup
    setup_success = await tester.setup()
    if not setup_success:
        print("❌ Setup failed. Exiting.")
        return
    
    # Run all tests
    print("\n🏃 Running comprehensive tests...")
    
    await tester.test_text_analysis_tracking()
    await tester.test_qa_readiness_tracking() 
    await tester.test_complete_analysis_tracking()
    await tester.test_batch_analysis_tracking()
    
    # Generate report
    await tester.generate_test_report()

if __name__ == "__main__":
    asyncio.run(main()) 