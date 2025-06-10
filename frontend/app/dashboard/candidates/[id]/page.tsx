"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Award,
  FileText,
  Download,
  Star,
  Briefcase,
  User,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Target,
  TrendingUp,
  Globe,
  Tag,
  Activity,
  MessageSquare,
  PlayCircle,
  FileDown,
  Brain,
  BarChart3,
  Zap,
  Shield,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"

// Complete candidate data based on your exact schema
const candidateData = {
  id: "cand_67890abcdef",
  customer_id: "customer_12345",

  personal_info: {
    name: "Alice Johnson",
    email: "alice@example.com",
    phone: "+1-555-0123",
    location: "New York, NY",
    linkedin_url: "https://linkedin.com/in/alice",
    portfolio_url: "https://alice-portfolio.com",
  },

  resume_file_path: "/uploads/resumes/candidate_id/resume.pdf",
  resume_file_type: "application/pdf",
  original_filename: "alice_johnson_resume.pdf",
  resume_text: "Extracted text content from resume including work experience, education, and skills...",

  resume_analysis: {
    overall_score: 87.5,
    skills_extracted: ["Python", "FastAPI", "React", "MongoDB", "AWS", "Docker", "PostgreSQL", "Redis"],
    experience_years: 6,
    experience_level: "senior",
    education: {
      degree: "BS Computer Science",
      university: "Stanford University",
      graduation_year: 2018,
      gpa: 3.8,
    },
    previous_roles: [
      {
        title: "Senior Software Engineer",
        company: "TechCorp",
        duration_years: 3.5,
        technologies: ["Python", "React", "AWS"],
      },
      {
        title: "Full Stack Developer",
        company: "StartupXYZ",
        duration_years: 2.5,
        technologies: ["FastAPI", "MongoDB", "Docker"],
      },
    ],
    key_achievements: [
      "Led team of 5 engineers",
      "Increased system performance by 40%",
      "Implemented microservices architecture",
      "Reduced deployment time by 60%",
    ],
    analysis_summary:
      "Strong technical background with leadership experience in full-stack development. Demonstrates expertise in modern web technologies and cloud platforms.",
    strengths: ["Strong Python skills", "Leadership experience", "Full-stack expertise", "Cloud architecture"],
    areas_for_improvement: ["Limited mobile development experience", "Could benefit from DevOps certifications"],
    vlm_confidence_score: 0.94,
    analysis_version: "v1.0",
    analysis_timestamp: "2024-01-01T10:00:00Z",
  },

  applications: [
    {
      job_id: "job_507f1f77bcf86cd799439011",
      application_date: "2024-01-01T00:00:00Z",
      application_status: "interviewing",
      matching_score: 87.5,
      job_specific_analysis: {
        skill_match_percentage: 90,
        experience_match: "strong",
        education_match: "excellent",
        location_match: "compatible",
        salary_expectations_match: "within_range",
      },
      recruiter_notes:
        "Strong candidate, schedule screening call. Excellent technical background and leadership experience.",
      rejection_reason: null,
      offer_details: null,

      call_qa: {
        call_id: "call_507f1f77bcf86cd799439012",
        call_date: "2024-01-02T10:00:00Z",
        questions_answers: [
          {
            question: "What is your experience with FastAPI?",
            answer:
              "I have been working with FastAPI for about 4 years, primarily building microservices and REST APIs. I've implemented authentication, worked with async/await patterns, and integrated with various databases.",
            ideal_answer:
              "I have 3+ years experience building REST APIs with FastAPI, including authentication, database integration, and async operations.",
            score: 92.5,
            analysis:
              "Excellent answer that exceeds the ideal response with specific technical details and real-world experience.",
          },
          {
            question: "How do you handle database optimization?",
            answer:
              "I focus on proper indexing, query optimization, and use connection pooling. I also implement caching with Redis for frequently accessed data.",
            ideal_answer:
              "I use indexing strategies, query optimization, connection pooling, and caching mechanisms like Redis for performance.",
            score: 95.0,
            analysis: "Perfect answer that matches all key points of the ideal response.",
          },
          {
            question: "Describe your leadership experience.",
            answer:
              "I've led a team of 5 engineers for 2 years, focusing on mentoring junior developers and implementing agile methodologies. We improved our sprint velocity by 30%.",
            ideal_answer:
              "I have experience leading development teams, mentoring developers, and implementing development processes.",
            score: 88.0,
            analysis: "Strong answer with quantifiable results and specific leadership examples.",
          },
        ],
        overall_score: 93.75,
        interview_summary:
          "Candidate demonstrates exceptional technical skills with excellent FastAPI and database optimization knowledge. Strong fit for senior roles.",
        call_duration_minutes: 35,
        call_recording_url: "https://example.com/call_recordings/call_objectid.mp3",
        call_transcript_url: "https://example.com/call_transcripts/call_objectid.txt",
      },
    },
    {
      job_id: "job_507f1f77bcf86cd799439022",
      application_date: "2024-01-15T00:00:00Z",
      application_status: "applied",
      matching_score: 82.0,
      job_specific_analysis: {
        skill_match_percentage: 85,
        experience_match: "good",
        education_match: "excellent",
        location_match: "compatible",
        salary_expectations_match: "within_range",
      },
      recruiter_notes: "Good candidate for backend role. Need to assess React skills further.",
      rejection_reason: null,
      offer_details: null,
      call_qa: null, // No interview conducted yet
    },
  ],

  total_applications: 2,
  average_matching_score: 84.75,
  best_matching_job_id: "job_507f1f77bcf86cd799439011",
  application_success_rate: 0.0,

  candidate_status: "active",
  source: "direct_upload",
  tags: ["python", "senior", "leadership", "full-stack", "aws"],
  last_activity: "2024-01-01T10:00:00Z",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
}

