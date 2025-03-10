import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Get a specific subscription
export async function GET(
  request: Request,
  { params }: { params: { subscriptionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id: params.subscriptionId },
      include: {
        plan: true,
        user: {
          select: {
            username: true,
            email: true
          }
        }
      }
    })

    // Check if user has access to this subscription
    if (!subscription || (session.user.role !== 'ADMIN' && subscription.userId !== session.user.id)) {
      return new NextResponse(
        JSON.stringify({ error: 'Subscription not found' }),
        { status: 404 }
      )
    }

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    )
  }
}

// Update subscription (change plan or status)
export async function PATCH(
  request: Request,
  { params }: { params: { subscriptionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    const body = await request.json()
    const { planId, status } = body

    const subscription = await prisma.subscription.findUnique({
      where: { id: params.subscriptionId },
      include: { plan: true }
    })

    if (!subscription) {
      return new NextResponse(
        JSON.stringify({ error: 'Subscription not found' }),
        { status: 404 }
      )
    }

    // If changing plan, update in Stripe first
    if (planId && planId !== subscription.planId) {
      const newPlan = await prisma.plan.findUnique({
        where: { id: planId }
      })

      if (!newPlan?.stripePriceId) {
        return new NextResponse(
          JSON.stringify({ error: 'Invalid plan' }),
          { status: 400 }
        )
      }

      // Update the subscription in Stripe
      await stripe.subscriptions.update(subscription.stripeSubscriptionId!, {
        items: [{
          id: subscription.stripeSubscriptionId!,
          price: newPlan.stripePriceId
        }],
        metadata: {
          planId: planId
        }
      })
    }

    // Update subscription in database
    const updatedSubscription = await prisma.subscription.update({
      where: { id: params.subscriptionId },
      data: {
        planId: planId || undefined,
        status: status || undefined
      },
      include: {
        plan: true,
        user: {
          select: {
            username: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(updatedSubscription)
  } catch (error) {
    console.error('Error updating subscription:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    )
  }
}

// Cancel subscription
export async function DELETE(
  request: Request,
  { params }: { params: { subscriptionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const subscription = await prisma.subscription.findUnique({
      where: { id: params.subscriptionId }
    })

    if (!subscription) {
      return new NextResponse(
        JSON.stringify({ error: 'Subscription not found' }),
        { status: 404 }
      )
    }

    // Check if user has permission to cancel
    if (!session || (session.user.role !== 'ADMIN' && subscription.userId !== session.user.id)) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    // Cancel subscription in Stripe
    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId)
    }

    // Update subscription status in database
    await prisma.subscription.update({
      where: { id: params.subscriptionId },
      data: { status: 'cancelled' }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    )
  }
} 