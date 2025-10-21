import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code: rawCode } = await params
    const code = rawCode.toUpperCase().trim()

    // Find the invite code
    const inviteCode = await prisma.inviteCode.findUnique({
      where: { code },
      include: {
        users: {
          select: { id: true }
        }
      }
    })

    // Code doesn't exist
    if (!inviteCode) {
      return NextResponse.json({
        valid: false,
        message: 'Invite code not found'
      })
    }

    // Code has expired
    if (new Date() > inviteCode.expiresAt) {
      return NextResponse.json({
        valid: false,
        message: 'Invite code has expired'
      })
    }

    // Code has been claimed
    if (inviteCode.claimedBy || inviteCode.users.length > 0) {
      return NextResponse.json({
        valid: false,
        message: 'Invite code has already been used'
      })
    }

    // Code is valid
    return NextResponse.json({
      valid: true,
      message: 'Invite code is valid'
    })

  } catch (error) {
    console.error('Validate invite code error:', error)
    return NextResponse.json(
      { error: 'Failed to validate invite code' },
      { status: 500 }
    )
  }
}
