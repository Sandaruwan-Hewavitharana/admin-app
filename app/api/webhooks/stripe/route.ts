import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new NextResponse('Webhook signature missing', { status: 400 })
  }

  let event: any

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    return new NextResponse('Webhook signature verification failed', { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object
        await prisma.subscription.update({
          where: {
            stripeSubscriptionId: subscription.id
          },
          data: {
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000)
          }
        })
        break

      case 'customer.subscription.deleted':
        await prisma.subscription.update({
          where: {
            stripeSubscriptionId: event.data.object.id
          },
          data: {
            status: 'cancelled'
          }
        })
        break
    }

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return new NextResponse('Webhook handler failed', { status: 500 })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
} 