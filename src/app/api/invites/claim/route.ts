import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { inviteCode } = await req.json()
    
    if (!inviteCode) {
      return NextResponse.json(
        { error: 'Invite code required' },
        { status: 400 }
      )
    }

    const code = inviteCode.toUpperCase().trim()

    // Find the invite code
    const invite = await prisma.inviteCode.findUnique({
      where: { code }
    })

    if (!invite) {
      return NextResponse.json(
        { error: 'Invalid invite code' },
        { status: 400 }
      )
    }

    if (new Date() > invite.expiresAt) {
      return NextResponse.json(
        { error: 'Invite code expired' },
        { status: 400 }
      )
    }

    if (invite.claimedBy) {
      return NextResponse.json(
        { error: 'Invite code already used' },
        { status: 400 }
      )
    }

    // Update user to whitelist them and link invite code
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        isWhitelisted: true,
        inviteCodeId: invite.id,
      }
    })

    // Mark invite code as claimed
    await prisma.inviteCode.update({
      where: { id: invite.id },
      data: {
        claimedBy: user.id,
        claimedAt: new Date(),
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Claim invite code error:', error)
    return NextResponse.json(
      { error: 'Failed to claim invite code' },
      { status: 500 }
    )
  }
}
