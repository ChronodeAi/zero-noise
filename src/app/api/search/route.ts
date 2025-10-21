import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/search
 * Full-text search across files using PostgreSQL
 * 
 * Story 3: Search Infrastructure
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, limit = 10 } = body
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }
    
    // Perform full-text search using PostgreSQL
    // Search in filename and textContent
    const results = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        "File"."id",
        "File"."cid",
        "File"."filename",
        "File"."size",
        "File"."mimeType",
        "File"."textContent",
        "File"."collectionId",
        "File"."uploadedAt",
        ts_rank(
          to_tsvector('english', COALESCE("File"."textContent", '') || ' ' || "File"."filename"),
          plainto_tsquery('english', $1)
        ) as rank
      FROM "File"
      WHERE 
        to_tsvector('english', COALESCE("File"."textContent", '') || ' ' || "File"."filename")
        @@ plainto_tsquery('english', $1)
      ORDER BY rank DESC
      LIMIT $2
    `, query, limit)
    
    // Format results
    const formattedResults = results.map((result) => ({
      id: result.id,
      cid: result.cid,
      filename: result.filename,
      size: result.size,
      mimeType: result.mimeType,
      collectionId: result.collectionId,
      uploadedAt: result.uploadedAt,
      rank: parseFloat(result.rank),
      snippet: result.textContent?.substring(0, 200) || '',
    }))
    
    return NextResponse.json({
      success: true,
      query,
      results: formattedResults,
      count: formattedResults.length,
    })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      {
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/search
 * API health check
 */
export async function GET() {
  // Count indexed files
  const indexedCount = await prisma.file.count({
    where: { indexed: true },
  })
  
  return NextResponse.json({
    status: 'ok',
    message: 'Full-text search API ready',
    indexedFiles: indexedCount,
    searchEngine: 'PostgreSQL tsvector',
  })
}
