import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    const body = await request.json()
    const { planId, billingCycle = 'monthly' } = body

    if (!planId) {
      return new NextResponse(
        JSON.stringify({ error: 'Plan ID is required' }),
        { status: 400 }
      )
    }

    // Get plan details
    const plan = await prisma.plan.findUnique({
      where: { id: planId }
    })

    if (!plan) {
      return new NextResponse(
        JSON.stringify({ error: 'Plan not found' }),
        { status: 404 }
      )
    }

    // Get or create Stripe customer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    let customerId = user?.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email || undefined,
        metadata: {
          userId: session.user.id
        }
      })
      
      customerId = customer.id
      
      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customerId }
      })
    }

    // Calculate price based on billing cycle
    const price = billingCycle === 'annually' 
      ? Math.round(plan.price * 12 * 0.8 * 100) // 20% discount, convert to cents
      : Math.round(plan.price * 100) // Convert to cents

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            recurring: {
              interval: billingCycle === 'annually' ? 'year' : 'month',
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        planId: plan.id,
        userId: session.user.id,
      },
      success_url: `${process.env.NEXTAUTH_URL}/my-account?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/my-account?canceled=true`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Failed to create checkout session' }),
      { status: 500 }
    )
  }
}
