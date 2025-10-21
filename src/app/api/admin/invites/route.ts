import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

function generateInviteCode(): string {
  const words = ['WELCOME', 'JOIN', 'INVITE', 'ACCESS', 'HELLO']
  const word = words[Math.floor(Math.random() * words.length)]
  const year = new Date().getFullYear()
  const random = crypto.randomBytes(2).toString('hex').toUpperCase()
  return `${word}-${year}-${random}`
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication and admin status
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await req.json().catch(() => ({}))
    const expiresInDays = body.expiresInDays || 7

    // Generate unique code
    let code = generateInviteCode()
    let attempts = 0
    const maxAttempts = 10

    // Ensure code is unique
    while (attempts < maxAttempts) {
      const existing = await prisma.inviteCode.findUnique({
        where: { code: code.toUpperCase() }
      })
      
      if (!existing) break
      
      code = generateInviteCode()
      attempts++
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: 'Failed to generate unique code' },
        { status: 500 }
      )
    }

    // Calculate expiration date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    // Create invite code
    const inviteCode = await prisma.inviteCode.create({
      data: {
        code: code.toUpperCase(),
        createdBy: session.user.id!,
        expiresAt,
      }
    })

    return NextResponse.json({
      code: inviteCode.code,
      expiresAt: inviteCode.expiresAt,
      createdAt: inviteCode.createdAt,
    })

  } catch (error) {
    console.error('Generate invite code error:', error)
    return NextResponse.json(
      { error: 'Failed to generate invite code' },
      { status: 500 }
    )
  }
}

// GET all invite codes (admin only)
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const inviteCodes = await prisma.inviteCode.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        users: {
          select: {
            email: true,
            createdAt: true,
          }
        }
      }
    })

    return NextResponse.json({ inviteCodes })

  } catch (error) {
    console.error('Get invite codes error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invite codes' },
      { status: 500 }
    )
  }
}
