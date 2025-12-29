import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Get current user's stats and activity
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    // Get user with subscriptions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscriptions: {
          include: {
            plan: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'User not found' }),
        { status: 404 }
      )
    }

    const activeSubscription = user.subscriptions.find(s => s.status === 'active')
    
    // Calculate account age in days
    const accountAge = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Calculate days until renewal
    const daysUntilRenewal = activeSubscription
      ? Math.ceil((activeSubscription.currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0

    // Calculate total spent (sum of all subscription prices)
    const totalSpent = user.subscriptions.reduce((sum, sub) => {
      return sum + (sub.plan.price * Math.ceil(
        (sub.currentPeriodEnd.getTime() - sub.currentPeriodStart.getTime()) / (1000 * 60 * 60 * 24 * 30)
      ))
    }, 0)

    const stats = {
      accountStatus: user.status,
      currentPlan: activeSubscription ? activeSubscription.plan.name : 'Free',
      currentPlanPrice: activeSubscription ? activeSubscription.plan.price : 0,
      daysUntilRenewal,
      accountAge,
      totalSubscriptions: user.subscriptions.length,
      totalSpent: totalSpent.toFixed(2)
    }

    // Recent activity
    const activities = [
      {
        id: '1',
        type: 'login',
        title: 'Logged in',
        description: 'Successfully signed in to your account',
        time: new Date().toISOString()
      }
    ]

    // Add subscription activities
    user.subscriptions.slice(0, 3).forEach((sub, index) => {
      activities.push({
        id: `sub-${index}`,
        type: 'subscription',
        title: `${sub.plan.name} Plan ${sub.status === 'active' ? 'Active' : 'Ended'}`,
        description: `Subscription ${sub.status === 'active' ? 'started' : 'ended'} on ${sub.currentPeriodStart.toLocaleDateString()}`,
        time: sub.currentPeriodStart.toISOString()
      })
    })

    return NextResponse.json({ stats, activities })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    )
  }
}
