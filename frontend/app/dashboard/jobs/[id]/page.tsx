"use client"

import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Users,
  Eye,
  PencilIcon,
  Trash2Icon,
  Play,
  Pause,
  Archive,
} from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { type Job, getJob, updateJob, deleteJob } from "@/lib/api/jobs"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function JobDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchJob()
  }, [jobId])

  const fetchJob = async () => {
    try {
      setLoading(true)
      const jobData = await getJob(jobId)
      setJob(jobData)
    } catch (error) {
      console.error("Error fetching job:", error)
      toast({
        title: "Error",
        description: "Failed to fetch job details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!job) return

    try {
      setActionLoading(newStatus)
      await updateJob(job.id, { status: newStatus as any })
      setJob({ ...job, status: newStatus as any })
      toast({
        title: "Success",
        description: `Job status updated to ${newStatus}`,
      })
    } catch (error: any) {
      console.error("Error updating job status:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update job status",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async () => {
    if (!job) return

    try {
      setActionLoading("delete")
      await deleteJob(job.id)
      toast({
        title: "Success",
        description: "Job deleted successfully",
      })
      router.push("/dashboard/jobs")
    } catch (error: any) {
      console.error("Error deleting job:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete job",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h1 className="text-2xl font-bold mb-4">Job not found</h1>
        <p className="text-muted-foreground mb-6">The job you are looking for does not exist or has been removed.</p>
        <Button onClick={() => router.push("/dashboard/jobs")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatSalary = (salaryRange: any) => {
    if (!salaryRange || (!salaryRange.min_salary && !salaryRange.max_salary)) {
      return "Not specified"
    }

    const { min_salary, max_salary, currency = "USD" } = salaryRange

    if (min_salary && max_salary) {
      return `${currency} ${min_salary.toLocaleString()} - ${max_salary.toLocaleString()}`
    } else if (min_salary) {
      return `${currency} ${min_salary.toLocaleString()}+`
    } else if (max_salary) {
      return `Up to ${currency} ${max_salary.toLocaleString()}`
    }

    return "Not specified"
  }

  const getJobTypeLabel = (jobType: string) => {
    switch (jobType) {
      case "full_time":
        return "Full Time"
      case "part_time":
        return "Part Time"
      case "contract":
        return "Contract"
      case "internship":
        return "Internship"
      default:
        return jobType
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "draft":
        return "secondary"
      case "paused":
        return "outline"
      case "closed":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/jobs")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>
        <Button
          onClick={() => router.push(`/dashboard/candidates?jobId=${jobId}`)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Users className="mr-2 h-4 w-4" />
          View Applications ({job.application_count})
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <Card className="border-border/60 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">{job.title}</CardTitle>
                <CardDescription className="text-base">{job.department || "No Department Specified"}</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={getStatusColor(job.status)}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </Badge>
                <Badge variant="outline">{getJobTypeLabel(job.job_type)}</Badge>
                {job.remote_allowed && (
                  <Badge variant="outline" className="bg-green-50">
                    Remote Allowed
                  </Badge>
                )}
                {job.experience_level && (
                  <Badge variant="outline">
                    {job.experience_level.charAt(0).toUpperCase() + job.experience_level.slice(1)} Level
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>{formatSalary(job.salary_range)}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span>{getJobTypeLabel(job.job_type)}</span>
                </div>
              </div>
              <div className="space-y-4">
                {job.application_deadline && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Apply by {formatDate(job.application_deadline)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{job.application_count} applications</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>{job.view_count} views</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Posted {formatDate(job.created_at)}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Job Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
            </div>

            {job.requirements.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Requirements</h3>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  {job.requirements.map((requirement, index) => (
                    <li key={index}>{requirement}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.questions.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Screening Questions</h3>
                <div className="space-y-4">
                  {job.questions.map((question, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Question {index + 1}</h4>
                          <Badge variant="outline">Weight: {question.weight}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{question.question}</p>
                        <div className="mt-2">
                          <p className="text-xs font-medium text-muted-foreground">Ideal Answer:</p>
                          <p className="text-sm">{question.ideal_answer}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="flex gap-2 flex-wrap">
                {job.status === "draft" && (
                  <Button
                    onClick={() => handleStatusChange("active")}
                    disabled={actionLoading === "active"}
                    className="flex-1"
                  >
                    {actionLoading === "active" ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Publish Job
                      </>
                    )}
                  </Button>
                )}

                {job.status === "active" && (
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange("paused")}
                    disabled={actionLoading === "paused"}
                  >
                    {actionLoading === "paused" ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                        Pausing...
                      </>
                    ) : (
                      <>
                        <Pause className="mr-2 h-4 w-4" />
                        Pause Job
                      </>
                    )}
                  </Button>
                )}

                {job.status === "paused" && (
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange("active")}
                    disabled={actionLoading === "active"}
                  >
                    {actionLoading === "active" ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                        Resuming...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Resume Job
                      </>
                    )}
                  </Button>
                )}

                {(job.status === "active" || job.status === "paused") && (
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange("closed")}
                    disabled={actionLoading === "closed"}
                  >
                    {actionLoading === "closed" ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                        Closing...
                      </>
                    ) : (
                      <>
                        <Archive className="mr-2 h-4 w-4" />
                        Close Job
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" className="flex-1">
                  <PencilIcon className="mr-2 h-4 w-4" />
                  Edit Job
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex-1">
                      <Trash2Icon className="mr-2 h-4 w-4" />
                      Delete Job
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the job posting and all associated
                        applications.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={actionLoading === "delete"}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {actionLoading === "delete" ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Deleting...
                          </>
                        ) : (
                          "Delete Job"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
