import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Resend } from 'resend'
import { ResetPasswordEmail } from "@/components/emails/reset-password"
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Return success even if user not found for security
      return NextResponse.json({ 
        success: true,
        message: "If an account exists with this email, you will receive a password reset link"
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    // Create reset link
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`

    // Send email using Resend's test domain
    await resend.emails.send({
      from: 'Admin <onboarding@resend.dev>', // Using Resend's test domain
      to: email,
      subject: 'Reset your password',
      react: ResetPasswordEmail({ resetLink }) as React.ReactElement
    })

    return NextResponse.json({ 
      success: true,
      message: "Password reset instructions sent to your email"
    })

  } catch (error) {
    console.error('Password reset request error:', error)
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    )
  }
} 