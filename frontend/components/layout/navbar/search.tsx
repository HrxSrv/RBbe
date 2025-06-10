"use client"

import { useState, useRef } from "react"
import { Search, Clock, User, Briefcase } from "lucide-react"
import { Input } from "@/components/ui/input"

// Sample suggestion data - in a real app, this would come from your backend
const recentSearches = ["Frontend Developer", "Product Manager", "UX Designer", "Remote positions"]

const suggestedCandidates = [
  { name: "Alex Johnson", role: "Senior Frontend Developer", location: "San Francisco" },
  { name: "Samantha Lee", role: "Product Designer", location: "Remote" },
  { name: "Michael Chen", role: "Backend Engineer", location: "New York" },
]

const suggestedJobs = [
  { title: "Senior React Developer", department: "Engineering", location: "Remote" },
  { title: "Product Manager", department: "Product", location: "San Francisco" },
  { title: "UX Researcher", department: "Design", location: "New York" },
]

export function SearchBar() {
  const [searchValue, setSearchValue] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement | null>(null)

  // Filter suggestions based on search input
  const filteredRecentSearches = recentSearches.filter(
    (search) => searchValue && search.toLowerCase().includes(searchValue.toLowerCase()),
  )

  const filteredCandidates = suggestedCandidates.filter(
    (candidate) =>
      searchValue &&
      (candidate.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        candidate.role.toLowerCase().includes(searchValue.toLowerCase())),
  )

  const filteredJobs = suggestedJobs.filter(
    (job) =>
      searchValue &&
      (job.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        job.department.toLowerCase().includes(searchValue.toLowerCase())),
  )

  // Determine if we should show suggestions
  const hasSuggestions = filteredRecentSearches.length > 0 || filteredCandidates.length > 0 || filteredJobs.length > 0

  return (
    <div ref={searchRef} className="hidden md:flex relative mx-auto max-w-xl flex-1 px-8 z-10">
      <div className="absolute left-10 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>
      <Input
        type="search"
        placeholder=""
        value={searchValue}
        onChange={(e) => {
          setSearchValue(e.target.value)
          if (e.target.value) {
            setIsLoading(true)
            setShowSuggestions(true)

            // Simulate API call delay
            const timer = setTimeout(() => {
              setIsLoading(false)
            }, 600)

            return () => clearTimeout(timer)
          } else {
            setShowSuggestions(false)
            setIsLoading(false)
          }
        }}
        onFocus={() => {
          if (searchValue) {
            setShowSuggestions(true)
          }
        }}
        className="pl-16 w-full max-w-xl glass-input typing-cursor transition-all duration-300 focus:shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)]"
      />
      {!searchValue && <span className="typing-text">Search...</span>}

      {/* Search Suggestions Dropdown - Enhanced with glass effects */}
      {showSuggestions && searchValue && (
        <div className="absolute top-full left-8 right-0 mt-1 rounded-md glass-dropdown z-500 overflow-hidden max-h-[300px] overflow-y-auto border border-white/20 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)]">
          {isLoading && (
            <div className="py-3 px-4 flex items-center justify-center border-b border-white/10">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                <span className="text-sm text-muted-foreground">Searching...</span>
              </div>
            </div>
          )}

          {!isLoading && !hasSuggestions && (
            <div className="py-6 text-center text-sm text-muted-foreground">No results found.</div>
          )}

          {filteredRecentSearches.length > 0 && (
            <div className="px-2 pt-2">
              <div className="text-xs font-medium text-muted-foreground px-2 py-1.5">Recent Searches</div>
              <div className="space-y-1">
                {filteredRecentSearches.map((search, index) => (
                  <button
                    key={`recent-${index}`}
                    onClick={() => {
                      setSearchValue(search)
                      setShowSuggestions(false)
                    }}
                    className="flex w-full items-center rounded-md px-2 py-1.5 text-sm hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
                  >
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredCandidates.length > 0 && (
            <div className="px-2 pt-2">
              <div className="text-xs font-medium text-muted-foreground px-2 py-1.5">Candidates</div>
              <div className="space-y-1">
                {filteredCandidates.map((candidate, index) => (
                  <button
                    key={`candidate-${index}`}
                    onClick={() => {
                      setSearchValue(candidate.name)
                      setShowSuggestions(false)
                    }}
                    className="flex w-full items-center rounded-md px-2 py-1.5 text-sm hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
                  >
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col items-start">
                      <span>{candidate.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {candidate.role} • {candidate.location}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredJobs.length > 0 && (
            <div className="px-2 pt-2 pb-2">
              <div className="text-xs font-medium text-muted-foreground px-2 py-1.5">Jobs</div>
              <div className="space-y-1">
                {filteredJobs.map((job, index) => (
                  <button
                    key={`job-${index}`}
                    onClick={() => {
                      setSearchValue(job.title)
                      setShowSuggestions(false)
                    }}
                    className="flex w-full items-center rounded-md px-2 py-1.5 text-sm hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
                  >
                    <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col items-start">
                      <span>{job.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {job.department} • {job.location}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
