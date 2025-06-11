# Opik Tracking Integration for RecruitBot

This document explains the comprehensive Opik tracking integration implemented in RecruitBot's Gemini service for monitoring and analyzing LLM performance.

## 🎯 Overview

Opik is integrated into RecruitBot to provide:

- **LLM Call Tracking**: Monitor all Gemini API calls with detailed metadata
- **Cost Analysis**: Track token usage and API costs
- **Performance Monitoring**: Analyze response times and success rates
- **Error Tracking**: Monitor failures and retry patterns
- **Business Intelligence**: Track resume analysis performance and quality

## 🔧 Setup Instructions

### 1. Install Dependencies

Opik is already included in the requirements.txt:

```bash
pip install opik
```

### 2. Configure Environment Variables

You can use the automated setup script:

```bash
python setup_opik_env.py
```

Or manually add to your `.env` file:

```bash
# Opik Configuration
OPIK_API_KEY=your_opik_api_key_here
OPIK_WORKSPACE=your_workspace_name
OPIK_PROJECT_NAME=resume-analysis

# Gemini Configuration (required for actual LLM calls)
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Get Opik Credentials

1. Visit [Opik Dashboard](https://www.comet.com/opik/)
2. Create an account or log in
3. Create a new project called "resume-analysis"
4. Get your API key from the settings
5. Note your workspace name

## 📊 Tracked Operations

### Resume Analysis Operations

All major Gemini operations are tracked with comprehensive metadata:

#### 1. Text Analysis (`gemini_resume_text_analysis`)
```python
await GeminiService.analyze_resume_text(extracted_text, job_context)
```

**Tracked Metadata:**
- `analysis_type`: "text_analysis"
- `text_length`: Character count of resume text
- `has_job_context`: Whether job context was provided
- `job_title`: Job title if available
- `model_used`: Gemini model name (gemini-1.5-flash)

#### 2. Vision Analysis (`gemini_resume_vision_analysis`)
```python
await GeminiService.analyze_resume_vision(file_path, job_context)
```

**Tracked Metadata:**
- `analysis_type`: "vision_analysis"
- `file_path`: Path to analyzed file
- `has_job_context`: Whether job context was provided
- `job_title`: Job title if available
- `model_used`: Gemini model name (gemini-1.5-pro)

#### 3. Q&A Readiness Assessment (`gemini_qa_readiness_assessment`)
```python
await GeminiService.assess_qa_readiness(resume_analysis, job_questions)
```

**Tracked Metadata:**
- `assessment_type`: "qa_readiness"
- `num_questions`: Number of questions being assessed
- `candidate_score`: Overall candidate score from resume analysis
- `candidate_experience`: Experience level (entry/junior/mid/senior)
- `model_used`: Gemini model name

#### 4. Complete Analysis Workflow (`gemini_complete_resume_analysis`)
```python
await GeminiService.analyze_resume_complete(extraction_result, file_path, job_context)
```

**Tracked Metadata:**
- `workflow_type`: "complete_analysis"
- `extraction_confidence`: Text extraction confidence score
- `needs_vlm`: Whether VLM processing is needed
- `has_job_context`: Whether job context was provided
- `job_title`: Job title if available
- `file_path`: Path to analyzed file

#### 5. Batch Analysis (`gemini_batch_resume_analysis`)
```python
await GeminiService.batch_analyze_resumes(extraction_results, file_paths, job_context)
```

**Tracked Metadata:**
- `batch_type`: "resume_analysis"
- `batch_size`: Number of resumes in batch
- `has_job_context`: Whether job context was provided
- `job_title`: Job title if available
- `max_concurrent`: Concurrency limit
- `batch_outcome`: "completed"
- `successful_analyses`: Number of successful analyses
- `failed_analyses`: Number of failed analyses
- `success_rate`: Percentage of successful analyses

### Core LLM Calls (`gemini_api_call`)

Every actual API call to Gemini is tracked with:

**Input Tracking:**
- Full prompt text or "multimodal_prompt" for vision calls
- Model name and configuration
- Retry configuration

**Output Tracking:**
- Full response text
- Provider: "google_ai"
- Model name
- Token usage (if available):
  - `prompt_tokens`
  - `completion_tokens` 
  - `total_tokens`

**Error Tracking:**
- Retry attempts and errors
- Final failure information
- Success/failure status

## 🚀 Testing the Integration

### Run the Test Suite

```bash
python test_gemini_opik_integration.py
```

This comprehensive test suite will:

1. **Setup Validation**: Check Opik configuration and Gemini availability
2. **Text Analysis Test**: Analyze sample resume text with job context
3. **Q&A Assessment Test**: Assess interview readiness for sample questions
4. **Complete Workflow Test**: Run full analysis pipeline with extraction simulation
5. **Batch Analysis Test**: Process multiple resumes simultaneously
6. **Report Generation**: Provide detailed test results and dashboard links

### Expected Output

```
🧪 GEMINI + OPIK INTEGRATION TEST SUITE
==================================================

