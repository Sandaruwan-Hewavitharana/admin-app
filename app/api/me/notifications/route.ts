import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Get current user's notification settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    let settings = await prisma.notificationSettings.findUnique({
      where: { userId: session.user.id }
    })

    // Create default settings if they don't exist
    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: {
          userId: session.user.id,
          emailNotifications: true,
          pushNotifications: false,
          weeklyDigest: true
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching notification settings:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    )
  }
}

// Update current user's notification settings
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    const body = await request.json()
    const { emailNotifications, pushNotifications, weeklyDigest } = body

    const settings = await prisma.notificationSettings.upsert({
      where: { userId: session.user.id },
      update: {
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(pushNotifications !== undefined && { pushNotifications }),
        ...(weeklyDigest !== undefined && { weeklyDigest }),
      },
      create: {
        userId: session.user.id,
        emailNotifications: emailNotifications ?? true,
        pushNotifications: pushNotifications ?? false,
        weeklyDigest: weeklyDigest ?? true,
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating notification settings:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    )
  }
}
