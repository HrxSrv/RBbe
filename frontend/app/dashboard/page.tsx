"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BriefcaseIcon,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Users2Icon,
  Video,
  UserRound,
  CheckCircle,
  File,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomButton } from "@/components/ui/custom-button";

// Interview type definition
type Interview = {
  id: string;
  name: string;
  role: string;
  time: string;
  date: string;
  type: string;
  round: string;
  avatar: string;
};

export default function DashboardPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newInterviews, setNewInterviews] = useState<Interview[]>([]);
  const [formData, setFormData] = useState({
    candidateName: "",
    position: "frontend",
    date: new Date().toISOString().split("T")[0],
    time: "14:00",
    type: "technical",
  });

  const [showApplications, setShowApplications] = useState(true);
  const [showShortlisted, setShowShortlisted] = useState(true);
  const [showRejected, setShowRejected] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [notes, setNotes] = useState([
    {
      id: 1,
      date: "July 15, 2025",
      content: "Applications increased by 15% this month compared to June.",
    },
    {
      id: 2,
      date: "July 10, 2025",
      content:
        "Rejection rate is higher for backend positions. Need to review requirements.",
    },
    {
      id: 3,
      date: "July 5, 2025",
      content:
        "Shortlisting process improved after implementing new screening questions.",
    },
  ]);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const stats = [
    {
      title: "Active Jobs",
      value: "24",
      description: "4 new this month",
      change: "+12.5%",
      trend: "up",
      icon: BriefcaseIcon,
      color: "bg-blue-500",
    },
    {
      title: "Qualified Candidates",
      value: "156",
      description: "12 new this week",
      change: "+8.3%",
      trend: "up",
      icon: Users2Icon,
      color: "bg-green-500",
    },
    {
      title: "Resume Processed",
      value: "1800",
      description: "300 today",
      change: "+5.2%",
      trend: "down",
      icon: File,
      color: "bg-amber-500",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      title: "New application received",
      description: "Sarah Johnson applied for UI/UX Designer",
      time: "10 minutes ago",
    },
    {
      id: 2,
      title: "Interview scheduled",
      description: "Michael Chen for Senior Developer position",
      time: "1 hour ago",
    },
    {
      id: 3,
      title: "Offer accepted",
      description: "Emily Davis accepted Product Manager offer",
      time: "3 hours ago",
    },
    {
      id: 4,
      title: "New job posted",
      description: "Marketing Specialist position is now live",
      time: "Yesterday",
    },
  ];

  // Default interviews
  const defaultInterviews: Interview[] = [
    {
      id: "1",
      name: "Alex Rivera",
      role: "Frontend Developer",
      time: "2:00 PM",
      date: "Today",
      type: "Technical",
      round: "Round 2",
      avatar: "/abstract-geometric-shapes.png",
    },
    {
      id: "2",
      name: "Taylor Kim",
      role: "Product Designer",
      time: "4:30 PM",
      date: "Today",
      type: "Portfolio",
      round: "Round 1",
      avatar: "/number-two-graphic.png",
    },
    {
      id: "3",
      name: "Jordan Patel",
      role: "Backend Engineer",
      time: "10:00 AM",
      date: "Tomorrow",
      type: "System Design",
      round: "Final",
      avatar: "/abstract-geometric-seven.png",
    },
  ];



  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };


  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const newNoteObj = {
      id: Date.now(),
      date: formattedDate,
      content: newNote.trim(),
    };

    setNotes([newNoteObj, ...notes]);
    setNewNote("");
    setIsNoteDialogOpen(false);

    toast({
      title: "Note Added",
      description: "Your note has been added successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your recruitment activities.
        </p>
      </div>

      <motion.div
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {stats.map((stat, index) => (
          <motion.div key={index} variants={item}>
            <Card className="h-full glass-card glass-card-hover overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div
                  className={`${stat.color} rounded-full p-2 text-white backdrop-blur-sm shadow-sm`}
                >
                  <stat.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div
                    className={`flex items-center gap-1 text-xs font-medium glass-badge px-2 py-0.5 rounded-full ${
                      stat.trend === "up"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-rose-500/10 text-rose-600"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )}
                    <span>{stat.change}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    vs. last month
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Statistics of active applications */}
      <div className="mt-8">
        <div className="border rounded-lg glass-panel p-6">
          <div className="grid   gap-6">
            {/* stats */}
            <div className="md:col-span-3">
              <div className="flex flex-col space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-indigo-500">
                    Statistics of active applications
                  </h2>
                  <div className="flex items-center gap-4">
                    {/* Replace the toggle buttons with state-managed versions */}
                    <div className="flex items-center">
                      <button
                        className={`h-5 w-10 rounded-full transition-colors duration-200 flex items-center ${
                          showApplications
                            ? "bg-blue-500 justify-end"
                            : "bg-gray-300 justify-start"
                        } hover:bg-blue-600`}
                        onClick={() => {
                          setShowApplications(!showApplications);
                          const elems = document.querySelectorAll(".app-bar");
                          elems.forEach((elem) => {
                            elem.style.opacity = showApplications ? "0" : "1";
                          });
                        }}
                      >
                        <div className="h-4 w-4 rounded-full bg-white shadow-sm mx-1"></div>
                      </button>
                      <span
                        className={`ml-1.5 text-xs ${
                          showApplications
                            ? "text-blue-600 font-medium"
                            : "text-gray-600"
                        }`}
                      >
                        Applications
                      </span>
                    </div>
                    <div className="flex items-center">
                      <button
                        className={`h-5 w-10 rounded-full transition-colors duration-200 flex items-center ${
                          showShortlisted
                            ? "bg-amber-400 justify-end"
                            : "bg-gray-300 justify-start"
                        } hover:bg-amber-500`}
                        onClick={() => {
                          setShowShortlisted(!showShortlisted);
                          const elems = document.querySelectorAll(".short-bar");
                          elems.forEach((elem) => {
                            elem.style.opacity = showShortlisted ? "0" : "1";
                          });
                        }}
                      >
                        <div className="h-4 w-4 rounded-full bg-white shadow-sm mx-1"></div>
                      </button>
                      <span
                        className={`ml-1.5 text-xs ${
                          showShortlisted
                            ? "text-amber-600 font-medium"
                            : "text-gray-600"
                        }`}
                      >
                        Shortlisted
                      </span>
                    </div>
                    <div className="flex items-center">
                      <button
                        className={`h-5 w-10 rounded-full transition-colors duration-200 flex items-center ${
                          showRejected
                            ? "bg-orange-500 justify-end"
                            : "bg-gray-300 justify-start"
                        } hover:bg-orange-600`}
                        onClick={() => {
                          setShowRejected(!showRejected);
                          const elems =
                            document.querySelectorAll(".reject-bar");
                          elems.forEach((elem) => {
                            elem.style.opacity = showRejected ? "0" : "1";
                          });
                        }}
                      >
                        <div className="h-4 w-4 rounded-full bg-white shadow-sm mx-1"></div>
                      </button>
                      <span
                        className={`ml-1.5 text-xs ${
                          showRejected
                            ? "text-orange-600 font-medium"
                            : "text-gray-600"
                        }`}
                      >
                        Rejected
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Select
                      value={selectedMonth}
                      onValueChange={setSelectedMonth}
                    >
                      <SelectTrigger className="w-[100px] h-9 rounded-full text-xs">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Months</SelectItem>
                        <SelectItem value="january">January</SelectItem>
                        <SelectItem value="february">February</SelectItem>
                        <SelectItem value="march">March</SelectItem>
                        <SelectItem value="april">April</SelectItem>
                        <SelectItem value="may">May</SelectItem>
                        <SelectItem value="june">June</SelectItem>
                        <SelectItem value="july">July</SelectItem>
                        <SelectItem value="august">August</SelectItem>
                        <SelectItem value="september">September</SelectItem>
                        <SelectItem value="october">October</SelectItem>
                        <SelectItem value="november">November</SelectItem>
                        <SelectItem value="december">December</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="h-[300px] relative">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between">
                    {[100, 80, 60, 40, 20, 0].map((value) => (
                      <div key={value} className="flex items-center h-0">
                        <span className="text-xs text-gray-500 -translate-y-1/2">
                          {value}%
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Horizontal grid lines */}
                  <div className="absolute left-8 right-0 top-0 h-full flex flex-col justify-between">
                    {[100, 80, 60, 40, 20, 0].map((value) => (
                      <div
                        key={value}
                        className="w-full border-t border-gray-200 h-0"
                      ></div>
                    ))}
                  </div>

                  {/* Data visualization */}
                  <div className="absolute left-8 right-0 top-0 bottom-6 flex justify-between">
                    {[
                      {
                        month: "january",
                        label: "Jan",
                        app: [0, 50],
                        short: [55, 72],
                        reject: [80, 95],
                      },
                      {
                        month: "february",
                        label: "Feb",
                        app: [0, 38],
                        short: [45, 74],
                        reject: [80, 110],
                      },
                      {
                        month: "march",
                        label: "Mar",
                        app: [0, 16],
                        short: [22, 62],
                        reject: [70, 80],
                      },
                      {
                        month: "april",
                        label: "Apr",
                        app: [0, 22],
                        short: [30, 64],
                        reject: [70, 85],
                      },
                      {
                        month: "may",
                        label: "May",
                        app: [0, 48],
                        short: [54, 78],
                        reject: [85, 105],
                      },
                      {
                        month: "june",
                        label: "Jun",
                        app: [0, 30],
                        short: [37, 58],
                        reject: [65, 82],
                      },
                      {
                        month: "july",
                        label: "Jul",
                        app: [0, 38],
                        short: [45, 74],
                        reject: [80, 110],
                      },
                      {
                        month: "august",
                        label: "Aug",
                        app: [0, 25],
                        short: [32, 50],
                        reject: [55, 78],
                      },
                      {
                        month: "september",
                        label: "Sep",
                        app: [0, 28],
                        short: [35, 55],
                        reject: [62, 85],
                      },
                      {
                        month: "october",
                        label: "Oct",
                        app: [0, 38],
                        short: [45, 74],
                        reject: [80, 105],
                      },
                      {
                        month: "november",
                        label: "Nov",
                        app: [0, 52],
                        short: [60, 72],
                        reject: [80, 98],
                      },
                      {
                        month: "december",
                        label: "Dec",
                        app: [0, 30],
                        short: [38, 55],
                        reject: [62, 110],
                      },
                    ]
                      .filter(
                        (data) =>
                          selectedMonth === "all" ||
                          data.month === selectedMonth
                      )
                      .map((data, index) => (
                        <div
                          key={index}
                          className="flex flex-col items-center justify-end h-full group"
                          style={{
                            width: selectedMonth === "all" ? "7%" : "100%",
                          }}
                        >
                          {/* Application bar (blue) */}
                          <div className="relative h-full flex items-end justify-center w-2">
                            <div
                              className="app-bar absolute w-2 bg-blue-500 rounded-full transition-opacity duration-300"
                              style={{
                                height: `${data.app[1]}%`,
                                bottom: `${data.app[0]}%`,
                                opacity: showApplications ? 1 : 0,
                              }}
                            ></div>

                            {/* Shortlisted bar (yellow) */}
                            <div
                              className="short-bar absolute w-2 bg-amber-400 rounded-full transition-opacity duration-300"
                              style={{
                                height: `${data.short[1] - data.short[0]}%`,
                                bottom: `${data.short[0]}%`,
                                opacity: showShortlisted ? 1 : 0,
                              }}
                            ></div>

                            {/* Rejected bar (orange) */}
                            <div
                              className="reject-bar absolute w-2 bg-orange-500 rounded-full transition-opacity duration-300"
                              style={{
                                height: `${Math.min(
                                  data.reject[1] - data.reject[0],
                                  100 - data.reject[0]
                                )}%`,
                                bottom: `${data.reject[0]}%`,
                                opacity: showRejected ? 1 : 0,
                              }}
                            ></div>

                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 bg-white border border-gray-200 rounded-md p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-32 -left-16 text-xs z-10">
                              <div className="flex justify-between">
                                <span>Applications:</span>
                                <span className="font-medium">
                                  {data.app[1]}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Shortlisted:</span>
                                <span className="font-medium">
                                  {data.short[1] - data.short[0]}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Rejected:</span>
                                <span className="font-medium">
                                  {data.reject[1] - data.reject[0]}%
                                </span>
                              </div>
                            </div>
                          </div>
                          {selectedMonth !== "all" && (
                            <div className="text-xs text-gray-500 mt-2">
                              {data.label}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>

                  {/* X-axis labels */}
                  {selectedMonth === "all" && (
                    <div className="absolute left-8 right-0 bottom-0 flex justify-between">
                      {[
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ].map((month) => (
                        <div key={month} className="text-xs text-gray-500">
                          {month}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
