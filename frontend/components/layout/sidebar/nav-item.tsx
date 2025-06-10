"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface NavItemProps {
  href: string
  icon: React.ElementType
  title: string
  isActive: boolean
}

export function NavItem({ href, icon: Icon, title, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all relative overflow-hidden",
        isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {/* Background effects */}
      {isActive && (
        <motion.div
          className="absolute inset-0 bg-primary rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}

      {/* Glass overlay for active items */}
      {isActive && (
        <motion.div
          className="absolute inset-0 bg-white/10 rounded-lg backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}

      {/* Icon with glow effect when active */}
      <div className="relative z-10 flex items-center justify-center">
        {isActive && <div className="absolute inset-0 bg-primary/20 rounded-full blur-sm" />}
        <Icon className="h-4 w-4 transition-transform duration-200" />
      </div>

      <span className="relative z-10">{title}</span>

      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute right-0 h-6 w-1 rounded-l-full bg-primary/80 shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </Link>
  )
}
