import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Get current user's subscriptions
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        plan: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(subscriptions)
  } catch (error) {
    console.error('Error fetching user subscriptions:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    )
  }
}
