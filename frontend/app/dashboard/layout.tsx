"use client"

import { useState, Suspense, useEffect } from "react"
import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { TopNavbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { BackgroundEffects } from "@/components/layout/effects/background-effects"
import { useAuth } from "@/lib/context/auth-context"

function PageTransitionLoader() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent overflow-hidden">
      <div className="h-full w-full bg-primary origin-left animate-page-loading"></div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(false)
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return <PageTransitionLoader />
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      {isPageLoading && <PageTransitionLoader />}
      
      <TopNavbar onOpenSidebar={() => setIsSidebarOpen(true)} />

      <div className="flex flex-1">
        <Sidebar isMobile={false} />
        <Sidebar 
          isMobile={true}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main content */}
        <main className="flex-1 relative overflow-auto">
          <BackgroundEffects />

          <Suspense fallback={<>Loading...</>}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="container mx-auto px-2 py-4 sm:px-4 sm:py-6 md:px-6"
            >
              {children}
            </motion.div>
          </Suspense>
        </main>
      </div>
    </div>
  )
}
