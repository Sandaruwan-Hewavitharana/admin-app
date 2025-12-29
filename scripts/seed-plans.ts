import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Creating sample plans...')

  // Create Free Plan
  const freePlan = await prisma.plan.upsert({
    where: { name: 'Free' },
    update: {},
    create: {
      name: 'Free',
      description: 'Get started with basic features',
      price: 0,
      features: [
        'Basic features',
        'Limited storage',
        'Community support',
        'Access to public resources'
      ],
      isPopular: false,
      status: 'active'
    }
  })

  // Create Pro Plan
  const proPlan = await prisma.plan.upsert({
    where: { name: 'Pro' },
    update: {},
    create: {
      name: 'Pro',
      description: 'Perfect for professionals',
      price: 29,
      features: [
        'All Free features',
        'Unlimited storage',
        'Priority support',
        'Advanced analytics',
        'Custom integrations',
        'API access'
      ],
      isPopular: true,
      status: 'active'
    }
  })

  // Create Enterprise Plan
  const enterprisePlan = await prisma.plan.upsert({
    where: { name: 'Enterprise' },
    update: {},
    create: {
      name: 'Enterprise',
      description: 'For large teams and organizations',
      price: 99,
      features: [
        'All Pro features',
        'Dedicated account manager',
        '24/7 phone support',
        'Custom SLA',
        'Advanced security features',
        'On-premise deployment option',
        'Custom training sessions'
      ],
      isPopular: false,
      status: 'active'
    }
  })

  console.log('✅ Plans created:')
  console.log('   - Free Plan (id:', freePlan.id, ')')
  console.log('   - Pro Plan (id:', proPlan.id, ')')
  console.log('   - Enterprise Plan (id:', enterprisePlan.id, ')')
}

main()
  .catch((e) => {
    console.error('❌ Error creating plans:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
