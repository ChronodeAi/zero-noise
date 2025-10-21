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
    const { query, limit = 10, userId = null } = body
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }
    
    // Perform full-text search using PostgreSQL
    // For short queries (< 3 chars), use ILIKE pattern matching instead of full-text search
    // because PostgreSQL's english dictionary ignores short words
    const usePatternMatch = query.trim().length < 3
    
    let fileResults: any[]
    
    if (usePatternMatch) {
      // Pattern matching for short queries
      if (userId) {
        fileResults = await prisma.$queryRawUnsafe<any[]>(`
          SELECT 
            "File"."id",
            "File"."cid",
            "File"."filename" as name,
            "File"."size",
            "File"."mimeType" as type,
            "File"."textContent",
            "File"."collectionId",
            "File"."uploadedAt" as created_at,
            'file' as result_type,
            CASE 
              WHEN "File"."filename" ILIKE $1 THEN 1.0
              WHEN "File"."textContent" ILIKE $1 THEN 0.5
              ELSE 0.1
            END as rank
          FROM "File"
          WHERE 
            "File"."uploadedBy" = $3
            AND ("File"."filename" ILIKE $1 OR "File"."textContent" ILIKE $1)
          ORDER BY rank DESC
          LIMIT $2
        `, `%${query}%`, limit, userId)
      } else {
        fileResults = await prisma.$queryRawUnsafe<any[]>(`
          SELECT 
            "File"."id",
            "File"."cid",
            "File"."filename" as name,
            "File"."size",
            "File"."mimeType" as type,
            "File"."textContent",
            "File"."collectionId",
            "File"."uploadedAt" as created_at,
            'file' as result_type,
            CASE 
              WHEN "File"."filename" ILIKE $1 THEN 1.0
              WHEN "File"."textContent" ILIKE $1 THEN 0.5
              ELSE 0.1
            END as rank
          FROM "File"
          WHERE 
            "File"."filename" ILIKE $1
            OR "File"."textContent" ILIKE $1
          ORDER BY rank DESC
          LIMIT $2
        `, `%${query}%`, limit)
      }
    } else {
      // Full-text search for longer queries
      if (userId) {
        fileResults = await prisma.$queryRawUnsafe<any[]>(`
          SELECT 
            "File"."id",
            "File"."cid",
            "File"."filename" as name,
            "File"."size",
            "File"."mimeType" as type,
            "File"."textContent",
            "File"."collectionId",
            "File"."uploadedAt" as created_at,
            'file' as result_type,
            ts_rank(
              to_tsvector('english', COALESCE("File"."textContent", '') || ' ' || "File"."filename"),
              plainto_tsquery('english', $1)
            ) as rank
          FROM "File"
          WHERE 
            "File"."uploadedBy" = $3
            AND to_tsvector('english', COALESCE("File"."textContent", '') || ' ' || "File"."filename")
            @@ plainto_tsquery('english', $1)
          ORDER BY rank DESC
          LIMIT $2
        `, query, limit, userId)
      } else {
        fileResults = await prisma.$queryRawUnsafe<any[]>(`
          SELECT 
            "File"."id",
            "File"."cid",
            "File"."filename" as name,
            "File"."size",
            "File"."mimeType" as type,
            "File"."textContent",
            "File"."collectionId",
            "File"."uploadedAt" as created_at,
            'file' as result_type,
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
      }
    }
    
    let linkResults: any[]
    
    if (usePatternMatch) {
      // Pattern matching for short queries
      linkResults = await prisma.$queryRawUnsafe<any[]>(`
        SELECT 
          "Link"."id",
          "Link"."url" as cid,
          COALESCE("Link"."title", "Link"."url") as name,
          0 as size,
          "Link"."linkType" as type,
          "Link"."description" as "textContent",
          "Link"."collectionId",
          "Link"."createdAt" as created_at,
          'link' as result_type,
          CASE 
            WHEN "Link"."title" ILIKE $1 THEN 1.0
            WHEN "Link"."author" ILIKE $1 THEN 0.9
            WHEN "Link"."description" ILIKE $1 THEN 0.5
            WHEN "Link"."url" ILIKE $1 THEN 0.3
            ELSE 0.1
          END as rank
        FROM "Link"
        WHERE 
          "Link"."title" ILIKE $1
          OR "Link"."author" ILIKE $1
          OR "Link"."description" ILIKE $1
          OR "Link"."url" ILIKE $1
        ORDER BY rank DESC
        LIMIT $2
      `, `%${query}%`, limit)
    } else {
      // Full-text search for longer queries
      linkResults = await prisma.$queryRawUnsafe<any[]>(`
        SELECT 
          "Link"."id",
          "Link"."url" as cid,
          COALESCE("Link"."title", "Link"."url") as name,
          0 as size,
          "Link"."linkType" as type,
          "Link"."description" as "textContent",
          "Link"."collectionId",
          "Link"."createdAt" as created_at,
          'link' as result_type,
          ts_rank(
            to_tsvector('english', COALESCE("Link"."title", '') || ' ' || COALESCE("Link"."author", '') || ' ' || COALESCE("Link"."description", '') || ' ' || "Link"."url"),
            plainto_tsquery('english', $1)
          ) as rank
        FROM "Link"
        WHERE 
          to_tsvector('english', COALESCE("Link"."title", '') || ' ' || COALESCE("Link"."author", '') || ' ' || COALESCE("Link"."description", '') || ' ' || "Link"."url")
          @@ plainto_tsquery('english', $1)
        ORDER BY rank DESC
        LIMIT $2
      `, query, limit)
    }
    
    // Combine and sort results
    const results = [...fileResults, ...linkResults]
      .sort((a, b) => parseFloat(b.rank) - parseFloat(a.rank))
      .slice(0, limit)
    
    // Format results
    const formattedResults = results.map((result) => ({
      id: result.id,
      cid: result.cid,
      filename: result.name,
      size: result.size,
      mimeType: result.type,
      collectionId: result.collectionId,
      uploadedAt: result.created_at,
      resultType: result.result_type,
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
