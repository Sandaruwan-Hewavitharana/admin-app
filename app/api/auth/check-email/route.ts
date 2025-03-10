import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Add timeout and retry logic
    let retries = 3
    let user = null

    while (retries > 0) {
      try {
        user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            username: true,
            email: true
          }
        })
        break
      } catch (error) {
        retries--
        if (retries === 0) throw error
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return NextResponse.json({ exists: !!user })
  } catch (error) {
    console.error("Check email error:", error)
    return NextResponse.json(
      { error: "Error checking email. Please try again." },
      { status: 500 }
    )
  }
} 