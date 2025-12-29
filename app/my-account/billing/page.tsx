"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, CreditCard, Sparkles, Plus, MoreVertical, Download } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { toast } from "sonner"
import { DashboardSkeleton } from "@/components/ui/loading-skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Plan {
  id: string
  name: string
  description: string
  price: number
  features: string[]
  isPopular: boolean
  stripePriceId: string | null
  status: string
}

interface Subscription {
  id: string
  plan: Plan
  status: string
  currentPeriodEnd: string
  currentPeriodStart: string
}

export default function BillingPage() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [plans, setPlans] = useState<Plan[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly')

  useEffect(() => {
    if (searchParams.get('success')) {
      toast.success('Subscription successful! Your account has been upgraded.')
    }
    if (searchParams.get('canceled')) {
      toast.error('Subscription canceled. You can try again anytime.')
    }
  }, [searchParams])

  useEffect(() => {
    if (status === "authenticated") {
      fetchData()
    }
  }, [status])

  const fetchData = async () => {
    try {
      const [plansRes, subsRes] = await Promise.all([
        fetch('/api/plans'),
        fetch('/api/me/subscriptions')
      ])

      if (!plansRes.ok || !subsRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const plansData = await plansRes.json()
      const subsData = await subsRes.json()

      setPlans(plansData.filter((p: Plan) => p.status === 'active'))
      setSubscriptions(subsData.filter((s: Subscription) => s.status === 'active'))
    } catch (error) {
      console.error('Failed to load billing data:', error)
      toast.error('Failed to load subscription data')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planId: string) => {
    setProcessing(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingCycle })
      })

      if (!res.ok) throw new Error('Failed to create checkout')

      const { url } = await res.json()
      window.location.href = url
    } catch (error) {
      toast.error('Failed to start checkout')
      setProcessing(false)
    }
  }

  const calculateAnnualPrice = (monthlyPrice: number) => {
    return (monthlyPrice * 12 * 0.8).toFixed(2) // 20% discount
  }

  if (status === "loading" || loading) {
    return (
      <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>
    )
  }

  if (!session) {
    redirect("/login")
  }

  if (session.user.role === "ADMIN") {
    redirect("/billing")
  }

  const hasActiveSubscription = subscriptions.length > 0

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Billing & Plans</h1>
          <p className="text-muted-foreground">
            Manage your subscription and billing information
          </p>
        </div>

        {/* Current Subscriptions */}
        {hasActiveSubscription && (
          <Card>
            <CardHeader>
              <CardTitle>Active Subscriptions</CardTitle>
              <CardDescription>Your current active plans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscriptions.map((sub) => (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <CreditCard className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{sub.plan.name}</h3>
                        <p className="text-sm text-muted-foreground">{sub.plan.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Renews on {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">${sub.plan.price}</p>
                      <p className="text-sm text-muted-foreground">per month</p>
                      <Badge variant="default" className="mt-2">
                        {sub.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center">
          <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as 'monthly' | 'annually')} className="w-auto">
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="annually">
                Annually
                <Badge variant="secondary" className="ml-2 text-xs">Save 20%</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Available Plans */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const displayPrice = billingCycle === 'monthly' 
              ? plan.price 
              : parseFloat(calculateAnnualPrice(plan.price))
            
            const isCurrentPlan = subscriptions.some(sub => sub.plan.id === plan.id)

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className={`relative ${plan.isPopular ? 'border-primary shadow-lg' : ''}`}>
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">${displayPrice}</span>
                      <span className="text-muted-foreground">
                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                      </span>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={isCurrentPlan ? "outline" : plan.isPopular ? "default" : "outline"}
                      onClick={() => handleUpgrade(plan.id)}
                        disabled={isCurrentPlan || processing}
                      >
                        {isCurrentPlan ? 'Current Plan' : processing ? 'Processing...' : 'Upgrade to ' + plan.name}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {plans.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Plans Available</h3>
              <p className="text-sm text-muted-foreground text-center">
                Check back later for subscription options
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