🚀 Setting up Gemini + Opik test environment...
📊 Opik Configuration: {'workspace': 'your-workspace', 'project': 'resume-analysis', 'available': True}
🤖 Gemini Service: {'available': True, 'model': 'gemini-1.5-flash', 'status': 'Service working correctly'}

📝 Testing Text Analysis with Opik Tracking...
✅ Text Analysis completed:
   - Overall Score: 87.5
   - Skills Found: 12
   - Experience Level: senior
   - Processing Method: gemini_text_analysis

🎯 Testing Q&A Readiness Assessment with Opik Tracking...
✅ Q&A Assessment completed:
   - Readiness Score: 82.0
   - Questions Assessed: 3
   - Recommendations: 4

... (additional test results)

📊 GEMINI + OPIK INTEGRATION TEST REPORT
============================================================
Total Tests Run: 5
Successful Tests: 5
Failed Tests: 0
Success Rate: 100.0%

🔍 Opik Dashboard Check:
   ✅ Check your Opik dashboard for tracking data:
   📊 Workspace: your-workspace
   📁 Project: resume-analysis
   🌐 Dashboard: https://www.comet.com/opik/

🏁 Test completed! Check the Opik dashboard to verify tracking data.
```

## 📈 Dashboard Navigation

### Accessing Your Data

1. **Login**: Visit [Opik Dashboard](https://www.comet.com/opik/)
2. **Navigate**: Go to your workspace → "resume-analysis" project
3. **View Traces**: See all tracked operations in chronological order

### Key Metrics to Monitor

#### 📊 **Performance Metrics**
- **Response Times**: How long each analysis takes
- **Success Rates**: Percentage of successful vs failed analyses
- **Token Usage**: Cost tracking for budget management
- **Throughput**: Number of resumes processed per hour/day

#### 🎯 **Business Metrics**
- **Analysis Quality**: Score distributions and patterns
- **Job Matching**: How well candidates match different job requirements
- **Q&A Performance**: Interview readiness trends
- **Batch Efficiency**: Concurrent processing performance

#### 🚨 **Error Monitoring**
- **Retry Patterns**: Which operations need multiple attempts
- **Failure Reasons**: Common error types and frequencies
- **Recovery Times**: How long errors take to resolve

### Dashboard Views

#### 1. **Traces View**
- See individual operations with full context
- Drill down into specific analyses
- View input/output for debugging

#### 2. **Analytics View**
- Aggregate performance metrics
- Time-series analysis of usage patterns
- Cost analysis and budgeting

#### 3. **Comparison View**
- Compare different model performance
- A/B test different prompt strategies
- Analyze quality improvements over time

## 🔧 Configuration Options

### Environment Variables

```bash
# Required
OPIK_API_KEY=your_api_key
OPIK_WORKSPACE=your_workspace
GEMINI_API_KEY=your_gemini_key

# Optional
OPIK_PROJECT_NAME=resume-analysis  # Default project name
```

### Programmatic Configuration

```python
from app.config.opik_config import OpikConfig

# Check if Opik is available
if OpikConfig.is_available():
    print("Opik tracking is active")

