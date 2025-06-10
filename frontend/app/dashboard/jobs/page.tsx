"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Filter, MapPin, Plus, Search, Users, Eye, Calendar, DollarSign, Briefcase } from "lucide-react"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreateJobDialog } from "@/components/jobs/create-job-dialog"
import { type Job, getJobs } from "@/lib/api/jobs"
import { useToast } from "@/hooks/use-toast"

export default function JobsPage() {
  const [view, setView] = useState<"grid" | "table">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Add filter state
  const [filters, setFilters] = useState({
    status: "all",
    job_type: "all",
    experience_level: "all",
    remote_allowed: "all",
  })

  // Calculate active filters count
  const activeFilters = Object.values(filters).filter((value) => value !== "all").length

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }))
  }

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      status: "all",
      job_type: "all",
      experience_level: "all",
      remote_allowed: "all",
    })
  }

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      setLoading(true)
      const jobsData = await getJobs()
      setJobs(jobsData)
    } catch (error) {
      console.error("Error fetching jobs:", error)
      toast({
        title: "Error",
        description: "Failed to fetch jobs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const filteredJobs = jobs.filter((job) => {
    // Search query filter
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.department && job.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase())

    // Status filter
    const matchesStatus = filters.status === "all" || job.status === filters.status

    // Job type filter
    const matchesJobType = filters.job_type === "all" || job.job_type === filters.job_type

    // Experience level filter
    const matchesExperienceLevel =
      filters.experience_level === "all" || job.experience_level === filters.experience_level

    // Remote filter
    const matchesRemote =
      filters.remote_allowed === "all" ||
      (filters.remote_allowed === "true" && job.remote_allowed) ||
      (filters.remote_allowed === "false" && !job.remote_allowed)

    return matchesSearch && matchesStatus && matchesJobType && matchesExperienceLevel && matchesRemote
  })

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 transition-all duration-300 ease-in-out">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
        <p className="text-muted-foreground">Manage and track all your current job openings</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-background/80 p-4 rounded-lg border border-border/40 shadow-sm hover:border-border/70 transition-all duration-300">
        <div className="relative w-full max-w-sm group">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
          <Input
            type="search"
            placeholder="Search jobs..."
            className="pl-8 border-border/50 hover:border-primary/50 focus:border-primary transition-colors duration-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hover:bg-primary/10 transition-colors duration-200">
                <Filter className="mr-2 h-4 w-4" />
                Filter
                {activeFilters > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                    {activeFilters}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Filter Jobs</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-2">
                <div className="space-y-2 mb-2">
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                    <SelectTrigger id="status-filter">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 mb-2">
                  <Label htmlFor="job-type-filter">Job Type</Label>
                  <Select value={filters.job_type} onValueChange={(value) => handleFilterChange("job_type", value)}>
                    <SelectTrigger id="job-type-filter">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 mb-2">
                  <Label htmlFor="experience-filter">Experience Level</Label>
                  <Select
                    value={filters.experience_level}
                    onValueChange={(value) => handleFilterChange("experience_level", value)}
                  >
                    <SelectTrigger id="experience-filter">
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remote-filter">Remote Work</Label>
                  <Select
                    value={filters.remote_allowed}
                    onValueChange={(value) => handleFilterChange("remote_allowed", value)}
                  >
                    <SelectTrigger id="remote-filter">
                      <SelectValue placeholder="All Options" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Options</SelectItem>
                      <SelectItem value="true">Remote Allowed</SelectItem>
                      <SelectItem value="false">On-site Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DropdownMenuSeparator />
              <div className="p-2 flex justify-between">
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Reset
                </Button>
                <Button size="sm" onClick={() => document.body.click()}>
                  Apply
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center rounded-md border border-border/50 hover:border-primary/50 transition-colors duration-200">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-r-none"
              onClick={() => setView("grid")}
            >
              Grid
            </Button>
            <Button
              variant={view === "table" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-l-none"
              onClick={() => setView("table")}
            >
              Table
            </Button>
          </div>

          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 transition-colors duration-200"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Add Job</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {view === "grid" ? (
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {filteredJobs.map((job) => (
            <motion.div key={job.id} variants={item}>
              <Card className="h-full overflow-hidden border-border/60 hover:border-primary/50 hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-transparent">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <Badge
                      variant={getStatusColor(job.status)}
                      className="transition-colors duration-200 hover:bg-primary/20"
                    >
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </Badge>
                  </div>
                  <CardDescription>{job.department || "No Department"}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2 space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    {job.location}
                    {job.remote_allowed && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Remote OK
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <Briefcase className="mr-1 h-4 w-4" />
                    {getJobTypeLabel(job.job_type)}
                    {job.experience_level && (
                      <span className="ml-2">
                        • {job.experience_level.charAt(0).toUpperCase() + job.experience_level.slice(1)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <DollarSign className="mr-1 h-4 w-4" />
                    {formatSalary(job.salary_range)}
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Users className="mr-1 h-4 w-4" />
                      {job.application_count} applications
                    </div>
                    <div className="flex items-center">
                      <Eye className="mr-1 h-4 w-4" />
                      {job.view_count} views
                    </div>
                  </div>

                  {job.application_deadline && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-1 h-4 w-4" />
                      Apply by {formatDate(job.application_deadline)}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">Posted {formatDate(job.created_at)}</div>
                </CardContent>
                <CardFooter className="pt-2 bg-muted/30">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full hover:bg-primary/10 hover:text-primary transition-all duration-200"
                    onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="overflow-auto rounded-md border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="min-w-[150px] font-medium">Job Title</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[120px]">Location</TableHead>
                <TableHead className="min-w-[100px]">Type</TableHead>
                <TableHead className="min-w-[100px]">Experience</TableHead>
                <TableHead className="min-w-[100px]">Applications</TableHead>
                <TableHead className="min-w-[100px]">Views</TableHead>
                <TableHead className="min-w-[100px]">Posted</TableHead>
                <TableHead className="min-w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id} className="hover:bg-muted/30 transition-colors duration-200">
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusColor(job.status)}
                      className="transition-colors duration-200 hover:bg-primary/20"
                    >
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {job.location}
                    {job.remote_allowed && (
                      <Badge variant="outline" className="ml-1 text-xs">
                        Remote
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{getJobTypeLabel(job.job_type)}</TableCell>
                  <TableCell>
                    {job.experience_level
                      ? job.experience_level.charAt(0).toUpperCase() + job.experience_level.slice(1)
                      : "-"}
                  </TableCell>
                  <TableCell>{job.application_count}</TableCell>
                  <TableCell>{job.view_count}</TableCell>
                  <TableCell>{formatDate(job.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                      onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateJobDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onJobCreated={fetchJobs} />
    </div>
  )
}
