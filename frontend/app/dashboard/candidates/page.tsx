"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Eye, Star, MapPin, Briefcase, Calendar, User, ArrowRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

// Updated interfaces to match the new schema
interface CallQA {
  call_id: string
  call_date: string
  questions_answers: Array<{
    question: string
    answer: string
    ideal_answer: string
    score: number
    analysis: string
  }>
  overall_score: number
  interview_summary: string
  call_duration_minutes: number
  call_recording_url: string
  call_transcript_url: string
}

interface JobSpecificAnalysis {
  skill_match_percentage: number
  experience_match: string
  education_match: string
  location_match: string
  salary_expectations_match: string
}

interface Application {
  job_id: string
  application_date: string
  application_status: "applied" | "screening" | "interviewing" | "offered" | "hired" | "rejected"
  matching_score: number
  job_specific_analysis: JobSpecificAnalysis
  recruiter_notes: string
  rejection_reason?: string | null
  offer_details?: any | null
  call_qa?: CallQA | null
}

interface Education {
  degree: string
  university: string
  graduation_year: number
  gpa: number
}

interface PreviousRole {
  title: string
  company: string
  duration_years: number
  technologies: string[]
}

interface ResumeAnalysis {
  overall_score: number
  skills_extracted: string[]
  experience_years: number
  experience_level: string
  education: Education
  previous_roles: PreviousRole[]
  key_achievements: string[]
  analysis_summary: string
  strengths: string[]
  areas_for_improvement: string[]
  vlm_confidence_score: number
  analysis_version: string
  analysis_timestamp: string
}

interface PersonalInfo {
  name: string
  email: string
  phone: string
  location: string
  linkedin_url: string
  portfolio_url: string
}

interface Candidate {
  id: string
  customer_id: string
  personal_info: PersonalInfo
  resume_file_path: string
  resume_file_type: string
  original_filename: string
  resume_text: string
  resume_analysis: ResumeAnalysis
  applications: Application[]
  total_applications: number
  average_matching_score: number
  best_matching_job_id: string
  application_success_rate: number
  candidate_status: "active" | "hired" | "inactive" | "blacklisted"
  source: string
  tags: string[]
  last_activity: string
  created_at: string
  updated_at: string
}

