import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    // Get total users
    const totalUsers = await prisma.user.count()

    // Get total revenue from active subscriptions
    const activeSubscriptions = await prisma.subscription.findMany({
      where: { status: 'active' },
      include: { plan: true }
    })
    const totalRevenue = activeSubscriptions.reduce((acc, sub) => acc + sub.plan.price, 0)

    // Get orders (subscriptions) this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const ordersThisMonth = await prisma.subscription.count({
      where: {
        createdAt: { gte: startOfMonth }
      }
    })

    // Calculate conversion rate (subscriptions / total users)
    const conversionRate = totalUsers > 0 
      ? ((activeSubscriptions.length / totalUsers) * 100).toFixed(1)
      : "0.0"

    // Get recent activity
    const recentActivity = await prisma.subscription.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { username: true }
        },
        plan: {
          select: { name: true }
        }
      }
    })

    // Get subscription data for chart
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const subscriptionsByMonth = await prisma.subscription.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: sixMonthsAgo }
      },
      _count: true,
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json({
      stats: {
        totalUsers,
        totalRevenue,
        ordersThisMonth,
        conversionRate,
        activeSubscriptions: activeSubscriptions.length
      },
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        type: 'subscription',
        title: `${activity.user.username} subscribed to ${activity.plan.name}`,
        time: activity.createdAt
      })),
      chartData: subscriptionsByMonth
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    )
  }
} 