"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardSkeleton } from "@/components/ui/loading-skeleton"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { CreditCard, Calendar, DollarSign, User as UserIcon } from "lucide-react"

interface UserStats {
  accountStatus: string
  currentPlan: string
  currentPlanPrice: number
  daysUntilRenewal: number
  accountAge: number
  totalSpent: string
}

interface Subscription {
  id: string
  plan: {
    name: string
    price: number
  }
  status: string
  currentPeriodEnd: string
}

export default function MyAccountPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      fetchData()
    }
  }, [status, session])

  const fetchData = async () => {
    try {
      const [statsRes, subsRes] = await Promise.all([
        fetch('/api/me/stats'),
        fetch('/api/me/subscriptions')
      ])

      if (!statsRes.ok || !subsRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const statsData = await statsRes.json()
      const subsData = await subsRes.json()

      setStats(statsData.stats)
      setSubscription(subsData.find((s: Subscription) => s.status === 'active') || null)
    } catch (error) {
      console.error('Failed to load dashboard:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
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
    redirect("/dashboard")
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back, {session.user.username}!</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Status</CardTitle>
              <UserIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Badge variant="default">{stats?.accountStatus || 'Active'}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Member for {stats?.accountAge || 0} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.currentPlan || 'Free'}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.currentPlanPrice ? `$${stats.currentPlanPrice}/month` : 'No subscription'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Renewal</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.daysUntilRenewal || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.daysUntilRenewal ? 'Days remaining' : 'No active plan'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.totalSpent || '0.00'}</div>
              <p className="text-xs text-muted-foreground">Lifetime</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>
                {subscription ? 'Your current plan' : 'Get started with a plan'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscription ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">{subscription.plan.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">${subscription.plan.price}</p>
                      <p className="text-xs text-muted-foreground">/ month</p>
                    </div>
                  </div>
                  <Link href="/my-account/billing">
                    <Button variant="outline" className="w-full">Manage Billing</Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="font-medium mb-2">No Active Subscription</p>
                  <p className="text-sm text-muted-foreground mb-4">Upgrade to unlock features</p>
                  <Link href="/my-account/billing">
                    <Button>View Plans</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Info</CardTitle>
              <CardDescription>Your profile details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Username</span>
                  <span className="font-medium">{session.user.username}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="font-medium">{session.user.email}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Role</span>
                  <Badge variant="secondary">{session.user.role}</Badge>
                </div>
                <Link href="/my-account/settings" className="block mt-4">
                  <Button variant="outline" className="w-full">Edit Profile</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
