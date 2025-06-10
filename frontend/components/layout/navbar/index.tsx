"use client"

import { BriefcaseIcon, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"
import { UserMenu } from "./user-menu"
import { useAuth } from "@/lib/context/auth-context"
import Link from "next/link"

function SuperAdminButton() {
  const { user } = useAuth()

  if (!user || user.email !== "harshitsrv2004@gmail.com") {
    return null
  }

  return (
    <Link href="/dashboard/super-admin">
      <Button
        variant="outline"
        size="sm"
        className="relative z-10 bg-red-500/10 border-red-500/20 text-red-600 hover:bg-red-500/20"
      >
        Super Admin
      </Button>
    </Link>
  )
}

interface TopNavbarProps {
  onOpenSidebar: () => void
}

export function TopNavbar({ onOpenSidebar }: TopNavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 px-4 sm:px-6 shadow-sm relative overflow-hidden">
      {/* Enhanced glass effect with layered backgrounds */}
      <div className="absolute inset-0 glass-navbar backdrop-blur-md"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"></div>

      {/* Subtle animated particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 h-1 w-1 rounded-full bg-primary/20 animate-pulse"></div>
        <div className="absolute top-3/4 left-1/3 h-1 w-1 rounded-full bg-primary/20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-2/3 h-1 w-1 rounded-full bg-primary/20 animate-pulse animation-delay-4000"></div>
      </div>

      <Button variant="ghost" size="icon" className="md:hidden relative z-10" onClick={onOpenSidebar}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      <div className="flex items-center gap-2 relative z-10">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-sm"></div>
          <BriefcaseIcon className="h-6 w-6 relative" />
        </div>
        <span className="font-semibold">TalentHub</span>
      </div>

      {/* Super Admin Button - Only visible for super admin */}
      <SuperAdminButton />
      {/* <SearchBar/> */}
      <div className="ml-auto flex items-center gap-4 relative z-10">
        {/* <NotificationsMenu /> */}
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  )
}
