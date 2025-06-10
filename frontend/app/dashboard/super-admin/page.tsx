"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Search, Edit, Trash2, Building2, Mail, Globe, Users, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/context/auth-context"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  type Customer,
  type CustomerCreate,
  type CustomerUpdate,
} from "@/lib/api/customers"

const customerSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  email: z.string().email("Invalid email address"),
  subscription_plan: z.enum(["free", "starter", "professional", "enterprise"]).default("free"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  industry: z.string().optional(),
  company_size: z.string().optional(),
  is_active: z.boolean().default(true),
})

type CustomerFormData = z.infer<typeof customerSchema>

const subscriptionColors = {
  free: "bg-gray-100 text-gray-800",
  starter: "bg-blue-100 text-blue-800",
  professional: "bg-purple-100 text-purple-800",
  enterprise: "bg-gold-100 text-gold-800",
}

export default function SuperAdminDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(null)

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      company_name: "",
      email: "",
      subscription_plan: "free",
      website: "",
      industry: "",
      company_size: "",
      is_active: true,
    },
  })

  useEffect(() => {
    if (!user || user.email !== "harshitsrv2004@gmail.com") {
      return
    }
    loadCustomers()
  }, [user])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const data = await getCustomers()
      setCustomers(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCustomer = async (data: CustomerFormData) => {
    try {
      setIsCreating(true)
      const customerData: CustomerCreate = {
        company_name: data.company_name,
        email: data.email,
        subscription_plan: data.subscription_plan,
        website: data.website || undefined,
        industry: data.industry || undefined,
        company_size: data.company_size || undefined,
      }

      await createCustomer(customerData)
      toast({
        title: "Success",
        description: "Customer created successfully",
      })
      setIsCreateDialogOpen(false)
      form.reset()
      loadCustomers()
    } catch (error) {
      console.error("Create customer error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create customer",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateCustomer = async (data: CustomerFormData) => {
    if (!editingCustomer) return

    try {
      setIsUpdating(true)
      const updateData: CustomerUpdate = {
        company_name: data.company_name,
        email: data.email,
        subscription_plan: data.subscription_plan,
        is_active: data.is_active,
        website: data.website || undefined,
        industry: data.industry || undefined,
        company_size: data.company_size || undefined,
      }

      await updateCustomer(editingCustomer.id, updateData)
      toast({
        title: "Success",
        description: "Customer updated successfully",
      })
      setEditingCustomer(null)
      form.reset()
      loadCustomers()
    } catch (error) {
      console.error("Update customer error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update customer",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      setDeletingCustomerId(customerId)
      await deleteCustomer(customerId)
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      })
      loadCustomers()
    } catch (error) {
      console.error("Delete customer error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete customer",
        variant: "destructive",
      })
    } finally {
      setDeletingCustomerId(null)
    }
  }

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer)
    form.reset({
      company_name: customer.company_name,
      email: customer.email,
      subscription_plan: customer.subscription_plan,
      website: customer.website || "",
      industry: customer.industry || "",
      company_size: customer.company_size || "",
      is_active: customer.is_active,
    })
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.industry?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {user && user.email === "harshitsrv2004@gmail.com" ? (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage all customers and their subscriptions</p>
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Customer</DialogTitle>
                  <DialogDescription>Create a new customer account with their company details.</DialogDescription>
                </DialogHeader>
                <CustomerForm form={form} onSubmit={handleCreateCustomer} isEditing={false} isLoading={isCreating} />
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customers.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customers.filter((c) => c.is_active).length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Enterprise Plans</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {customers.filter((c) => c.subscription_plan === "enterprise").length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Free Plans</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {customers.filter((c) => c.subscription_plan === "free").length}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </motion.div>

          {/* Customers Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle>Customers</CardTitle>
                <CardDescription>Manage all customer accounts and their subscription details.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredCustomers.map((customer) => (
                      <CustomerCard
                        key={customer.id}
                        customer={customer}
                        onEdit={openEditDialog}
                        onDelete={handleDeleteCustomer}
                        isDeleting={deletingCustomerId === customer.id}
                      />
                    ))}
                    {filteredCustomers.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">No customers found.</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Edit Dialog */}
          <Dialog open={!!editingCustomer} onOpenChange={() => setEditingCustomer(null)}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Customer</DialogTitle>
                <DialogDescription>Update customer information and subscription details.</DialogDescription>
              </DialogHeader>
              <CustomerForm form={form} onSubmit={handleUpdateCustomer} isEditing={true} isLoading={isUpdating} />
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
              <CardDescription className="text-center">You don't have permission to access this page.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}
    </div>
  )
}

function CustomerCard({
  customer,
  onEdit,
  onDelete,
  isDeleting,
}: {
  customer: Customer
  onEdit: (customer: Customer) => void
  onDelete: (id: string) => void
  isDeleting?: boolean
}) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{customer.company_name}</h3>
            <Badge variant="secondary" className={subscriptionColors[customer.subscription_plan]}>
              {customer.subscription_plan}
            </Badge>
            {!customer.is_active && <Badge variant="destructive">Inactive</Badge>}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {customer.email}
            </div>
            {customer.website && (
              <div className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {customer.website}
              </div>
            )}
            {customer.industry && <span>{customer.industry}</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(customer)} disabled={isDeleting}>
          <Edit className="h-4 w-4" />
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={isDeleting}>
              {isDeleting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Customer</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {customer.company_name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(customer.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

function CustomerForm({
  form,
  onSubmit,
  isEditing,
  isLoading,
}: {
  form: any
  onSubmit: (data: CustomerFormData) => void
  isEditing: boolean
  isLoading?: boolean
}) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="company_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input placeholder="TechCorp Inc" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="admin@techcorp.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="subscription_plan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subscription Plan</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company_size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Size</FormLabel>
                <FormControl>
                  <Input placeholder="1-10 employees" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input placeholder="https://techcorp.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry</FormLabel>
                <FormControl>
                  <Input placeholder="Technology" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {isEditing && (
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active Status</FormLabel>
                  <div className="text-sm text-muted-foreground">Enable or disable this customer account</div>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
            )}
            {isEditing ? "Update Customer" : "Create Customer"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
