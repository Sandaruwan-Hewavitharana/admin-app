import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
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
    const { role } = body

    if (!role || !['ADMIN', 'USER'].includes(role)) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid role' }),
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { id: params.userId },
      data: { role }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating role:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    )
  }
} 