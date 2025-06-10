"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { X } from "lucide-react"
import { NavItems } from "./nav-items"

interface SidebarProps {
  isMobile?: boolean
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isMobile, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  if (isMobile && !isOpen) return null

  const SidebarContent = () => (
    <>
      {/* Enhanced glass effect with layered backgrounds */}
      <div className="absolute inset-0 glass-sidebar backdrop-blur-md"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5"></div>

      {/* Subtle animated particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 h-1 w-1 rounded-full bg-primary/20 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/3 h-1 w-1 rounded-full bg-primary/20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 right-2/3 h-1 w-1 rounded-full bg-primary/20 animate-pulse animation-delay-4000"></div>
      </div>

      {isMobile && (
        <div className="flex h-16 items-center justify-end border-b border-white/10 px-4 relative z-10">
          <X
            className="h-5 w-5 cursor-pointer hover:text-muted-foreground transition-colors"
            onClick={onClose}
            aria-label="Close sidebar"
          />
        </div>
      )}

      <nav className="flex-1 space-y-1 p-4 pt-4 relative z-10">
        <AnimatePresence>
          <NavItems pathname={pathname} />
        </AnimatePresence>
      </nav>
    </>
  )

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 md:hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Mobile Sidebar */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
          className="fixed inset-y-0 left-0 w-64 shadow-lg overflow-hidden"
        >
          <SidebarContent />
        </motion.div>
      </div>
    )
  }

  return (
    <aside className="hidden w-64 flex-col md:flex relative overflow-hidden">
      <SidebarContent />
    </aside>
  )
}
