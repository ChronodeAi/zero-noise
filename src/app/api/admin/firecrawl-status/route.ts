import { NextResponse } from 'next/server'
import { auth } from '@/auth'

/**
 * GET /api/admin/firecrawl-status
 *
 * Monitor Firecrawl integration health and circuit breaker status
 * Requires admin authentication
 */
export async function GET() {
  try {
    // Check authentication
    const session = await auth()

    if (!session || !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get Firecrawl client status
    const { getFirecrawlClient } = await import('@/lib/firecrawlClient')
    const client = getFirecrawlClient()
    const status = client.getStatus()

    return NextResponse.json({
      firecrawl: status,
      timestamp: new Date().toISOString(),
      environment: {
        baseUrl: process.env.FIRECRAWL_BASE_URL || 'not configured',
        enabled: process.env.ENABLE_FIRECRAWL !== 'false',
        hasApiKey: !!process.env.FIRECRAWL_API_KEY,
      },
    })
  } catch (error) {
    console.error('Firecrawl status check failed:', error)
    return NextResponse.json(
      {
        error: 'Failed to get Firecrawl status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
