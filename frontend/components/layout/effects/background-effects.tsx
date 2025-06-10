"use client"

export function BackgroundEffects() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/40 dark:from-gray-900/40 dark:via-gray-900 dark:to-indigo-950/30 -z-10 fixed"></div>

      {/* Animated gradient orbs */}
      <div className="fixed -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-primary/5 to-purple-300/5 blur-3xl animate-blob opacity-70 -z-10"></div>
      <div className="fixed top-1/2 -right-48 h-96 w-96 rounded-full bg-gradient-to-br from-blue-300/5 to-cyan-300/5 blur-3xl animate-blob animation-delay-2000 opacity-70 -z-10"></div>
      <div className="fixed -bottom-24 left-1/2 h-96 w-96 rounded-full bg-gradient-to-br from-pink-300/5 to-indigo-300/5 blur-3xl animate-blob animation-delay-4000 opacity-70 -z-10"></div>

      {/* Subtle grid pattern overlay */}
      <div className="fixed inset-0 bg-grid-pattern opacity-[0.015] -z-10"></div>
    </>
  )
}
