"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  CreditCard, 
  Users, 
  Package, 
  Plus,
  Edit,
  Trash,
  MoreHorizontal,
  Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PlanDialog } from "@/components/dialogs/plan-dialog"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { toast } from "sonner"
import { DropdownMenuTrigger,DropdownMenu,DropdownMenuItem,DropdownMenuContent } from "@/components/ui/dropdown-menu"
import { BillingSkeleton } from "@/components/ui/loading-skeleton"

interface Plan {
  id: string
  name: string
  description: string
  price: number
  features: string[]
  isPopular: boolean
  status: string
  stripePriceId?: string
}

interface Subscription {
  id: string
  userId: string
  user: {
    username: string
    email: string
  }
  plan: Plan
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
  stripeSubscriptionId: string
}

export default function BillingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeSubscriptions: 0,
    proPlanUsers: 0
  })
  const [loading, setLoading] = useState(true)
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch plans first
      const plansRes = await fetch('/api/plans')
      console.log('Plans response status:', plansRes.status)
      
      if (!plansRes.ok) {
        const errorData = await plansRes.json()
        console.error('Plans fetch error:', errorData)
        throw new Error(errorData.details || errorData.error || 'Failed to fetch plans')
      }

      const plansData = await plansRes.json()
      console.log('Fetched plans data:', plansData)
      setPlans(plansData)

      // Fetch subscriptions
      const subsRes = await fetch('/api/subscriptions')
      console.log('Subscriptions response status:', subsRes.status)
      
      if (!subsRes.ok) {
        const errorData = await subsRes.json()
        console.error('Subscriptions fetch error:', errorData)
        throw new Error(errorData.details || errorData.error || 'Failed to fetch subscriptions')
      }

      const subsData = await subsRes.json()
      console.log('Fetched subscriptions data:', subsData)
      setSubscriptions(subsData)

      // Calculate stats only if we have data
      if (Array.isArray(subsData)) {
        const activeSubscriptions = subsData.filter((sub: Subscription) => sub.status === 'active')
        const monthlyRevenue = activeSubscriptions.reduce((acc: number, sub: Subscription) => acc + sub.plan.price, 0)
        const proUsers = activeSubscriptions.filter((sub: Subscription) => 
          sub.plan.name.toLowerCase().includes('pro')
        )

        setStats({
          totalRevenue: monthlyRevenue,
          activeSubscriptions: activeSubscriptions.length,
          proPlanUsers: proUsers.length
        })
      }

    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddPlan = async (planData: Omit<Plan, 'id'>) => {
    try {
      console.log('Sending plan data to API:', planData) // Debug log
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(planData)
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.details || data.error || 'Failed to create plan')
      }

      // Immediately update the local state
      setPlans(prevPlans => [...prevPlans, data])
      setIsPlanDialogOpen(false)
      toast.success('Plan created successfully')
    } catch (error) {
      console.error('Error creating plan:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create plan')
    }
  }

  const handleEditPlan = async (planData: Partial<Plan>) => {
    if (!selectedPlan) return

    try {
      console.log('Updating plan:', selectedPlan.id, 'with data:', planData)
      const res = await fetch(`/api/plans/${selectedPlan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData)
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.details || data.error || 'Failed to update plan')
      }

      // Update the local state immediately
      setPlans(prevPlans => 
        prevPlans.map(plan => 
          plan.id === selectedPlan.id ? { ...plan, ...data } : plan
        )
      )
      
      setSelectedPlan(null)
      setIsPlanDialogOpen(false)
      toast.success('Plan updated successfully')
    } catch (error) {
      console.error('Error updating plan:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update plan')
    }
  }

  const handleDeletePlan = async () => {
    if (!planToDelete) return

    try {
      const res = await fetch(`/api/plans/${planToDelete.id}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to delete plan')

      await fetchData()
      setPlanToDelete(null)
      setIsDeleteDialogOpen(false)
      toast.success('Plan deleted successfully')
    } catch (error) {
      console.error('Error deleting plan:', error)
      toast.error('Failed to delete plan')
    }
  }

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <DashboardLayout>
        <BillingSkeleton />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing Management</h1>
          <p className="text-muted-foreground">Manage subscriptions and plans</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Monthly recurring revenue</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
              <p className="text-xs text-muted-foreground">Total active subscriptions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pro Plan Users</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.proPlanUsers}</div>
              <p className="text-xs text-muted-foreground">Users on pro plan</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="subscriptions" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none">
                <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                <TabsTrigger value="plans">Plans</TabsTrigger>
              </TabsList>

              <div className="p-4">
                <TabsContent value="subscriptions" className="mt-0">
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search subscriptions..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead>End Date</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              Loading subscriptions...
                            </TableCell>
                          </TableRow>
                        ) : filteredSubscriptions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              No subscriptions found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredSubscriptions.map((sub) => (
                            <TableRow key={sub.id}>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">{sub.user.username}</span>
                                  <span className="text-sm text-muted-foreground">{sub.user.email}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="capitalize">
                                  {sub.plan.name}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={sub.status === "active" ? "default" : "destructive"}
                                  className="capitalize"
                                >
                                  {sub.status}
                                </Badge>
                              </TableCell>
                              <TableCell>${sub.plan.price.toFixed(2)}</TableCell>
                              <TableCell>{format(new Date(sub.currentPeriodStart), 'MMM dd, yyyy')}</TableCell>
                              <TableCell>{format(new Date(sub.currentPeriodEnd), 'MMM dd, yyyy')}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Change Plan</DropdownMenuItem>
                                    <DropdownMenuItem>View History</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">
                                      Cancel Subscription
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="plans" className="mt-0">
                  <div className="mb-4 flex justify-end">
                    <Button onClick={() => setIsPlanDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Plan
                    </Button>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              Loading plans...
                            </TableCell>
                          </TableRow>
                        ) : plans.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              No plans found
                            </TableCell>
                          </TableRow>
                        ) : (
                          plans.map((plan) => (
                            <TableRow key={plan.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{plan.name}</span>
                                  {plan.isPopular && (
                                    <Badge>Popular</Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{plan.description}</TableCell>
                              <TableCell>${plan.price.toFixed(2)}/mo</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={plan.status === "active" ? "default" : "secondary"}
                                  className="capitalize"
                                >
                                  {plan.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setSelectedPlan(plan)
                                      setIsPlanDialogOpen(true)
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setPlanToDelete(plan)
                                      setIsDeleteDialogOpen(true)
                                    }}
                                    className="text-destructive"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <PlanDialog
        isOpen={isPlanDialogOpen}
        onClose={() => {
          setIsPlanDialogOpen(false)
          setSelectedPlan(null)
        }}
        onSubmit={(planData) => {
          if (selectedPlan) {
            handleEditPlan(planData as Partial<Plan>);
          } else {
            handleAddPlan(planData as Omit<Plan, "id">);
          }
        }}
        plan={selectedPlan || undefined}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the plan
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlan}>
              Delete Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
} 