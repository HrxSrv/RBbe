"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { UserRound, Settings, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
// import { logout } from "@/lib/api/auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/context/auth-context"

export function UserMenu() {
  const router = useRouter()
  const { toast } = useToast()
  const {  logout } = useAuth()
  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full relative group">
          <span className="absolute inset-0 rounded-full bg-primary/10 scale-0 transition-transform duration-200 group-hover:scale-100"></span>
          <Avatar className="h-8 w-8 ring-2 ring-white/10 transition-all duration-200 group-hover:ring-primary/20">
            <AvatarImage src="/abstract-geometric-shapes.png" alt="User" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="glass-dropdown border border-white/20 shadow-[0_10px_40px_-5px_rgba(0,0,0,0.15)]"
      >
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem className="hover:bg-white/10 dark:hover:bg-white/5 transition-colors">
          <Link href="/dashboard/profile" className="flex gap-2"> <UserRound className="mr-2 h-4 w-4" />
          Profile</Link>
        </DropdownMenuItem>
        <Link href="/dashboard/settings">
        <DropdownMenuItem className="hover:bg-white/10 dark:hover:bg-white/5 transition-colors">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator className="bg-white/10" />        
        
        <DropdownMenuItem 
          className="hover:bg-white/10 dark:hover:bg-white/5 transition-colors cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
   
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
