"use client"
import { Grip, Plus, X, DollarSign, Calendar } from "lucide-react"
import { useState } from "react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { createJob, type CreateJobData, type JobQuestion } from "@/lib/api/jobs"
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
} from "@/components/ui/alert-dialog"

const jobSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(1, "Location is required"),
  job_type: z.enum(["full_time", "part_time", "contract", "internship"]),
  department: z.string().optional(),
  experience_level: z.enum(["entry", "mid", "senior"]).optional(),
  remote_allowed: z.boolean(),
  requirements: z.array(z.string()),
  questions: z.array(
    z.object({
      question: z.string().min(1, "Question is required"),
      ideal_answer: z.string().min(1, "Ideal answer is required"),
      weight: z.number().min(0.1).max(5),
    }),
  ),
  salary_range: z
    .object({
      min_salary: z.number().optional(),
      max_salary: z.number().optional(),
      currency: z.string(),
    })
    .optional(),
  application_deadline: z.string().optional(),
})

type JobFormData = z.infer<typeof jobSchema>

const steps = [
  { id: 1, name: "Basic Info" },
  { id: 2, name: "Requirements" },
  { id: 3, name: "Questions" },
  { id: 4, name: "Details" },
]

export function CreateJobDialog({
  open,
  onOpenChange,
  onJobCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onJobCreated?: () => void
}) {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showSaveDraftDialog, setShowSaveDraftDialog] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    description: "",
    location: "",
    job_type: "full_time",
    department: "",
    experience_level: undefined,
    remote_allowed: false,
    requirements: [],
    questions: [],
    salary_range: {
      min_salary: undefined,
      max_salary: undefined,
      currency: "USD",
    },
    application_deadline: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = "Job title is required"
      if (!formData.description.trim()) newErrors.description = "Description is required"
      if (formData.description.length < 10) newErrors.description = "Description must be at least 10 characters"
      if (!formData.location.trim()) newErrors.location = "Location is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleClose = () => {
    // Check if form has any data
    const hasData =
      formData.title || formData.description || formData.requirements.length > 0 || formData.questions.length > 0

    if (hasData) {
      setShowSaveDraftDialog(true)
    } else {
      onOpenChange(false)
      resetForm()
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      job_type: "full_time",
      department: "",
      experience_level: undefined,
      remote_allowed: false,
      requirements: [],
      questions: [],
      salary_range: {
        min_salary: undefined,
        max_salary: undefined,
        currency: "USD",
      },
      application_deadline: "",
    })
    setCurrentStep(1)
    setErrors({})
  }

  const handleSaveDraft = async () => {
    await handleSubmit("draft")
    setShowSaveDraftDialog(false)
  }

  const handleDiscardChanges = () => {
    onOpenChange(false)
    resetForm()
    setShowSaveDraftDialog(false)
  }

  const handleSubmit = async (status: "draft" | "active" = "active") => {
    try {
      setLoading(true)

      // Validate required fields for active jobs
      if (status === "active") {
        const result = jobSchema.safeParse(formData)
        if (!result.success) {
          const fieldErrors: Record<string, string> = {}
          result.error.errors.forEach((error) => {
            if (error.path.length > 0) {
              fieldErrors[error.path[0] as string] = error.message
            }
          })
          setErrors(fieldErrors)
          toast({
            title: "Validation Error",
            description: "Please fix the errors before publishing the job.",
            variant: "destructive",
          })
          return
        }
      }

      const jobData: CreateJobData = {
        ...formData,
        status,
        requirements: formData.requirements.filter((req) => req.trim()),
        questions: formData.questions.filter((q) => q.question.trim() && q.ideal_answer.trim()),
        salary_range:
          formData.salary_range?.min_salary || formData.salary_range?.max_salary ? formData.salary_range : undefined,
        application_deadline: formData.application_deadline || undefined,
        department: formData.department || undefined,
      }

      await createJob(jobData)

      toast({
        title: "Success",
        description: `Job ${status === "draft" ? "saved as draft" : "created and published"} successfully!`,
      })

      onOpenChange(false)
      resetForm()
      onJobCreated?.()
    } catch (error: any) {
      console.error("Error creating job:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create job. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addRequirement = () => {
    setFormData((prev) => ({
      ...prev,
      requirements: [...prev.requirements, ""],
    }))
  }

  const removeRequirement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }))
  }

  const updateRequirement = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => (i === index ? value : req)),
    }))
  }

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, { question: "", ideal_answer: "", weight: 1.0 }],
    }))
  }

  const removeQuestion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }))
  }

  const updateQuestion = (index: number, updates: Partial<JobQuestion>) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === index ? { ...q, ...updates } : q)),
    }))
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col gap-4 p-6">
          <DialogHeader className="flex-none">
            <DialogTitle className="text-2xl">Create New Job</DialogTitle>
            <DialogDescription>Fill out the job details in this multi-step form</DialogDescription>
          </DialogHeader>

          {/* Progress Steps */}
          <div className="relative mb-8 mt-2 flex-none">
            <div className="relative flex justify-between">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={cn("flex flex-col items-center gap-2 relative", {
                    "text-primary": currentStep === step.id,
                    "text-muted-foreground": currentStep !== step.id,
                  })}
                >
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "absolute left-[calc(50%+12px)] w-[120px] right-[calc(-50%+12px)] top-4 h-px -translate-y-1/2 bg-border transition-colors duration-200",
                        {
                          "bg-primary": currentStep > step.id,
                        },
                      )}
                    />
                  )}
                  <div
                    className={cn(
                      "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium transition-colors duration-200",
                      {
                        "border-primary bg-primary text-primary-foreground": currentStep === step.id,
                        "border-muted-foreground bg-background": currentStep !== step.id,
                        "border-green-500 bg-green-500 text-white": currentStep > step.id,
                      },
                    )}
                  >
                    {currentStep > step.id ? "✓" : step.id}
                  </div>
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Steps */}
          <div className="flex-1 min-h-0 overflow-y-auto px-1">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Senior Frontend Developer"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter the job description..."
                    className={cn("min-h-[120px]", errors.description ? "border-red-500" : "")}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                  {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      placeholder="e.g., San Francisco, CA"
                      value={formData.location}
                      onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                      className={errors.location ? "border-red-500" : ""}
                    />
                    {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      placeholder="e.g., Engineering"
                      value={formData.department}
                      onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="job_type">Job Type</Label>
                    <Select
                      value={formData.job_type}
                      onValueChange={(value: any) => setFormData((prev) => ({ ...prev, job_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time">Full Time</SelectItem>
                        <SelectItem value="part_time">Part Time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience_level">Experience Level</Label>
                    <Select
                      value={formData.experience_level || ""}
                      onValueChange={(value: any) =>
                        setFormData((prev) => ({ ...prev, experience_level: value || undefined }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level</SelectItem>
                        <SelectItem value="mid">Mid Level</SelectItem>
                        <SelectItem value="senior">Senior Level</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="remote_allowed"
                    checked={formData.remote_allowed}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, remote_allowed: checked }))}
                  />
                  <Label htmlFor="remote_allowed">Remote work allowed</Label>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Job Requirements</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addRequirement}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Requirement
                  </Button>
                </div>
                <div className="space-y-4">
                  {formData.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-center gap-2 rounded-md border p-2">
                      <Grip className="h-5 w-5 text-muted-foreground" />
                      <Input
                        placeholder="Enter requirement"
                        value={requirement}
                        onChange={(e) => updateRequirement(index, e.target.value)}
                      />
                      <Button variant="ghost" size="sm" onClick={() => removeRequirement(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {formData.requirements.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No requirements added yet. Click "Add Requirement" to get started.
                    </p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Screening Questions</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question
                  </Button>
                </div>
                <div className="space-y-6">
                  {formData.questions.map((question, index) => (
                    <div key={index} className="space-y-4 rounded-lg border p-4">
                      <div className="flex justify-between">
                        <Label>Question {index + 1}</Label>
                        <Button variant="ghost" size="sm" onClick={() => removeQuestion(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Enter question"
                        value={question.question}
                        onChange={(e) => updateQuestion(index, { question: e.target.value })}
                      />
                      <div className="space-y-2">
                        <Label>Ideal Answer</Label>
                        <Textarea
                          placeholder="Enter ideal answer"
                          value={question.ideal_answer}
                          onChange={(e) =>
                            updateQuestion(index, {
                              ideal_answer: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Question Weight (0.1 - 5.0)</Label>
                        <Input
                          type="number"
                          min="0.1"
                          max="5.0"
                          step="0.1"
                          value={question.weight}
                          onChange={(e) => updateQuestion(index, { weight: Number.parseFloat(e.target.value) || 1.0 })}
                        />
                      </div>
                    </div>
                  ))}
                  {formData.questions.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No questions added yet. Click "Add Question" to get started.
                    </p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label>Salary Range</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="min_salary">Min Salary</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="min_salary"
                          type="number"
                          placeholder="50000"
                          className="pl-8"
                          value={formData.salary_range?.min_salary || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              salary_range: {
                                ...prev.salary_range,
                                min_salary: e.target.value ? Number.parseInt(e.target.value) : undefined,
                                currency: prev.salary_range?.currency || "USD",
                              },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max_salary">Max Salary</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="max_salary"
                          type="number"
                          placeholder="80000"
                          className="pl-8"
                          value={formData.salary_range?.max_salary || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              salary_range: {
                                ...prev.salary_range,
                                max_salary: e.target.value ? Number.parseInt(e.target.value) : undefined,
                                currency: prev.salary_range?.currency || "USD",
                              },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={formData.salary_range?.currency || "USD"}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            salary_range: {
                              ...prev.salary_range,
                              currency: value,
                            },
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="CAD">CAD</SelectItem>
                          <SelectItem value="AUD">AUD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="application_deadline">Application Deadline</Label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="application_deadline"
                      type="date"
                      className="pl-8"
                      value={formData.application_deadline}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          application_deadline: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 flex-none border-t">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrevious}
              disabled={currentStep === 1 || loading}
              className="min-w-[100px] transition-all duration-200 hover:bg-primary/5"
            >
              Previous
            </Button>

            <div className="flex gap-2">
              {currentStep === 4 && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleSubmit("draft")}
                  disabled={loading}
                  className="min-w-[120px] transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    "Save as Draft"
                  )}
                </Button>
              )}

              <Button
                size="lg"
                onClick={currentStep === 4 ? () => handleSubmit("active") : handleNext}
                disabled={
                  loading || (currentStep === 1 && (!formData.title || !formData.description || !formData.location))
                }
                className="min-w-[100px] transition-all duration-200"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {currentStep === 4 ? "Publishing..." : "Loading..."}
                  </>
                ) : currentStep === 4 ? (
                  "Publish Job"
                ) : (
                  "Next"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Draft Dialog */}
      <AlertDialog open={showSaveDraftDialog} onOpenChange={setShowSaveDraftDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save your progress?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Would you like to save this job as a draft before closing?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscardChanges}>Discard Changes</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveDraft} disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                "Save as Draft"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
