import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Get all subscriptions (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    const subscriptions = await prisma.subscription.findMany({
      include: {
        user: {
          select: {
            username: true,
            email: true
          }
        },
        plan: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(subscriptions)
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    )
  }
}

// Create a new subscription
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    const body = await request.json()
    const { planId } = body

    // Get plan details from database
    const plan = await prisma.plan.findUnique({
      where: { id: planId }
    })

    if (!plan?.stripePriceId) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid plan' }),
        { status: 400 }
      )
    }

    // Get or create Stripe customer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    let stripeCustomerId = user?.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user?.email,
        metadata: {
          userId: user?.id
        }
      })
      stripeCustomerId = customer.id

      // Save Stripe customer ID
      await prisma.user.update({
        where: { id: user?.id },
        data: { stripeCustomerId }
      })
    }

    // Create Stripe subscription
    const stripeSubscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: plan.stripePriceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId: session.user.id,
        planId
      }
    })

    // Create subscription in database
    const subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        planId,
        stripeSubscriptionId: stripeSubscription.id,
        status: stripeSubscription.status,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000)
      },
      include: {
        plan: true
      }
    })

    return NextResponse.json({
      subscription,
      clientSecret: (stripeSubscription.latest_invoice as any).payment_intent?.client_secret
    })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    )
  }
}