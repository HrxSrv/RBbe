"use client"

import { useState } from "react"
import {
  Calendar,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  FileText,
  Filter,
  Plus,
  Search,
  Settings,
  User,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function GlassDemoPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight gradient-text">Glass UI Components</h1>
        <p className="text-muted-foreground">Explore the beautiful frosted glass UI components</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="glass-card glass-card-hover overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Glass Card</CardTitle>
            <CardDescription>Basic frosted glass card with hover effect</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src="/abstract-geometric-shapes.png" />
                <AvatarFallback>AB</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">Alex Brown</p>
                <p className="text-xs text-muted-foreground">Product Designer</p>
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary">
              <div className="h-full w-3/4 rounded-full bg-primary"></div>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/10 backdrop-blur-sm">
            <Button variant="ghost" size="sm" className="ml-auto gap-1">
              <span>View Details</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="glass-panel overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Glass Panel</CardTitle>
            <CardDescription>More transparent glass panel effect</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-1">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">Upcoming Events</span>
              </div>
              <Badge className="glass-badge">3 New</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 rounded-md p-2 hover:bg-muted/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Team Meeting</p>
                  <p className="text-xs text-muted-foreground">Today, 2:00 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-md p-2 hover:bg-muted/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Interview</p>
                  <p className="text-xs text-muted-foreground">Tomorrow, 10:00 AM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card glass-card-hover overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Glass Form Elements</CardTitle>
            <CardDescription>Form controls with glass effect</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search..." className="pl-8 glass-input" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button className="glass-card">Primary</Button>
              <Button variant="outline" className="glass-card">
                Secondary
              </Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Activity Feed</CardTitle>
            <CardDescription>Recent activity with glass UI</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-4 p-4 hover:bg-muted/10 transition-colors">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={`/abstract-geometric-${i === 3 ? "sculpture" : i === 2 ? "seven" : "shapes"}.png`}
                    />
                    <AvatarFallback>{String.fromCharCode(64 + i)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {i === 1 ? "Alex Brown" : i === 2 ? "Taylor Kim" : "Jordan Patel"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {i === 1 ? "Completed task" : i === 2 ? "Added a comment" : "Uploaded a file"}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {i === 1 ? "2 hours ago" : i === 2 ? "Yesterday" : "3 days ago"}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common tasks with glass UI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="glass-card h-24 flex-col gap-2 glass-card-hover">
                <FileText className="h-6 w-6" />
                <span>New Document</span>
              </Button>
              <Button variant="outline" className="glass-card h-24 flex-col gap-2 glass-card-hover">
                <Download className="h-6 w-6" />
                <span>Download Report</span>
              </Button>
              <Button variant="outline" className="glass-card h-24 flex-col gap-2 glass-card-hover">
                <CreditCard className="h-6 w-6" />
                <span>Billing</span>
              </Button>
              <Button variant="outline" className="glass-card h-24 flex-col gap-2 glass-card-hover">
                <Settings className="h-6 w-6" />
                <span>Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Glass Tabs Example</CardTitle>
              <CardDescription>Tabs with glass effect styling</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="glass-card gap-1">
              <Filter className="h-3.5 w-3.5" />
              <span>Filter</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="glass-card mb-4 p-1">
              <TabsTrigger value="overview" className={activeTab === "overview" ? "glass-badge" : ""}>
                Overview
              </TabsTrigger>
              <TabsTrigger value="analytics" className={activeTab === "analytics" ? "glass-badge" : ""}>
                Analytics
              </TabsTrigger>
              <TabsTrigger value="reports" className={activeTab === "reports" ? "glass-badge" : ""}>
                Reports
              </TabsTrigger>
              <TabsTrigger value="notifications" className={activeTab === "notifications" ? "glass-badge" : ""}>
                Notifications
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {["Total Users", "Active Now", "Revenue", "Conversion"].map((title, i) => (
                  <Card key={i} className="glass-card glass-card-hover">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {i === 0 ? "1,234" : i === 1 ? "573" : i === 2 ? "$12,543" : "24.5%"}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <span className={i === 3 ? "text-red-500" : "text-green-500"}>
                          {i === 3 ? "↓ 2.5%" : "↑ 12.5%"}
                        </span>{" "}
                        from last month
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="analytics">
              <div className="h-[200px] rounded-md glass-panel flex items-center justify-center">
                <p className="text-muted-foreground">Analytics content would appear here</p>
              </div>
            </TabsContent>
            <TabsContent value="reports">
              <div className="h-[200px] rounded-md glass-panel flex items-center justify-center">
                <p className="text-muted-foreground">Reports content would appear here</p>
              </div>
            </TabsContent>
            <TabsContent value="notifications">
              <div className="h-[200px] rounded-md glass-panel flex items-center justify-center">
                <p className="text-muted-foreground">Notifications content would appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t bg-muted/10 backdrop-blur-sm justify-between">
          <Button variant="ghost" size="sm">
            Previous
          </Button>
          <Button variant="ghost" size="sm">
            Next
          </Button>
        </CardFooter>
      </Card>

      <div className="fixed bottom-8 right-8">
        <Button className="glass-card glass-card-hover h-14 w-14 rounded-full shadow-lg">
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}
