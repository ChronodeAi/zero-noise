import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateEmbedding } from '@/lib/openai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/search
 * Semantic search across files using vector similarity
 * 
 * Story 3: Semantic Search Infrastructure
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
    
    // Generate embedding for search query
    const queryEmbedding = await generateEmbedding(query)
    
    // Convert embedding array to pgvector format string
    const embeddingString = `[${queryEmbedding.join(',')}]`
    
    // Perform vector similarity search using raw SQL
    // Using cosine distance (1 - cosine similarity)
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
        1 - (embedding <=> $1::vector) as similarity
      FROM "File"
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> $1::vector
      LIMIT $2
    `, embeddingString, limit)
    
    // Format results
    const formattedResults = results.map((result) => ({
      id: result.id,
      cid: result.cid,
      filename: result.filename,
      size: result.size,
      mimeType: result.mimeType,
      collectionId: result.collectionId,
      uploadedAt: result.uploadedAt,
      similarity: parseFloat(result.similarity),
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
    message: 'Semantic search API ready',
    indexedFiles: indexedCount,
    model: 'text-embedding-3-small (1536 dimensions)',
  })
}
