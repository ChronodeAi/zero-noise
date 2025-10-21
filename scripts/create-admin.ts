import { prisma } from '../src/lib/prisma'

async function createAdmin() {
  const email = process.argv[2]
  
  if (!email) {
    console.error('Usage: npx tsx scripts/create-admin.ts your@email.com')
    process.exit(1)
  }
  
  try {
    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        provider: 'email',
        isWhitelisted: true,
        isAdmin: true,
        xp: 0,
      },
      update: {
        isWhitelisted: true,
        isAdmin: true,
      },
    })
    
    console.log('✅ Admin user created/updated successfully!')
    console.log(`
📧 Email: ${user.email}
👤 Admin: ${user.isAdmin}
✅ Whitelisted: ${user.isWhitelisted}

You can now sign in at http://localhost:3000/auth/signin
A magic link will be sent to your email.
    `)
  } catch (error) {
    console.error('Error creating admin user:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