export default function CandidatesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>("")
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("")
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const jobId = searchParams.get("jobId")

  // Comprehensive dummy candidates based on the new schema
  const candidatesData: Candidate[] = [
    {
      id: "cand_001",
      customer_id: "customer_12345",
      personal_info: {
        name: "Alice Johnson",
        email: "alice.johnson@example.com",
        phone: "+1-555-0123",
        location: "San Francisco, CA",
        linkedin_url: "https://linkedin.com/in/alice-johnson",
        portfolio_url: "https://alice-portfolio.com",
      },
      resume_file_path: "/uploads/resumes/alice_johnson/resume.pdf",
      resume_file_type: "application/pdf",
      original_filename: "alice_johnson_resume.pdf",
      resume_text: "Senior Software Engineer with 6 years of experience...",
      resume_analysis: {
        overall_score: 87.5,
        skills_extracted: ["Python", "FastAPI", "React", "MongoDB", "AWS", "Docker"],
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
        ],
        analysis_summary: "Strong technical background with leadership experience in full-stack development.",
        strengths: ["Strong Python skills", "Leadership experience", "Full-stack expertise"],
        areas_for_improvement: ["Limited mobile development experience"],
        vlm_confidence_score: 0.94,
        analysis_version: "v1.0",
        analysis_timestamp: "2024-01-01T10:00:00Z",
      },
      applications: [
        {
          job_id: "job_001",
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
          recruiter_notes: "Strong candidate, excellent technical background",
          call_qa: {
            call_id: "call_001",
            call_date: "2024-01-02T10:00:00Z",
            questions_answers: [
              {
                question: "What is your experience with FastAPI?",
                answer: "I have 4 years of experience with FastAPI...",
                ideal_answer: "3+ years experience with FastAPI...",
                score: 92.5,
                analysis: "Excellent answer with specific details",
              },
            ],
            overall_score: 93.75,
            interview_summary: "Exceptional technical skills, strong fit for senior roles",
            call_duration_minutes: 35,
            call_recording_url: "https://example.com/recording1.mp3",
            call_transcript_url: "https://example.com/transcript1.txt",
          },
        },
      ],
      total_applications: 1,
      average_matching_score: 87.5,
      best_matching_job_id: "job_001",
      application_success_rate: 0.0,
      candidate_status: "active",
      source: "direct_upload",
      tags: ["python", "senior", "leadership", "full-stack"],
      last_activity: "2024-01-01T10:00:00Z",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "cand_002",
      customer_id: "customer_12345",
      personal_info: {
        name: "Marcus Chen",
        email: "marcus.chen@example.com",
        phone: "+1-555-0456",
        location: "Seattle, WA",
        linkedin_url: "https://linkedin.com/in/marcus-chen",
        portfolio_url: "https://marcus-dev.com",
      },
      resume_file_path: "/uploads/resumes/marcus_chen/resume.pdf",
      resume_file_type: "application/pdf",
      original_filename: "marcus_chen_resume.pdf",
      resume_text: "Frontend specialist with React and TypeScript expertise...",
      resume_analysis: {
        overall_score: 82.0,
        skills_extracted: ["React", "TypeScript", "Next.js", "GraphQL", "Node.js"],
        experience_years: 4,
        experience_level: "mid",
        education: {
          degree: "BS Software Engineering",
          university: "University of Washington",
          graduation_year: 2020,
          gpa: 3.6,
        },
        previous_roles: [
          {
            title: "Frontend Developer",
            company: "WebTech Solutions",
            duration_years: 2.5,
            technologies: ["React", "TypeScript", "GraphQL"],
          },
          {
            title: "Junior Developer",
            company: "Digital Agency",
            duration_years: 1.5,
            technologies: ["JavaScript", "HTML", "CSS"],
          },
        ],
        key_achievements: [
          "Built responsive web applications",
          "Improved page load times by 30%",
          "Mentored 2 junior developers",
        ],
        analysis_summary: "Solid frontend developer with modern JavaScript expertise.",
        strengths: ["React expertise", "TypeScript proficiency", "UI/UX focus"],
        areas_for_improvement: ["Backend development", "DevOps knowledge"],
        vlm_confidence_score: 0.88,
        analysis_version: "v1.0",
        analysis_timestamp: "2024-01-05T10:00:00Z",
      },
      applications: [
        {
          job_id: "job_002",
          application_date: "2024-01-05T00:00:00Z",
          application_status: "applied",
          matching_score: 82.0,
          job_specific_analysis: {
            skill_match_percentage: 85,
            experience_match: "good",
            education_match: "excellent",
            location_match: "compatible",
            salary_expectations_match: "within_range",
          },
          recruiter_notes: "Good frontend skills, need to assess backend capabilities",
        },
      ],
      total_applications: 1,
      average_matching_score: 82.0,
      best_matching_job_id: "job_002",
      application_success_rate: 0.0,
      candidate_status: "active",
      source: "job_portal",
      tags: ["react", "frontend", "typescript", "mid-level"],
      last_activity: "2024-01-05T10:00:00Z",
      created_at: "2024-01-05T00:00:00Z",
      updated_at: "2024-01-05T00:00:00Z",
    },
    {
      id: "cand_003",
      customer_id: "customer_12345",
      personal_info: {
        name: "Sarah Williams",
        email: "sarah.williams@example.com",
        phone: "+1-555-0789",
        location: "Austin, TX",
        linkedin_url: "https://linkedin.com/in/sarah-williams",
        portfolio_url: "https://sarah-mobile.dev",
      },
      resume_file_path: "/uploads/resumes/sarah_williams/resume.pdf",
      resume_file_type: "application/pdf",
      original_filename: "sarah_williams_resume.pdf",
      resume_text: "Mobile development specialist with iOS and Android experience...",
      resume_analysis: {
        overall_score: 91.2,
        skills_extracted: ["Swift", "Kotlin", "React Native", "iOS", "Android", "Firebase"],
        experience_years: 7,
        experience_level: "senior",
        education: {
          degree: "MS Computer Science",
          university: "UT Austin",
          graduation_year: 2017,
          gpa: 3.9,
        },
        previous_roles: [
          {
            title: "Senior Mobile Developer",
            company: "MobileFirst Inc",
            duration_years: 4.0,
            technologies: ["Swift", "Kotlin", "React Native"],
          },
          {
            title: "iOS Developer",
            company: "AppStudio",
            duration_years: 3.0,
            technologies: ["Swift", "Objective-C", "Core Data"],
          },
        ],
        key_achievements: [
          "Published 12 apps to App Store",
          "Led mobile team of 6 developers",
          "Reduced app crash rate by 85%",
        ],
        analysis_summary: "Expert mobile developer with cross-platform experience and team leadership.",
        strengths: ["Mobile expertise", "Cross-platform development", "Team leadership"],
        areas_for_improvement: ["Web development", "Backend services"],
        vlm_confidence_score: 0.96,
        analysis_version: "v1.0",
        analysis_timestamp: "2024-01-10T10:00:00Z",
      },
      applications: [
        {
          job_id: "job_003",
          application_date: "2024-01-10T00:00:00Z",
          application_status: "offered",
          matching_score: 91.2,
          job_specific_analysis: {
            skill_match_percentage: 95,
            experience_match: "excellent",
            education_match: "excellent",
            location_match: "compatible",
            salary_expectations_match: "within_range",
          },
          recruiter_notes: "Exceptional mobile developer, perfect fit for our team",
          call_qa: {
            call_id: "call_003",
            call_date: "2024-01-12T14:00:00Z",
            questions_answers: [
              {
                question: "How do you handle cross-platform development?",
                answer: "I use React Native for shared logic and native code for platform-specific features...",
                ideal_answer: "Cross-platform approach with native optimizations...",
                score: 96.0,
                analysis: "Outstanding answer demonstrating deep understanding",
              },
            ],
            overall_score: 94.5,
            interview_summary: "Exceptional candidate with perfect mobile expertise match",
            call_duration_minutes: 45,
            call_recording_url: "https://example.com/recording3.mp3",
            call_transcript_url: "https://example.com/transcript3.txt",
          },
        },
      ],
      total_applications: 1,
      average_matching_score: 91.2,
      best_matching_job_id: "job_003",
      application_success_rate: 0.0,
      candidate_status: "active",
      source: "referral",
      tags: ["mobile", "ios", "android", "senior", "leadership"],
      last_activity: "2024-01-12T14:00:00Z",
      created_at: "2024-01-10T00:00:00Z",
      updated_at: "2024-01-12T14:00:00Z",
    },
    {
      id: "cand_004",
      customer_id: "customer_12345",
      personal_info: {
        name: "David Rodriguez",
        email: "david.rodriguez@example.com",
        phone: "+1-555-0321",
        location: "Denver, CO",
        linkedin_url: "https://linkedin.com/in/david-rodriguez",
        portfolio_url: "https://david-devops.com",
      },
      resume_file_path: "/uploads/resumes/david_rodriguez/resume.pdf",
      resume_file_type: "application/pdf",
      original_filename: "david_rodriguez_resume.pdf",
      resume_text: "DevOps engineer with cloud infrastructure expertise...",
      resume_analysis: {
        overall_score: 89.8,
        skills_extracted: ["AWS", "Kubernetes", "Docker", "Terraform", "Jenkins", "Python"],
        experience_years: 8,
        experience_level: "senior",
        education: {
          degree: "BS Information Systems",
          university: "Colorado State University",
          graduation_year: 2016,
          gpa: 3.7,
        },
        previous_roles: [
          {
            title: "Senior DevOps Engineer",
            company: "CloudTech Solutions",
            duration_years: 4.5,
            technologies: ["AWS", "Kubernetes", "Terraform"],
          },
          {
            title: "Systems Administrator",
            company: "Enterprise Corp",
            duration_years: 3.5,
            technologies: ["Linux", "Docker", "Jenkins"],
          },
        ],
        key_achievements: [
          "Reduced deployment time by 70%",
          "Managed infrastructure for 50+ microservices",
          "Implemented CI/CD for 20+ teams",
        ],
        analysis_summary: "Expert DevOps engineer with extensive cloud and automation experience.",
        strengths: ["Cloud architecture", "Automation", "Infrastructure as Code"],
        areas_for_improvement: ["Frontend development", "Mobile platforms"],
        vlm_confidence_score: 0.92,
        analysis_version: "v1.0",
        analysis_timestamp: "2024-01-08T10:00:00Z",
      },
      applications: [
        {
          job_id: "job_004",
          application_date: "2024-01-08T00:00:00Z",
          application_status: "hired",
          matching_score: 89.8,
          job_specific_analysis: {
            skill_match_percentage: 92,
            experience_match: "excellent",
            education_match: "good",
            location_match: "compatible",
            salary_expectations_match: "within_range",
          },
          recruiter_notes: "Perfect DevOps candidate, hired immediately",
          call_qa: {
            call_id: "call_004",
            call_date: "2024-01-09T11:00:00Z",
            questions_answers: [
              {
                question: "How do you handle infrastructure scaling?",
                answer: "I use Kubernetes auto-scaling with custom metrics and Terraform for infrastructure...",
                ideal_answer: "Auto-scaling strategies with infrastructure as code...",
                score: 95.5,
                analysis: "Comprehensive answer showing deep technical expertise",
              },
            ],
            overall_score: 92.0,
            interview_summary: "Outstanding DevOps expertise, immediate hire recommendation",
            call_duration_minutes: 40,
            call_recording_url: "https://example.com/recording4.mp3",
            call_transcript_url: "https://example.com/transcript4.txt",
          },
        },
      ],
      total_applications: 1,
      average_matching_score: 89.8,
      best_matching_job_id: "job_004",
      application_success_rate: 1.0,
      candidate_status: "hired",
      source: "linkedin",
      tags: ["devops", "aws", "kubernetes", "senior", "hired"],
      last_activity: "2024-01-09T11:00:00Z",
      created_at: "2024-01-08T00:00:00Z",
      updated_at: "2024-01-09T11:00:00Z",
    },
    {
      id: "cand_005",
      customer_id: "customer_12345",
      personal_info: {
        name: "Emily Zhang",
        email: "emily.zhang@example.com",
        phone: "+1-555-0654",
        location: "Boston, MA",
        linkedin_url: "https://linkedin.com/in/emily-zhang",
        portfolio_url: "https://emily-data.science",
      },
      resume_file_path: "/uploads/resumes/emily_zhang/resume.pdf",
      resume_file_type: "application/pdf",
      original_filename: "emily_zhang_resume.pdf",
      resume_text: "Data scientist with machine learning and AI expertise...",
      resume_analysis: {
        overall_score: 85.3,
        skills_extracted: ["Python", "TensorFlow", "PyTorch", "SQL", "R", "Pandas"],
        experience_years: 5,
        experience_level: "mid",
        education: {
          degree: "PhD Data Science",
          university: "MIT",
          graduation_year: 2019,
          gpa: 3.95,
        },
        previous_roles: [
          {
            title: "Data Scientist",
            company: "AI Research Lab",
            duration_years: 3.0,
            technologies: ["Python", "TensorFlow", "SQL"],
          },
          {
            title: "Research Assistant",
            company: "MIT",
            duration_years: 2.0,
            technologies: ["R", "Python", "Statistics"],
          },
        ],
        key_achievements: [
          "Published 8 research papers",
          "Built ML models with 95% accuracy",
          "Led data science team of 4",
        ],
        analysis_summary: "Highly qualified data scientist with strong academic background and research experience.",
        strengths: ["Machine learning", "Research background", "Statistical analysis"],
        areas_for_improvement: ["Software engineering", "Production systems"],
        vlm_confidence_score: 0.9,
        analysis_version: "v1.0",
        analysis_timestamp: "2024-01-12T10:00:00Z",
      },
      applications: [
        {
          job_id: "job_005",
          application_date: "2024-01-12T00:00:00Z",
          application_status: "screening",
          matching_score: 85.3,
          job_specific_analysis: {
            skill_match_percentage: 88,
            experience_match: "strong",
            education_match: "excellent",
            location_match: "compatible",
            salary_expectations_match: "within_range",
          },
          recruiter_notes: "Strong academic background, need to assess practical experience",
        },
      ],
      total_applications: 1,
      average_matching_score: 85.3,
      best_matching_job_id: "job_005",
      application_success_rate: 0.0,
      candidate_status: "active",
      source: "direct_upload",
      tags: ["data-science", "ml", "python", "phd", "research"],
      last_activity: "2024-01-12T10:00:00Z",
      created_at: "2024-01-12T00:00:00Z",
      updated_at: "2024-01-12T10:00:00Z",
    },
    {
      id: "cand_006",
      customer_id: "customer_12345",
      personal_info: {
        name: "James Thompson",
        email: "james.thompson@example.com",
        phone: "+1-555-0987",
        location: "Chicago, IL",
        linkedin_url: "https://linkedin.com/in/james-thompson",
        portfolio_url: "https://james-backend.dev",
      },
      resume_file_path: "/uploads/resumes/james_thompson/resume.pdf",
      resume_file_type: "application/pdf",
      original_filename: "james_thompson_resume.pdf",
      resume_text: "Backend engineer specializing in microservices and distributed systems...",
      resume_analysis: {
        overall_score: 76.5,
        skills_extracted: ["Java", "Spring Boot", "PostgreSQL", "Redis", "Kafka"],
        experience_years: 3,
        experience_level: "mid",
        education: {
          degree: "BS Computer Engineering",
          university: "University of Illinois",
          graduation_year: 2021,
          gpa: 3.4,
        },
        previous_roles: [
          {
            title: "Backend Developer",
            company: "FinTech Startup",
            duration_years: 2.0,
            technologies: ["Java", "Spring Boot", "PostgreSQL"],
          },
          {
            title: "Junior Developer",
            company: "Software Solutions",
            duration_years: 1.0,
            technologies: ["Java", "MySQL", "REST APIs"],
          },
        ],
        key_achievements: [
          "Built payment processing system",
          "Optimized database queries by 40%",
          "Implemented event-driven architecture",
        ],
        analysis_summary: "Solid backend developer with good foundation in Java and microservices.",
        strengths: ["Java expertise", "Database optimization", "API development"],
        areas_for_improvement: ["Frontend skills", "Cloud platforms", "Leadership experience"],
        vlm_confidence_score: 0.82,
        analysis_version: "v1.0",
        analysis_timestamp: "2024-01-15T10:00:00Z",
      },
      applications: [
        {
          job_id: "job_006",
          application_date: "2024-01-15T00:00:00Z",
          application_status: "rejected",
          matching_score: 76.5,
          job_specific_analysis: {
            skill_match_percentage: 75,
            experience_match: "fair",
            education_match: "good",
            location_match: "compatible",
            salary_expectations_match: "above_range",
          },
          recruiter_notes: "Good technical skills but lacks senior-level experience",
          rejection_reason: "Insufficient experience for senior role requirements",
        },
      ],
      total_applications: 1,
      average_matching_score: 76.5,
      best_matching_job_id: "job_006",
      application_success_rate: 0.0,
      candidate_status: "active",
      source: "job_portal",
      tags: ["java", "backend", "mid-level", "microservices"],
      last_activity: "2024-01-15T10:00:00Z",
      created_at: "2024-01-15T00:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
    },
  ]

  // Example jobs data
  const jobsData = [
    { id: "job_001", title: "Senior Full Stack Developer" },
    { id: "job_002", title: "Frontend Developer" },
    { id: "job_003", title: "Senior Mobile Developer" },
    { id: "job_004", title: "DevOps Engineer" },
    { id: "job_005", title: "Data Scientist" },
    { id: "job_006", title: "Senior Backend Developer" },
  ]

  // Application status options
  const statusOptions = [
    { value: "applied", label: "Applied" },
    { value: "screening", label: "Screening" },
    { value: "interviewing", label: "Interviewing" },
    { value: "offered", label: "Offered" },
    { value: "hired", label: "Hired" },
    { value: "rejected", label: "Rejected" },
  ]

  useEffect(() => {
    if (jobId) {
      setSelectedJobFilter(jobId)
    }
  }, [jobId])

  const filteredCandidates = candidatesData.filter((candidate) => {
    const matchesSearch =
      candidate.personal_info.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.personal_info.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesJob =
      selectedJobFilter === "_all" ||
      !selectedJobFilter ||
      candidate.applications.some((app) => app.job_id === selectedJobFilter)

    const matchesStatus =
      selectedStatusFilter === "_all" ||
      !selectedStatusFilter ||
      candidate.applications.some((app) => app.application_status === selectedStatusFilter)

    return matchesSearch && matchesJob && matchesStatus
  })

  const handleViewProfile = (candidateId: string) => {
    router.push(`/dashboard/candidates/${candidateId}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "screening":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "interviewing":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "offered":
        return "bg-green-100 text-green-800 border-green-200"
      case "hired":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getCandidateStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "hired":
        return "bg-blue-100 text-blue-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "blacklisted":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-700"
    if (score >= 80) return "text-blue-700"
    if (score >= 70) return "text-yellow-700"
    if (score >= 60) return "text-orange-700"
    return "text-red-700"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
          <p className="text-muted-foreground">View and manage all candidates in your recruitment pipeline</p>
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search candidates..."
                className="w-full pl-8 rounded-md border border-input bg-transparent px-3 py-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>

            <Select value={selectedJobFilter} onValueChange={setSelectedJobFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Jobs</SelectItem>
                {jobsData.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatusFilter} onValueChange={setSelectedStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Statuses</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-6">
          {filteredCandidates.map((candidate) => (
            <Card key={candidate.id} className="border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              {/* Avatar and Basic Info */}
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14 border border-gray-200">
                 
                  <AvatarFallback className="text-sm font-medium bg-gray-100 text-gray-700">
                    {candidate.personal_info.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-lg font-medium text-gray-900">{candidate.personal_info.name}</h3>
                  <p className="text-sm text-gray-500">{candidate.personal_info.email}</p>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs font-normal ${getCandidateStatusColor(candidate.candidate_status)}`}>
                      {candidate.candidate_status}
                    </Badge>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{candidate.source}</span>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Briefcase className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Experience</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{candidate.resume_analysis.experience_years}y</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {candidate.resume_analysis.experience_level}
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Location</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700">{candidate.personal_info.location}</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Star className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Score</span>
                  </div>
                  <p className={`text-lg font-semibold ${getScoreColor(candidate.resume_analysis.overall_score)}`}>
                    {candidate.resume_analysis.overall_score}%
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <User className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Applications</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{candidate.total_applications}</p>
                </div>
              </div>

              {/* Applications Status & Actions */}
              <div className="space-y-3 lg:min-w-[180px] item-center justify-center flex flex-col">
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {candidate.applications.map((app, index) => (
                    <Badge key={index} className={`text-xs font-normal ${getStatusColor(app.application_status)}`}>
                      {app.application_status}
                    </Badge>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewProfile(candidate.id)}
                  className="w-full flex justify-center h-8 text-gray-600 hover:text-gray-900 hover:bg-gray-50 group"
                >
                  <span className="text-xs font-medium">View Profile</span>
                  {/* <ArrowRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" /> */}
                </Button>
              </div>
            </div>

            {/* Footer Information */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Last activity {new Date(candidate.last_activity).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>Added {new Date(candidate.created_at).toLocaleDateString()}</span>
                  <span>ID {candidate.id}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
          ))}

          {filteredCandidates.length === 0 && (
            <Card className="border shadow-sm">
              <CardContent className="text-center py-12">
                <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Candidates Found</h3>
                <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
