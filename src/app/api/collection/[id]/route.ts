import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/collection/[id]
 * Fetch collection metadata and all files
 * 
 * Story 4: Collection Page data fetching
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch collection with all files
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        files: {
          orderBy: {
            uploadedAt: 'asc',
          },
        },
      },
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      collection: {
        id: collection.id,
        createdAt: collection.createdAt,
        fileCount: collection.files.length,
        files: collection.files.map((file) => ({
          id: file.id,
          cid: file.cid,
          filename: file.filename,
          size: file.size,
          mimeType: file.mimeType,
          uploadedAt: file.uploadedAt,
        })),
      },
    })
  } catch (error) {
    console.error('Collection API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch collection',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
