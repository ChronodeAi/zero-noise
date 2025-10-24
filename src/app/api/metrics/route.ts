/**
 * Prometheus Metrics Endpoint
 *
 * Exposes metrics in Prometheus format for scraping
 * Format: /api/metrics
 */

import { NextResponse } from 'next/server'
import { register } from '@/lib/metrics'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/metrics
 * Returns Prometheus-formatted metrics
 */
export async function GET() {
  try {
    const metrics = await register.metrics()

    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': register.contentType,
      },
    })
  } catch (error) {
    console.error('Metrics endpoint error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
