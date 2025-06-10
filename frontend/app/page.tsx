"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { LucideBuilding, Sun, Moon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "next-themes"
import { useAuth } from "@/lib/context/auth-context"

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          renderButton: (element: HTMLElement, config: any) => void
          prompt: (callback?: (notification: any) => void) => void
          disableAutoSelect: () => void
          cancel: () => void
        }
      }
    }
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "your-google-client-id"

export default function LoginPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { isAuthenticated, isLoading: authLoading, loginWithGoogle } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const 
  [googleLoaded, setGoogleLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const googleButtonRef = useRef<HTMLDivElement>(null)
  const scriptLoaded = useRef(false)
  const initializationAttempted = useRef(false)
  const redirectHandled = useRef(false)
  const searchParams = useSearchParams()

  // Redirect if already authenticated - but only after auth loading is complete
  useEffect(() => {
    if (!authLoading && isAuthenticated && !redirectHandled.current) {
      redirectHandled.current = true
      router.push('/dashboard')
    }
  }, [isAuthenticated, authLoading, router])

  // Load Google script only if not authenticated
  useEffect(() => {
    if (scriptLoaded.current || isAuthenticated || authLoading) return

    const loadGoogleScript = () => {
      const script = document.createElement("script")
      script.src = "https://accounts.google.com/gsi/client"
      script.async = true
      script.defer = true
      script.onload = () => {
        console.log("Google script loaded successfully")
        setGoogleLoaded(true)
        // Add a small delay to ensure Google SDK is fully initialized
        setTimeout(() => {
          initializeGoogle()
        }, 100)
      }
      script.onerror = (error) => {
        console.error("Failed to load Google Sign-In script:", error)
        setError("Failed to load Google Sign-In. Please refresh the page.")
      }
      document.head.appendChild(script)
      scriptLoaded.current = true
    }

    loadGoogleScript()

    return () => {
      // Cleanup
      if (window.google && !isAuthenticated) {
        try {
          window.google.accounts.id.cancel()
          window.google.accounts.id.disableAutoSelect()
        } catch (error) {
          console.error("Google cleanup failed:", error)
        }
      }
    }
  }, [isAuthenticated, authLoading])

  const initializeGoogle = () => {
    if (!window.google || !GOOGLE_CLIENT_ID || isAuthenticated || initializationAttempted.current) {
      return
    }

    initializationAttempted.current = true

    try {
      console.log('Initializing Google Sign-In...')

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
        auto_select: false,
        cancel_on_tap_outside: false,
        use_fedcm_for_prompt: true,
        ux_mode: 'popup',
        context: 'signin',
        itp_support: true,
      })

      // Render Google's button if element exists
      if (googleButtonRef.current) {
        try {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: theme === 'dark' ? 'filled_black' : 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          })
          console.log('Google button rendered successfully')
        } catch (renderError) {
          console.error('Failed to render Google button:', renderError)
          setError("Failed to render Google Sign-In button")
        }
      }

      // Don't show One Tap prompt automatically - let user initiate sign-in
      
    } catch (initError) {
      console.error("Google initialization failed:", initError)
      setError("Failed to initialize Google Sign-In")
    }
  }

  const handleGoogleCallback = async (response: { credential: string }) => {
    if (isLoading) return // Prevent multiple simultaneous calls
    
    console.log('Google callback received')
    setIsLoading(true)
    setError(null)
    
    try {
      await loginWithGoogle(response)
      console.log('Login successful, redirecting...')
      router.push('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }
 
  const handleManualGoogleLogin = () => {
    if (!window.google) {
      setError("Google Sign-In not loaded. Please refresh the page.")
      return
    }

    if (isLoading) return // Prevent multiple clicks

    setError(null)
    
    try {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed()) {
          console.log("Manual prompt not displayed:", notification.getNotDisplayedReason())
          setError("Sign-in popup was blocked. Please allow popups and try again.")
        } else if (notification.isSkippedMoment()) {
          console.log("Manual prompt skipped:", notification.getSkippedReason())
        }
      })
    } catch (error) {
      console.error('Manual Google login failed:', error)
      setError("Failed to open Google Sign-In. Please try again.")
    }
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render login form if user is authenticated
  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Theme Toggle Button */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-white/10 backdrop-blur-sm dark:bg-slate-900/10"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-slate-100 to-zinc-100 dark:from-black dark:via-zinc-950 dark:to-slate-950"></div>
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-primary/10 to-zinc-300/10 dark:from-primary/5 dark:to-zinc-600/5 blur-3xl animate-blob"></div>
      <div className="absolute top-1/2 -right-48 h-96 w-96 rounded-full bg-gradient-to-br from-zinc-300/20 to-slate-300/20 dark:from-zinc-700/10 dark:to-slate-700/10 blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-24 left-1/2 h-96 w-96 rounded-full bg-gradient-to-br from-slate-300/10 to-zinc-300/10 dark:from-slate-700/5 dark:to-zinc-700/5 blur-3xl animate-blob animation-delay-4000"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.015] dark:opacity-[0.02]"></div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .bg-grid-pattern {
          background-image:
            linear-gradient(to right, var(--grid-color, rgba(0, 0, 0, 0.05)) 1px, transparent 1px),
            linear-gradient(to bottom, var(--grid-color, rgba(0, 0, 0, 0.05)) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        :global(.dark) .bg-grid-pattern {
          --grid-color: rgba(255, 255, 255, 0.05);
        }
      `}</style>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="w-full max-w-[400px] backdrop-blur-[2px] bg-gradient-to-r from-white to-gray-100 border border-[#eaeaea] dark:bg-[linear-gradient(110deg,#333_0.6%,#222)] dark:border-neutral-600">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-2">
              <div className="rounded-full bg-primary p-2">
                <LucideBuilding className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">TalentHub</CardTitle>
            <CardDescription className="text-center">
              Sign in to manage your recruitment process
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 pt-4">
            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Google's Rendered Button */}
            {googleLoaded && !error && (
              <div className="flex justify-center">
                <div ref={googleButtonRef} className="w-full"></div>
              </div>
            )}
            
            {/* Loading state for Google script */}
            {!googleLoaded && !error && (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-2"></div>
                <span className="text-sm text-muted-foreground">Loading Google Sign-In...</span>
              </div>
            )}
            
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            
            {/* Manual Google Sign-in Button */}
            <Button 
              className="w-full flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-white dark:border-gray-600"
              onClick={handleManualGoogleLogin}
              disabled={isLoading || !googleLoaded}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {isLoading ? "Signing in..." : "Sign in with Google"}
            </Button>

            {/* Debug info - only in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-muted-foreground text-center space-y-1 p-2 bg-muted/20 rounded">
                <p>Google Loaded: {googleLoaded ? '✅' : '❌'}</p>
                <p>Client ID: {GOOGLE_CLIENT_ID ? '✅' : '❌'}</p>
                <p>Auth Loading: {authLoading ? '⏳' : '✅'}</p>
                <p>Authenticated: {isAuthenticated ? '✅' : '❌'}</p>
                {error && <p className="text-destructive">Error: {error}</p>}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <p className="text-xs text-muted-foreground text-center">
              By signing in, you agree to our{" "}
              <a href="/terms" className="underline underline-offset-4 hover:text-primary">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="underline underline-offset-4 hover:text-primary">
                Privacy Policy
              </a>
              .
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

export function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!isLoading) {
      // After auth state is loaded, redirect to appropriate page
      if (isAuthenticated) {
        router.replace('/dashboard')
      } else {
        // If there's a 'from' parameter, preserve it in the redirect
        const from = searchParams.get('from')
        const loginPath = from ? `/login?from=${encodeURIComponent(from)}` : '/login'
        router.replace(loginPath)
      }
    }
  }, [isAuthenticated, isLoading, router, searchParams])

  // Show loading state while checking auth and redirecting
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">Initializing...</p>
      </div>
    </div>
  )
}