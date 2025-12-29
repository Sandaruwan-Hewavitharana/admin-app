import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Creating test regular user...')

  const hashedPassword = await bcrypt.hash('user123', 12)
  
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      username: 'testuser',
      email: 'user@example.com',
      password: hashedPassword,
      role: 'USER',
      status: 'ACTIVE',
    },
  })

  console.log('✅ Regular user created:')
  console.log('   Email: user@example.com')
  console.log('   Password: user123')
  console.log('   Role:', user.role)
}

main()
  .catch((e) => {
    console.error('❌ Error creating user:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
