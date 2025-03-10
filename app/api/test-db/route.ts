import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    const count = await prisma.plan.count()
    console.log('Plan count:', count)
    
    // Get all plans for debugging
    const plans = await prisma.plan.findMany()
    console.log('All plans:', plans)
    
    return NextResponse.json({ 
      success: true, 
      count,
      plans 
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 