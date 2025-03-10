import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "../../../auth/[...nextauth]/route"
import bcrypt from "bcryptjs"

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.id !== params.userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { currentPassword, newPassword } = await req.json()

    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { password: true }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    const isValid = await bcrypt.compare(currentPassword, user.password!)
    if (!isValid) {
      return new NextResponse("Invalid current password", { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: params.userId },
      data: { password: hashedPassword }
    })

    return new NextResponse("Password updated")
  } catch (error) {
    console.error("[PASSWORD_UPDATE]", error)
    return new NextResponse(
      "Internal error",
      { status: 500 }
    )
  }
} 