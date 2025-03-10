import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Get all plans
export async function GET() {
  try {
    // Add debug logging
    console.log('Fetching plans...')

    const plans = await prisma.plan.findMany({
      orderBy: {
        price: 'asc'
      }
    })

    // Log the found plans
    console.log('Found plans:', plans)

    return NextResponse.json(plans)
  } catch (error) {
    console.error('Error fetching plans:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    )
  }
}

// Create a new plan (admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Received plan data:', body) // Debug log

    // Validate required fields
    if (!body.name || !body.description || body.price === undefined) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Validation Error',
          details: 'Name, description, and price are required'
        }),
        { status: 400 }
      )
    }

    const plan = await prisma.plan.create({
      data: {
        name: body.name,
        description: body.description,
        price: Number(body.price),
        features: Array.isArray(body.features) ? body.features : [],
        isPopular: Boolean(body.isPopular),
        stripePriceId: body.stripePriceId || null,
        status: body.status || 'active'
      }
    })

    console.log('Created plan:', plan) // Debug log
    return NextResponse.json(plan)
  } catch (error) {
    console.error('Error creating plan:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    )
  }
} 