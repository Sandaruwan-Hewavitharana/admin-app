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

    if (!session || (session.user.id !== params.userId && session.user.role !== 'ADMIN')) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    const body = await request.json()
    
    const user = await prisma.user.update({
      where: { id: params.userId },
      data: {
        notificationSettings: {
          upsert: {
            create: body,
            update: body,
          }
        }
      },
      include: {
        notificationSettings: true
      }
    })

    return NextResponse.json(user.notificationSettings)
  } catch (error) {
    console.error('Error updating notifications:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    )
  }
} 