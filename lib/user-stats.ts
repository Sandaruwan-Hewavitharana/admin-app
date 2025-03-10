import { prisma } from "@/lib/prisma"

export async function getUserStats() {
  try {
    const totalUsers = await prisma.user.count()
    
    // Get new users this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const newUsersThisMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: startOfMonth
        }
      }
    })

    // Get user growth percentage
    const lastMonth = new Date(startOfMonth)
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    
    const lastMonthUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: lastMonth,
          lt: startOfMonth
        }
      }
    })

    const growthRate = lastMonthUsers === 0 
      ? 100 
      : ((newUsersThisMonth - lastMonthUsers) / lastMonthUsers) * 100

    return {
      totalUsers,
      newUsersThisMonth,
      growthRate: Math.round(growthRate * 10) / 10
    }
  } catch (error) {
    console.error('Error getting user stats:', error)
    return {
      totalUsers: 0,
      newUsersThisMonth: 0,
      growthRate: 0
    }
  }
} 