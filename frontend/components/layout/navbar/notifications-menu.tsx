"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function NotificationsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative group">
          <span className="absolute inset-0 rounded-full bg-primary/10 scale-0 transition-transform duration-200 group-hover:scale-100"></span>
          <Bell className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
          <span className="sr-only">Notifications</span>
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black dark:bg-black text-[10px] font-medium text-white animate-pulse shadow-sm">
            3
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 overflow-hidden glass-dropdown border border-white/20 shadow-[0_10px_40px_-5px_rgba(0,0,0,0.15)]"
        sideOffset={8}
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.015] -z-10"></div>
        <DropdownMenuLabel className="flex items-center justify-between bg-gradient-to-r from-primary/10 to-transparent p-4">
          <span className="font-semibold">Notifications</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
          >
            Mark all as read
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <NotificationsList />
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem className="flex justify-center text-sm text-primary p-3 hover:bg-white/10 dark:hover:bg-white/5 hover:text-primary/80 transition-all duration-200 font-medium">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NotificationsList() {
  const notifications = [
    {
      title: "New application received",
      time: "10m ago",
      description: "Sarah Johnson applied for UI/UX Designer position",
      isNew: true,
    },
    {
      title: "Interview scheduled",
      time: "1h ago",
      description: "Michael Chen for Senior Developer position at 2:00 PM",
      isNew: true,
    },
    {
      title: "Offer accepted",
      time: "3h ago",
      description: "Emily Davis accepted Product Manager offer",
      isNew: false,
    },
  ]

  return (
    <div className="max-h-[300px] overflow-y-auto">
      {notifications.map((notification, index) => (
        <DropdownMenuItem
          key={index}
          className="flex flex-col items-start gap-1 p-4 cursor-default hover:bg-white/10 dark:hover:bg-white/5 transition-colors duration-200 border-l-2 border-transparent hover:border-primary animate-in slide-in-from-right-5 duration-300"
        >
          <div className="flex w-full justify-between">
            <span className="font-medium">{notification.title}</span>
            <span className="text-xs text-muted-foreground">{notification.time}</span>
          </div>
          <p className="text-sm text-muted-foreground">{notification.description}</p>
        </DropdownMenuItem>
      ))}
    </div>
  )
}
