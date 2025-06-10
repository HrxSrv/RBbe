"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {  useRouter } from "next/navigation"
import {
  Camera,
  Mail,
  Calendar,
  Building,
  Shield,
  BadgeCheck,
  Pencil,
  Save,
  X,
  MapPin,
  Phone,
  Globe,
  Award,
  TrendingUp,
  Users,
  Star,
  ArrowLeft,
} from "lucide-react"
import { useAuth } from "@/lib/context/auth-context"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function ProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState({
    name: user?.name || "",
    title: "Senior Recruiter",
    company: "TalentHub Inc.",
    location: "San Francisco, CA",
    phone: "+1 (555) 123-4567",
    website: "linkedin.com/in/johndoe",
  })

  const stats = [
    { label: "Total Interviews", value: "247", icon: Users },
    { label: "Success Rate", value: "89%", icon: TrendingUp },
    { label: "Candidates Hired", value: "142", icon: Award },
    { label: "Client Rating", value: "4.9", icon: Star },
  ]
const router = useRouter();

  const handleSave = () => {
    // TODO: Implement save functionality
    setIsEditing(false)
  }

  return (
    <div className="container max-w-6xl mx-auto p-6">
         <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-background border rounded-lg p-6">
          <Avatar className="h-20 w-20 border border-gray-200 shadow-sm">
            <AvatarImage
              src={user?.picture || "/placeholder.svg"}
              alt={user?.name || "User"}
              className="object-cover"
            />
            <AvatarFallback className="text-2xl font-bold bg-gray-50 text-gray-600">
              {user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                {isEditing ? (
                  <div className="space-y-3">
                    <Input
                      value={editedUser.name}
                      onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                      className="text-2xl font-bold max-w-md"
                      placeholder="Full Name"
                    />
                    <Input
                      value={editedUser.title}
                      onChange={(e) => setEditedUser({ ...editedUser, title: e.target.value })}
                      className="text-lg max-w-md"
                      placeholder="Job Title"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-gray-900">{editedUser.name}</h1>
                    <p className="text-muted-foreground">{editedUser.title}</p>
                  </>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">Recruiter</Badge>
                  <Badge variant="outline" className="text-gray-600 bg-gray-50">
                    Verified
                  </Badge>
                </div>
              </div>
              <AnimatePresence mode="wait">
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button variant="default" size="sm" onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-md bg-gray-50 flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-gray-600" />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact & Work Details */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Mail className="h-5 w-5 text-gray-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    {isEditing ? (
                      <Input
                        value={editedUser.phone}
                        onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium">{editedUser.phone}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                  <Globe className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    {isEditing ? (
                      <Input
                        value={editedUser.website}
                        onChange={(e) => setEditedUser({ ...editedUser, website: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium text-gray-900 hover:underline cursor-pointer">
                        {editedUser.website}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Building className="h-5 w-5 text-gray-600" />
                Work Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Company</p>
                  {isEditing ? (
                    <Input
                      value={editedUser.company}
                      onChange={(e) => setEditedUser({ ...editedUser, company: e.target.value })}
                    />
                  ) : (
                    <p className="font-medium">{editedUser.company}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Location</p>
                  {isEditing ? (
                    <Input
                      value={editedUser.location}
                      onChange={(e) => setEditedUser({ ...editedUser, location: e.target.value })}
                    />
                  ) : (
                    <p className="font-medium flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {editedUser.location}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Member Since</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {new Date(user?.created_at || Date.now()).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
