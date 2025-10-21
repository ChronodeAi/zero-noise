import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await req.json()
    const { isWhitelisted } = body

    if (typeof isWhitelisted !== 'boolean') {
      return NextResponse.json(
        { error: 'isWhitelisted must be a boolean' },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isWhitelisted },
      select: {
        id: true,
        email: true,
        isWhitelisted: true,
      }
    })

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}