# Get configuration info
info = OpikConfig.get_project_info()
print(f"Project: {info['project']}, Workspace: {info['workspace']}")

# Log tracking events for debugging
OpikConfig.log_tracking_event("custom_event", {"custom_data": "value"})
```

## 🛠️ Advanced Usage

### Custom Tracking

You can add custom tracking to new operations:

```python
from opik import track, opik_context

@track(name="custom_analysis", tags=["custom", "analysis"])
async def custom_analysis_function(data):
    # Add metadata
    if OPIK_AVAILABLE:
        opik_context.update_current_span(
            metadata={
                "custom_field": "value",
                "data_size": len(data)
            }
        )
    
    # Your analysis logic here
    result = await process_data(data)
    
    # Update with results
    if OPIK_AVAILABLE:
        opik_context.update_current_span(
            output=result,
            metadata={"success": True}
        )
    
    return result
```

### Batch Operations

For batch operations, add summary metadata:

```python
# At the end of batch processing
if OPIK_AVAILABLE:
    opik_context.update_current_span(
        metadata={
            "batch_summary": {
                "total_items": len(items),
                "successful": success_count,
                "failed": failure_count,
                "success_rate": success_count / len(items)
            }
        }
    )
```

## 🐛 Troubleshooting

### Common Issues

#### 1. **Opik Not Available**
```
ERROR: Opik not available. Install with: pip install opik
```
**Solution**: Install Opik dependency
```bash
pip install opik
```

#### 2. **Configuration Error**
```
ERROR: Failed to initialize Opik: Invalid API key
```
**Solution**: Check your API key and workspace settings
```bash
python setup_opik_env.py
```

#### 3. **Network Issues**
```
WARNING: Failed to update Opik span metadata: Connection timeout
```
**Solution**: This is handled gracefully - tracking will continue without disrupting operations

#### 4. **Missing Environment Variables**
```
WARNING: LLM tracking will be disabled
```
**Solution**: Set up environment variables properly
```bash
export OPIK_API_KEY=your_key
export OPIK_WORKSPACE=your_workspace
```

### Debug Mode

Enable debug logging to see detailed tracking information:

```python
import logging
logging.getLogger("opik").setLevel(logging.DEBUG)
```

### Validation Script

Run the validation script to check your setup:

```bash
python -c "from app.config.opik_config import OpikConfig; print(OpikConfig.get_project_info())"
```

## 📋 Best Practices

### 1. **Metadata Strategy**
- Include business-relevant metadata (job titles, candidate experience levels)
- Add technical metadata (model versions, confidence scores)
- Use consistent naming conventions for tags

### 2. **Error Handling**
- All Opik operations are wrapped in try-catch blocks
- Failures don't disrupt main business logic
- Detailed error logging for debugging

### 3. **Performance**
- Opik operations are non-blocking
- Metadata updates are lightweight
- Batch operations include summary statistics

### 4. **Privacy**
- Don't include PII in tracking metadata
- Use anonymized identifiers when needed
- Consider data retention policies

## 🔮 Future Enhancements

### Planned Features

1. **Custom Dashboards**: Business-specific metrics and visualizations
2. **Automated Alerting**: Notifications for performance degradation
3. **A/B Testing**: Compare different prompt strategies
4. **Cost Optimization**: Automatic model selection based on cost/performance
5. **Quality Scoring**: Automated quality assessment of analyses

### Integration Points

1. **VAPI Integration**: Track voice interview performance
2. **Database Analytics**: Correlate tracking data with business outcomes
3. **External APIs**: Monitor all external service calls
4. **User Feedback**: Incorporate human feedback into quality metrics

---

## 📞 Support

For issues with Opik integration:

1. **Check Logs**: Look for Opik-related warnings/errors
2. **Run Tests**: Use the test suite to validate setup
3. **Verify Config**: Use setup script to check configuration
4. **Documentation**: Visit [Opik Documentation](https://www.comet.com/docs/opik)

Remember: Opik tracking is designed to be non-intrusive. If tracking fails, your core business logic will continue to work normally. 