import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Update a plan
export async function PATCH(
  request: Request,
  { params }: { params: { planId: string } }
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
    console.log('Updating plan:', params.planId, 'with data:', body)

    // Validate the plan exists
    const existingPlan = await prisma.plan.findUnique({
      where: { id: params.planId }
    })

    if (!existingPlan) {
      return new NextResponse(
        JSON.stringify({ error: 'Plan not found' }),
        { status: 404 }
      )
    }

    const plan = await prisma.plan.update({
      where: { id: params.planId },
      data: {
        name: body.name,
        description: body.description,
        price: body.price !== undefined ? Number(body.price) : undefined,
        features: Array.isArray(body.features) ? body.features : undefined,
        isPopular: body.isPopular !== undefined ? Boolean(body.isPopular) : undefined,
        status: body.status,
        stripePriceId: body.stripePriceId
      }
    })

    console.log('Updated plan:', plan)
    return NextResponse.json(plan)
  } catch (error) {
    console.error('Error updating plan:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    )
  }
}

// Delete a plan
export async function DELETE(
  request: Request,
  { params }: { params: { planId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    await prisma.plan.delete({
      where: { id: params.planId }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting plan:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    )
  }
} 