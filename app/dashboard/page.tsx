"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DollarSign, Users, ShoppingCart, BarChart, User, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"
import { toast } from "sonner"
import { Bar, BarChart as Chart } from "@tremor/react"
import { DashboardSkeleton } from "@/components/ui/loading-skeleton"

interface DashboardStats {
  totalUsers: number
  totalRevenue: number
  ordersThisMonth: number
  conversionRate: string
  activeSubscriptions: number
}

interface Activity {
  id: string
  type: string
  title: string
  time: string
}

interface ChartData {
  createdAt: string
  _count: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard/stats')
      if (!res.ok) throw new Error('Failed to fetch dashboard data')
      
      const data = await res.json()
      setStats(data.stats)
      setRecentActivity(data.recentActivity)
      setChartData(data.chartData)
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 md:gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your platform metrics</p>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Active platform users
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Similar cards for other stats... */}
        </div>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
          <Card className="lg:col-span-4 overflow-hidden">
            <CardHeader>
              <CardTitle>Subscription Growth</CardTitle>
              <CardDescription>Monthly subscriptions over time</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[300px] w-full overflow-auto">
                <Chart
                  className="min-w-[600px]"
                  data={chartData}
                  index="createdAt"
                  categories={["_count"]}
                  colors={["blue"]}
                  valueFormatter={(value) => `${value} subs`}
                  yAxisWidth={40}
                >
                  <Bar />
                </Chart>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(activity.time).toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

