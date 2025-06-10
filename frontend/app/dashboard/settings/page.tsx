"use client"

import { useState } from "react"
import { format } from "date-fns"
import { motion } from "framer-motion"
import {
  Clock,
  Calendar,
  Phone,
  CreditCard,
  Bell,
  Shield,
  ChevronDown,
  Plus,
  X,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export default function SettingsPage() {
  const [timeWindows, setTimeWindows] = useState([
    { start: "09:00", end: "17:00" },
  ])

  const [selectedDays, setSelectedDays] = useState([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ])

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]

  const timezones = [
    "UTC",
    "America/New_York",
    "America/Los_Angeles",
    "Europe/London",
    "Asia/Tokyo",
    "Asia/Dubai",
    "Australia/Sydney",
  ]

  const addTimeWindow = () => {
    setTimeWindows([...timeWindows, { start: "09:00", end: "17:00" }])
  }

  const removeTimeWindow = (index: number) => {
    setTimeWindows(timeWindows.filter((_, i) => i !== index))
  }

  return (
    <div className="container max-w-7xl mx-auto p-6">
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your settings and preferences.
        </p>
      </div>

        {/* Timezone Settings */}
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              Timezone Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Your Timezone</Label>
                <Select defaultValue="America/New_York">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {timezones.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Current time: {format(new Date(), "h:mm a, MMMM do yyyy")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call Time Periods */}
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              Call Time Periods
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {timeWindows.map((window, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="grid gap-2 flex-1">
                    <Label>Time Window {index + 1}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={window.start}
                        onChange={(e) => {
                          const newWindows = [...timeWindows]
                          newWindows[index].start = e.target.value
                          setTimeWindows(newWindows)
                        }}
                      />
                      <span className="text-gray-500">to</span>
                      <Input
                        type="time"
                        value={window.end}
                        onChange={(e) => {
                          const newWindows = [...timeWindows]
                          newWindows[index].end = e.target.value
                          setTimeWindows(newWindows)
                        }}
                      />
                      {index > 0 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTimeWindow(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addTimeWindow}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Time Window
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Available Days</Label>
              <div className="flex flex-wrap gap-2">
                {days.map((day) => (
                  <div key={day} className="flex items-center gap-2">
                    <Checkbox
                      id={day}
                      checked={selectedDays.includes(day)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedDays([...selectedDays, day])
                        } else {
                          setSelectedDays(selectedDays.filter((d) => d !== day))
                        }
                      }}
                    />
                    <label htmlFor={day} className="text-sm cursor-pointer">
                      {day}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call Limits */}
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Phone className="h-5 w-5 text-gray-600" />
              Call Limits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Maximum Calls Per Candidate</Label>
              <Input type="number" defaultValue={3} min={1} max={10} />
              <p className="text-sm text-muted-foreground">
                Set the maximum number of calls allowed per candidate during the
                interview process.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Billing Section */}
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gray-600" />
              Billing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                <div>
                  <p className="text-sm font-medium">Available Credits</p>
                  <p className="text-3xl font-bold mt-1">2,500</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Credits renew on the 1st of each month
                  </p>
                </div>
                <Button>Top Up Credits</Button>
              </div>

              <div className="space-y-2">
                <Label>Usage History</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2">
                    <span className="text-sm">This Month</span>
                    <Badge variant="secondary">500 credits used</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2">
                    <span className="text-sm">Last Month</span>
                    <Badge variant="secondary">1,200 credits used</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Changes Button */}
        <div className="flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  )