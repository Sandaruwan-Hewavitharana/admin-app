import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "../../auth/[...nextauth]/route"
import bcrypt from "bcryptjs"

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = params.userId

    // Allow both the user themselves and admins to update
    if (!session || (session.user.role !== 'ADMIN' && session.user.id !== userId)) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    const body = await req.json()
    const { username, email, password, role, status } = body

    // Prepare update data
    const updateData: any = {}
    
    if (username) updateData.username = username
    if (email) updateData.email = email // Direct email update without verification
    if (password) {
      updateData.password = await bcrypt.hash(password, 12)
    }
    if (role && session.user.role === 'ADMIN') { // Only admins can update roles
      updateData.role = role
    }
    if (status && session.user.role === 'ADMIN') { // Only admins can update status
      updateData.status = status
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("[USER_UPDATE]", error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    )
  }
}

// Add DELETE method for user deletion
export async function DELETE(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = params.userId

    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    await prisma.user.delete({
      where: { id: userId }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[USER_DELETE]", error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    )
  }
} 