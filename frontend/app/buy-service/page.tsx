"use client"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Building, Check, Star, Users, Zap, Shield, ArrowRight, Mail, Phone, Globe } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/context/auth-context"

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "Perfect for small teams getting started",
    features: [
      "Up to 10 job postings",
      "Basic candidate tracking",
      "Email notifications",
      "Standard support",
      "Basic analytics",
    ],
    popular: false,
    color: "from-blue-500 to-blue-600",
  },
  {
    name: "Professional",
    price: "$79",
    period: "/month",
    description: "Ideal for growing companies",
    features: [
      "Unlimited job postings",
      "Advanced candidate tracking",
      "Custom workflows",
      "Priority support",
      "Advanced analytics",
      "Team collaboration",
      "Custom branding",
    ],
    popular: true,
    color: "from-purple-500 to-purple-600",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations with specific needs",
    features: [
      "Everything in Professional",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
      "Advanced security",
      "Custom reporting",
      "API access",
      "White-label solution",
    ],
    popular: false,
    color: "from-emerald-500 to-emerald-600",
  },
]

export default function BuyServicePage() {
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleContactSales = () => {
    window.open("mailto:sales@talenthub.com?subject=Enterprise Plan Inquiry", "_blank")
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="rounded-full bg-primary p-2">
              <Building className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">TalentHub</span>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Signed in as {user.email}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            <span>Access Required</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
            Welcome to TalentHub
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            To access our recruitment platform, you need an active subscription. Choose the plan that best fits your
            hiring needs and get started today.
          </p>

          {user && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 max-w-2xl mx-auto mb-8">
              <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-200">
                <Mail className="h-5 w-5" />
                <span className="font-medium">Account Found:</span>
                <span>{user.email}</span>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-2">
                Your account exists but requires an active subscription to access the dashboard.
              </p>
            </div>
          )}
        </motion.div>

        {/* Pricing Plans */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-8 mb-16"
        >
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                plan.popular ? "ring-2 ring-primary shadow-lg scale-105" : "hover:shadow-lg hover:-translate-y-1"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0">
                  <div className={`bg-gradient-to-r ${plan.color} text-white text-center py-2 text-sm font-medium`}>
                    <Star className="inline h-4 w-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              <CardHeader className={plan.popular ? "pt-12" : ""}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  {plan.popular && <Badge variant="secondary">Recommended</Badge>}
                </div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${plan.popular ? `bg-gradient-to-r ${plan.color} hover:opacity-90` : ""}`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={plan.name === "Enterprise" ? handleContactSales : () => {}}
                >
                  {plan.name === "Enterprise" ? (
                    <>
                      Contact Sales
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid md:grid-cols-3 gap-8 mb-16"
        >
          <div className="text-center">
            <div className="bg-blue-100 dark:bg-blue-900/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
            <p className="text-muted-foreground">
              Work together seamlessly with your hiring team and streamline your recruitment process.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 dark:bg-purple-900/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Zap className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Automation</h3>
            <p className="text-muted-foreground">
              Automate repetitive tasks and focus on what matters most - finding the right talent.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-emerald-100 dark:bg-emerald-900/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Enterprise Security</h3>
            <p className="text-muted-foreground">
              Your data is protected with enterprise-grade security and compliance standards.
            </p>
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Need Help Choosing?</CardTitle>
              <CardDescription>
                Our team is here to help you find the perfect plan for your organization.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>sales@talenthub.com</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>Schedule Demo</span>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