// Interview Wizard Component with failsafes
function InterviewWizard({
  isOpen,
  onClose,
  interview,
}: {
  isOpen: boolean
  onClose: () => void
  interview: any
}) {
  const [currentStep, setCurrentStep] = useState(0)

  // Failsafe: Don't render if interview is null/undefined or missing required data
  if (
    !interview ||
    !interview.questions_answers ||
    !Array.isArray(interview.questions_answers) ||
    interview.questions_answers.length === 0
  ) {
    return null
  }

  const questions = interview.questions_answers
  const totalSteps = questions.length

  const getScoreColor = (score: number | null | undefined) => {
    if (typeof score !== "number") return "text-gray-700 bg-gray-100"
    if (score >= 90) return "text-green-700 bg-green-100"
    if (score >= 80) return "text-blue-700 bg-blue-100"
    if (score >= 70) return "text-yellow-700 bg-yellow-100"
    if (score >= 60) return "text-orange-700 bg-orange-100"
    return "text-red-700 bg-red-100"
  }

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const currentQuestion = questions[currentStep]

  // Failsafe: Don't render if current question is invalid
  if (!currentQuestion) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-purple-600" />
              Interview Playback - {interview.call_id || "Unknown"}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Interview Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{interview.call_duration_minutes || "N/A"}</div>
              <p className="text-sm text-gray-600">Minutes</p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(interview.overall_score)}`}>
                {interview.overall_score ? `${interview.overall_score}%` : "N/A"}
              </div>
              <p className="text-sm text-gray-600">Overall Score</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{totalSteps}</div>
              <p className="text-sm text-gray-600">Questions</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                Question {currentStep + 1} of {totalSteps}
              </span>
              <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Navigation */}
          <div className="flex justify-center gap-2 flex-wrap">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  index === currentStep
                    ? "bg-purple-600 text-white"
                    : index < currentStep
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {/* Current Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card className="border-2 border-purple-200">
                <CardHeader className="bg-purple-50">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Question {currentStep + 1}</span>
                    <Badge className={`${getScoreColor(currentQuestion.score)}`}>
                      {currentQuestion.score ? `${currentQuestion.score}%` : "N/A"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {currentQuestion.question && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Question:</h4>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border">{currentQuestion.question}</p>
                    </div>
                  )}

                  {currentQuestion.answer && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Candidate's Answer:</h4>
                      <p className="text-gray-700 bg-white p-4 rounded-lg border-2 border-blue-200">
                        {currentQuestion.answer}
                      </p>
                    </div>
                  )}

                  {currentQuestion.ideal_answer && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Ideal Answer:</h4>
                      <p className="text-gray-600 bg-yellow-50 p-4 rounded-lg border border-yellow-200 italic">
                        {currentQuestion.ideal_answer}
                      </p>
                    </div>
                  )}

                  {currentQuestion.analysis && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">AI Analysis:</h4>
                      <p className="text-blue-800">{currentQuestion.analysis}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              {interview.call_recording_url && (
                <Button variant="outline" className="flex items-center gap-2">
                  <PlayCircle className="h-4 w-4" />
                  <a href={interview.call_recording_url} target="_blank" rel="noopener noreferrer">
                    Play Recording
                  </a>
                </Button>
              )}
              {interview.call_transcript_url && (
                <Button variant="outline" className="flex items-center gap-2">
                  <FileDown className="h-4 w-4" />
                  <a href={interview.call_transcript_url} target="_blank" rel="noopener noreferrer">
                    Download Transcript
                  </a>
                </Button>
              )}
            </div>

            <Button
              onClick={nextStep}
              disabled={currentStep === totalSteps - 1}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Interview Summary */}
          {currentStep === totalSteps - 1 && interview.interview_summary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200"
            >
              <h4 className="font-semibold text-green-900 mb-2">Interview Summary:</h4>
              <p className="text-green-800">{interview.interview_summary}</p>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function CandidateProfilePage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedInterview, setSelectedInterview] = useState<any>(null)
  const [isInterviewWizardOpen, setIsInterviewWizardOpen] = useState(false)

  // Failsafe: Don't render if candidateData is null/undefined
  if (!candidateData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <Card className="border shadow-sm rounded-lg p-8">
          <CardContent className="text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Candidate Not Found</h3>
            <p className="text-gray-500">The candidate data could not be loaded.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const openInterviewWizard = (interview: any) => {
    if (interview && interview.questions_answers) {
      setSelectedInterview(interview)
      setIsInterviewWizardOpen(true)
    }
  }

  const closeInterviewWizard = () => {
    setIsInterviewWizardOpen(false)
    setSelectedInterview(null)
  }

  const getStatusColor = (status: string | null | undefined) => {
    if (!status) return "text-gray-700 bg-gray-100 border-gray-200"
    switch (status) {
      case "applied":
        return "text-blue-700 bg-blue-100 border-blue-200"
      case "screening":
        return "text-yellow-700 bg-yellow-100 border-yellow-200"
      case "interviewing":
        return "text-purple-700 bg-purple-100 border-purple-200"
      case "offered":
        return "text-green-700 bg-green-100 border-green-200"
      case "hired":
        return "text-emerald-700 bg-emerald-100 border-emerald-200"
      case "rejected":
        return "text-red-700 bg-red-100 border-red-200"
      default:
        return "text-gray-700 bg-gray-100 border-gray-200"
    }
  }

  const getCandidateStatusColor = (status: string | null | undefined) => {
    if (!status) return "text-gray-700 bg-gray-100 border-gray-200"
    switch (status) {
      case "active":
        return "text-green-700 bg-green-100 border-green-200"
      case "hired":
        return "text-blue-700 bg-blue-100 border-blue-200"
      case "inactive":
        return "text-gray-700 bg-gray-100 border-gray-200"
      case "blacklisted":
        return "text-red-700 bg-red-100 border-red-200"
      default:
        return "text-gray-700 bg-gray-100 border-gray-200"
    }
  }

  const getScoreColor = (score: number | null | undefined) => {
    if (typeof score !== "number") return "text-gray-700 bg-gray-100"
    if (score >= 90) return "text-green-700 bg-green-100"
    if (score >= 80) return "text-blue-700 bg-blue-100"
    if (score >= 70) return "text-yellow-700 bg-yellow-100"
    if (score >= 60) return "text-orange-700 bg-orange-100"
    return "text-red-700 bg-red-100"
  }

  const getExperienceMatchColor = (match: string | null | undefined) => {
    if (!match) return "text-gray-700 bg-gray-100"
    switch (match) {
      case "excellent":
        return "text-green-700 bg-green-100"
      case "strong":
        return "text-blue-700 bg-blue-100"
      case "good":
        return "text-yellow-700 bg-yellow-100"
      case "fair":
        return "text-orange-700 bg-orange-100"
      case "poor":
        return "text-red-700 bg-red-100"
      default:
        return "text-gray-700 bg-gray-100"
    }
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "analysis", label: "Resume Analysis" },
    { id: "applications", label: "Applications & Interviews" },
    { id: "files", label: "Files & Documents" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-7xl mx-auto p-6 space-y-8"
      >
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
            <Link href="/dashboard/candidates" className="flex items-center text-gray-600 hover:text-gray-900">
          <Button variant="outline" className="border-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Candidates
          </Button>
            </Link>
          <div className="flex-1" />
          <Button className="bg-gray-800 hover:bg-gray-700 text-white">
            <Download className="h-4 w-4 mr-2" />
            Download Resume
          </Button>
        </div>

        {/* Candidate Header */}
        {candidateData.personal_info && (
          <Card className="border shadow-sm rounded-lg">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                {/* Avatar Section */}
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                    {/* <AvatarImage
                      src="/placeholder.svg?height=128&width=128"
                      alt={candidateData.personal_info.name || "Candidate"}
                      className="object-cover"
                    /> */}
                    <AvatarFallback className="text-2xl font-bold bg-black text-white">
                      {candidateData.personal_info.name
                        ? candidateData.personal_info.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                        : "?"}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Profile Info */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                        {candidateData.personal_info.name || "Unknown Candidate"}
                      </h1>
                      {candidateData.candidate_status && (
                        <Badge
                          className={`px-3 py-1 border ${getCandidateStatusColor(candidateData.candidate_status)}`}
                        >
                          <Activity className="w-3 h-3 mr-1" />
                          {candidateData.candidate_status}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      {candidateData.id && <span className="text-lg">ID: {candidateData.id}</span>}
                      {candidateData.id && candidateData.customer_id && (
                        <Separator orientation="vertical" className="h-4" />
                      )}
                      {candidateData.customer_id && (
                        <span className="text-lg">Customer: {candidateData.customer_id}</span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {candidateData.resume_analysis?.experience_level &&
                        candidateData.resume_analysis?.experience_years && (
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1 border border-blue-200">
                            <Briefcase className="w-3 h-3 mr-1" />
                            {candidateData.resume_analysis.experience_level} •{" "}
                            {candidateData.resume_analysis.experience_years} years
                          </Badge>
                        )}
                      {candidateData.source && (
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 px-3 py-1 border border-purple-200">
                          <Target className="w-3 h-3 mr-1" />
                          Source: {candidateData.source}
                        </Badge>
                      )}
                      {candidateData.resume_analysis?.overall_score && (
                        <Badge
                          className={`px-3 py-1 border ${getScoreColor(candidateData.resume_analysis.overall_score)}`}
                        >
                          <Star className="w-3 h-3 mr-1" />
                          Score: {candidateData.resume_analysis.overall_score}%
                        </Badge>
                      )}
                    </div>

                    {/* Tags */}
                    {candidateData.tags && candidateData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {candidateData.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Tag className="w-2 h-2 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                    {candidateData.personal_info.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{candidateData.personal_info.email}</span>
                      </div>
                    )}
                    {candidateData.personal_info.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{candidateData.personal_info.phone}</span>
                      </div>
                    )}
                    {candidateData.personal_info.location && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4 text-red-600" />
                        <span className="text-sm">{candidateData.personal_info.location}</span>
                      </div>
                    )}
                    {candidateData.last_activity && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">
                          Last Active: {new Date(candidateData.last_activity).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border shadow-sm rounded-lg">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{candidateData.total_applications ?? 0}</div>
              <p className="text-sm text-gray-600">Total Applications</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm rounded-lg">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {candidateData.average_matching_score ? `${candidateData.average_matching_score}%` : "N/A"}
              </div>
              <p className="text-sm text-gray-600">Avg Match Score</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm rounded-lg">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {candidateData.application_success_rate !== null && candidateData.application_success_rate !== undefined
                  ? `${(candidateData.application_success_rate * 100).toFixed(1)}%`
                  : "N/A"}
              </div>
              <p className="text-sm text-gray-600">Success Rate</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm rounded-lg">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 mb-4">
                <Brain className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {candidateData.resume_analysis?.vlm_confidence_score
                  ? `${(candidateData.resume_analysis.vlm_confidence_score * 100).toFixed(0)}%`
                  : "N/A"}
              </div>
              <p className="text-sm text-gray-600">AI Confidence</p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-gray-800 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "overview" && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personal Information */}
                {candidateData.personal_info && (
                  <Card className="border shadow-sm rounded-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-600" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          {candidateData.personal_info.email && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50">
                              <Mail className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium">{candidateData.personal_info.email}</p>
                              </div>
                            </div>
                          )}
                          {candidateData.personal_info.phone && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50">
                              <Phone className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="font-medium">{candidateData.personal_info.phone}</p>
                              </div>
                            </div>
                          )}
                          {candidateData.personal_info.location && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50">
                              <MapPin className="h-5 w-5 text-red-600" />
                              <div>
                                <p className="text-sm text-gray-500">Location</p>
                                <p className="font-medium">{candidateData.personal_info.location}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          {candidateData.personal_info.linkedin_url && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50">
                              <ExternalLink className="h-5 w-5 text-purple-600" />
                              <div>
                                <p className="text-sm text-gray-500">LinkedIn</p>
                                <a
                                  href={candidateData.personal_info.linkedin_url}
                                  className="font-medium text-purple-600 hover:underline"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View Profile
                                </a>
                              </div>
                            </div>
                          )}
                          {candidateData.personal_info.portfolio_url && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50">
                              <Globe className="h-5 w-5 text-orange-600" />
                              <div>
                                <p className="text-sm text-gray-500">Portfolio</p>
                                <a
                                  href={candidateData.personal_info.portfolio_url}
                                  className="font-medium text-orange-600 hover:underline"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View Portfolio
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Skills Overview */}
                {candidateData.resume_analysis?.skills_extracted &&
                  candidateData.resume_analysis.skills_extracted.length > 0 && (
                    <Card className="border shadow-sm rounded-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="h-5 w-5 text-yellow-600" />
                          Extracted Skills
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {candidateData.resume_analysis.skills_extracted.map((skill, index) => (
                            <Badge
                              key={index}
                              className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 px-3 py-1 border border-yellow-200"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Metadata */}
                <Card className="border shadow-sm rounded-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-gray-600" />
                      Metadata
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {candidateData.created_at && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Created At</p>
                          <p className="font-medium">{new Date(candidateData.created_at).toLocaleString()}</p>
                        </div>
                      )}
                      {candidateData.updated_at && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Updated At</p>
                          <p className="font-medium">{new Date(candidateData.updated_at).toLocaleString()}</p>
                        </div>
                      )}
                      {candidateData.last_activity && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Last Activity</p>
                          <p className="font-medium">{new Date(candidateData.last_activity).toLocaleString()}</p>
                        </div>
                      )}
                      {candidateData.best_matching_job_id && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Best Matching Job</p>
                          <p className="font-medium text-blue-600">{candidateData.best_matching_job_id}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Education Quick View */}
                {candidateData.resume_analysis?.education && (
                  <Card className="border shadow-sm rounded-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-indigo-600" />
                        Education
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {candidateData.resume_analysis.education.degree && (
                          <h4 className="font-semibold text-gray-900">
                            {candidateData.resume_analysis.education.degree}
                          </h4>
                        )}
                        {candidateData.resume_analysis.education.university && (
                          <p className="text-gray-600">{candidateData.resume_analysis.education.university}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {candidateData.resume_analysis.education.graduation_year && (
                            <span>Class of {candidateData.resume_analysis.education.graduation_year}</span>
                          )}
                          {candidateData.resume_analysis.education.gpa && (
                            <Badge className="bg-indigo-100 text-indigo-800">
                              GPA: {candidateData.resume_analysis.education.gpa}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {activeTab === "analysis" && candidateData.resume_analysis && (
            <div className="space-y-6">
              {/* Analysis Overview */}
              <div className="grid lg:grid-cols-2 gap-6">
                {candidateData.resume_analysis.analysis_summary && (
                  <Card className="border shadow-sm rounded-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-600" />
                        Analysis Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        {candidateData.resume_analysis.analysis_summary}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {candidateData.resume_analysis.analysis_version && (
                          <span>Version: {candidateData.resume_analysis.analysis_version}</span>
                        )}
                        {candidateData.resume_analysis.analysis_timestamp && (
                          <span>
                            Analyzed: {new Date(candidateData.resume_analysis.analysis_timestamp).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="border shadow-sm rounded-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      Analysis Scores
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {candidateData.resume_analysis.overall_score && (
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Overall Score</span>
                          <Badge className={`${getScoreColor(candidateData.resume_analysis.overall_score)}`}>
                            {candidateData.resume_analysis.overall_score}%
                          </Badge>
                        </div>
                      )}
                      {candidateData.resume_analysis.vlm_confidence_score && (
                        <div className="flex justify-between items-center">
                          <span className="font-medium">VLM Confidence</span>
                          <Badge
                            className={`${getScoreColor(candidateData.resume_analysis.vlm_confidence_score * 100)}`}
                          >
                            {(candidateData.resume_analysis.vlm_confidence_score * 100).toFixed(1)}%
                          </Badge>
                        </div>
                      )}
                      {candidateData.resume_analysis.experience_level && (
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Experience Level</span>
                          <Badge className="bg-blue-100 text-blue-800 capitalize">
                            {candidateData.resume_analysis.experience_level}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Previous Roles */}
              {candidateData.resume_analysis.previous_roles &&
                candidateData.resume_analysis.previous_roles.length > 0 && (
                  <Card className="border shadow-sm rounded-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-green-600" />
                        Previous Roles
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {candidateData.resume_analysis.previous_roles.map((role, index) => (
                        <div key={index} className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              {role.title && <h4 className="font-semibold text-gray-900">{role.title}</h4>}
                              {role.company && <p className="text-gray-600">{role.company}</p>}
                            </div>
                            {role.duration_years && (
                              <Badge className="bg-green-100 text-green-800">{role.duration_years} years</Badge>
                            )}
                          </div>
                          {role.technologies && role.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {role.technologies.map((tech, techIndex) => (
                                <Badge key={techIndex} variant="outline" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

              {/* Strengths and Areas for Improvement */}
              <div className="grid lg:grid-cols-2 gap-6">
                {candidateData.resume_analysis.strengths && candidateData.resume_analysis.strengths.length > 0 && (
                  <Card className="border shadow-sm rounded-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {candidateData.resume_analysis.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {candidateData.resume_analysis.areas_for_improvement &&
                  candidateData.resume_analysis.areas_for_improvement.length > 0 && (
                    <Card className="border shadow-sm rounded-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-700">
                          <AlertCircle className="h-5 w-5 text-orange-600" />
                          Areas for Improvement
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {candidateData.resume_analysis.areas_for_improvement.map((area, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{area}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
              </div>

              {/* Key Achievements */}
              {candidateData.resume_analysis.key_achievements &&
                candidateData.resume_analysis.key_achievements.length > 0 && (
                  <Card className="border shadow-sm rounded-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-yellow-600" />
                        Key Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {candidateData.resume_analysis.key_achievements.map((achievement, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Award className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
            </div>
          )}

          {activeTab === "applications" && (
            <div className="space-y-6">
              {candidateData.applications && candidateData.applications.length > 0 ? (
                candidateData.applications.map((application, index) => (
                  <Card key={index} className="border shadow-sm rounded-lg">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-blue-600" />
                          Job Application - {application.job_id || "Unknown"}
                        </CardTitle>
                        {application.application_status && (
                          <Badge className={`border ${getStatusColor(application.application_status)}`}>
                            {application.application_status}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Application Details */}
                      <div className="grid lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          {application.application_date && (
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Application Date</p>
                              <p className="font-medium">{new Date(application.application_date).toLocaleString()}</p>
                            </div>
                          )}
                          {application.matching_score && (
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Matching Score</p>
                              <Badge className={`${getScoreColor(application.matching_score)}`}>
                                {application.matching_score}%
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="space-y-4">
                          {application.recruiter_notes && (
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Recruiter Notes</p>
                              <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                                {application.recruiter_notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Job Specific Analysis */}
                      {application.job_specific_analysis && (
                        <Card className="bg-gray-50 border-gray-200">
                          <CardHeader>
                            <CardTitle className="text-lg">Job Match Analysis</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                              {application.job_specific_analysis.skill_match_percentage && (
                                <div className="text-center">
                                  <div
                                    className={`text-2xl font-bold mb-1 ${getScoreColor(application.job_specific_analysis.skill_match_percentage)}`}
                                  >
                                    {application.job_specific_analysis.skill_match_percentage}%
                                  </div>
                                  <p className="text-xs text-gray-600">Skills Match</p>
                                </div>
                              )}
                              {application.job_specific_analysis.experience_match && (
                                <div className="text-center">
                                  <Badge
                                    className={`mb-1 ${getExperienceMatchColor(application.job_specific_analysis.experience_match)}`}
                                  >
                                    {application.job_specific_analysis.experience_match}
                                  </Badge>
                                  <p className="text-xs text-gray-600">Experience</p>
                                </div>
                              )}
                              {application.job_specific_analysis.education_match && (
                                <div className="text-center">
                                  <Badge
                                    className={`mb-1 ${getExperienceMatchColor(application.job_specific_analysis.education_match)}`}
                                  >
                                    {application.job_specific_analysis.education_match}
                                  </Badge>
                                  <p className="text-xs text-gray-600">Education</p>
                                </div>
                              )}
                              {application.job_specific_analysis.location_match && (
                                <div className="text-center">
                                  <Badge
                                    className={`mb-1 ${getExperienceMatchColor(application.job_specific_analysis.location_match)}`}
                                  >
                                    {application.job_specific_analysis.location_match}
                                  </Badge>
                                  <p className="text-xs text-gray-600">Location</p>
                                </div>
                              )}
                              {application.job_specific_analysis.salary_expectations_match && (
                                <div className="text-center">
                                  <Badge
                                    className={`mb-1 ${getExperienceMatchColor(application.job_specific_analysis.salary_expectations_match)}`}
                                  >
                                    {application.job_specific_analysis.salary_expectations_match}
                                  </Badge>
                                  <p className="text-xs text-gray-600">Salary</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Interview Section */}
                      {application.call_qa ? (
                        <Card className="bg-purple-50 border-purple-200">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <CardTitle className="flex items-center gap-2 text-purple-800">
                                <MessageSquare className="h-5 w-5 text-purple-600" />
                                Interview Completed
                              </CardTitle>
                              {application.call_qa.overall_score && (
                                <Badge className={`${getScoreColor(application.call_qa.overall_score)}`}>
                                  Score: {application.call_qa.overall_score}%
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {application.call_qa.call_date && (
                                <div>
                                  <p className="text-sm text-purple-600 mb-1">Interview Date</p>
                                  <p className="font-medium text-purple-800">
                                    {new Date(application.call_qa.call_date).toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                              {application.call_qa.call_duration_minutes && (
                                <div>
                                  <p className="text-sm text-purple-600 mb-1">Duration</p>
                                  <p className="font-medium text-purple-800">
                                    {application.call_qa.call_duration_minutes} min
                                  </p>
                                </div>
                              )}
                              {application.call_qa.questions_answers && (
                                <div>
                                  <p className="text-sm text-purple-600 mb-1">Questions</p>
                                  <p className="font-medium text-purple-800">
                                    {application.call_qa.questions_answers.length}
                                  </p>
                                </div>
                              )}
                            </div>

                            {application.call_qa.interview_summary && (
                              <div className="bg-white p-4 rounded-lg border border-purple-200">
                                <h4 className="font-semibold text-purple-900 mb-2">Summary:</h4>
                                <p className="text-purple-800 text-sm">{application.call_qa.interview_summary}</p>
                              </div>
                            )}

                            <div className="flex gap-3">
                              <Button
                                onClick={() => openInterviewWizard(application.call_qa)}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                              >
                                <PlayCircle className="h-4 w-4 mr-2" />
                                Play Interview
                              </Button>
                              {application.call_qa.call_transcript_url && (
                                <Button variant="outline" className="border-purple-300 text-purple-700">
                                  <FileDown className="h-4 w-4 mr-2" />
                                  <a
                                    href={application.call_qa.call_transcript_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Download Transcript
                                  </a>
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <Card className="bg-gray-50 border-gray-200">
                          <CardContent className="text-center py-8">
                            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Interview Conducted</h3>
                            <p className="text-gray-500 mb-4">This application hasn't been interviewed yet.</p>
                            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                              <PlayCircle className="h-4 w-4 mr-2" />
                              Schedule Interview
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border shadow-sm rounded-lg">
                  <CardContent className="text-center py-12">
                    <Target className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
                    <p className="text-gray-500">This candidate hasn't applied to any jobs yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === "files" && (
            <div className="space-y-6">
              {/* Resume File */}
              {(candidateData.original_filename ||
                candidateData.resume_file_type ||
                candidateData.resume_file_path) && (
                <Card className="border shadow-sm rounded-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Resume File
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {candidateData.original_filename || "Resume File"}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {candidateData.resume_file_type && <span>Type: {candidateData.resume_file_type}</span>}
                            {candidateData.resume_file_path && <span>Path: {candidateData.resume_file_path}</span>}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Resume Text Content */}
              {candidateData.resume_text && (
                <Card className="border shadow-sm rounded-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-green-600" />
                      Extracted Resume Text
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg border max-h-96 overflow-y-auto">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                        {candidateData.resume_text}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Interview Wizard Modal */}
        <InterviewWizard isOpen={isInterviewWizardOpen} onClose={closeInterviewWizard} interview={selectedInterview} />
      </motion.div>
    </div>
  )
}
