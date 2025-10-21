import { NextRequest, NextResponse } from 'next/server'
import { scrapeUrl, scrapeUrls, isValidUrl } from '@/lib/urlScraper'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/scrape-url
 * Scrape metadata from one or more URLs
 * 
 * Body: { url: string } or { urls: string[] }
 * 
 * Story 1: URL Scraping Infrastructure
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle single URL
    if (body.url) {
      const url = body.url as string
      
      if (!isValidUrl(url)) {
        return NextResponse.json(
          { error: 'Invalid URL format' },
          { status: 400 }
        )
      }
      
      const metadata = await scrapeUrl(url)
      
      return NextResponse.json({
        success: true,
        metadata,
      })
    }
    
    // Handle multiple URLs
    if (body.urls && Array.isArray(body.urls)) {
      const urls = body.urls as string[]
      
      // Validate all URLs
      const invalidUrls = urls.filter((url) => !isValidUrl(url))
      if (invalidUrls.length > 0) {
        return NextResponse.json(
          {
            error: 'Invalid URL format',
            invalidUrls,
          },
          { status: 400 }
        )
      }
      
      // Limit to 10 URLs at once
      if (urls.length > 10) {
        return NextResponse.json(
          { error: 'Maximum 10 URLs allowed per request' },
          { status: 400 }
        )
      }
      
      const metadataList = await scrapeUrls(urls)
      
      return NextResponse.json({
        success: true,
        metadata: metadataList,
      })
    }
    
    return NextResponse.json(
      { error: 'Missing url or urls parameter' },
      { status: 400 }
    )
  } catch (error) {
    console.error('URL scrape API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to scrape URL',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/scrape-url
 * API health check
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'URL scraping API ready',
    supportedPlatforms: ['YouTube', 'Vimeo', 'Twitter/X', 'Articles', 'Generic URLs'],
  })
}
