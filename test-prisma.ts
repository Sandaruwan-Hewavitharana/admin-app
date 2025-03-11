import { prisma } from '@/lib/prisma';

async function test() {
  const subs = await prisma.subscription.findMany()
  console.log(subs)
}

test()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
