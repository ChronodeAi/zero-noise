/**
 * Prometheus Metrics for Zero Noise Scraper
 *
 * Tracks scraping performance, success rates, and system health
 */

import { Counter, Histogram, Gauge, register } from 'prom-client'

// Enable default metrics (CPU, memory, etc.)
// collectDefaultMetrics({ register })

/**
 * Total scraper requests by source and status
 */
export const scraperRequestsTotal = new Counter({
  name: 'scraper_requests_total',
  help: 'Total scraper requests by source and status',
  labelNames: ['source', 'status'],
  registers: [register],
})

/**
 * Scraper request duration in seconds
 */
export const scraperRequestDuration = new Histogram({
  name: 'scraper_request_duration_seconds',
  help: 'Scraper request duration in seconds',
  labelNames: ['source'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  registers: [register],
})

/**
 * Count of generic titles detected by source
 */
export const scraperGenericTitles = new Counter({
  name: 'scraper_generic_titles_total',
  help: 'Count of generic titles (Home, Welcome, etc.) by source',
  labelNames: ['source'],
  registers: [register],
})

/**
 * Firecrawl circuit breaker state (0=closed, 1=open)
 */
export const firecrawlCircuitBreakerState = new Gauge({
  name: 'firecrawl_circuit_breaker_state',
  help: 'Firecrawl circuit breaker state (0=closed, 1=open)',
  registers: [register],
})

/**
 * Firecrawl failure count
 */
export const firecrawlFailures = new Gauge({
  name: 'firecrawl_failures_total',
  help: 'Current Firecrawl failure count',
  registers: [register],
})

/**
 * Retry attempts by final status
 */
export const retryAttemptsTotal = new Counter({
  name: 'retry_attempts_total',
  help: 'Total retry attempts by final status (success/failure)',
  labelNames: ['status', 'source'],
  registers: [register],
})

/**
 * Retry duration in seconds
 */
export const retryDuration = new Histogram({
  name: 'retry_duration_seconds',
  help: 'Total duration including all retry attempts',
  labelNames: ['source'],
  buckets: [1, 2, 5, 10, 20, 30],
  registers: [register],
})

/**
 * Robots.txt check results
 */
export const robotsTxtChecks = new Counter({
  name: 'robots_txt_checks_total',
  help: 'Total robots.txt checks by result (allowed/disallowed/error)',
  labelNames: ['result'],
  registers: [register],
})

/**
 * Schema extraction success rate
 */
export const schemaExtractionTotal = new Counter({
  name: 'schema_extraction_total',
  help: 'Total schema extractions by type (jsonld/microdata/patterns)',
  labelNames: ['type', 'found'],
  registers: [register],
})

/**
 * User agent rotation usage
 */
export const userAgentRotation = new Counter({
  name: 'user_agent_rotation_total',
  help: 'Total user agent rotations by browser type',
  labelNames: ['browser'],
  registers: [register],
})

/**
 * Export Prometheus registry
 */
export { register }

/**
 * Helper: Record scraper request with timing
 */
export function recordScraperRequest(
  source: string,
  status: 'success' | 'failure',
  durationMs: number,
  isGenericTitle: boolean = false
) {
  scraperRequestsTotal.inc({ source, status })
  scraperRequestDuration.observe({ source }, durationMs / 1000)

  if (isGenericTitle) {
    scraperGenericTitles.inc({ source })
  }
}

/**
 * Helper: Record retry attempt
 */
export function recordRetryAttempt(
  source: string,
  status: 'success' | 'failure',
  attempts: number,
  totalDurationMs: number
) {
  retryAttemptsTotal.inc({ status, source }, attempts)
  retryDuration.observe({ source }, totalDurationMs / 1000)
}

/**
 * Helper: Update Firecrawl circuit breaker metrics
 */
export function updateFirecrawlMetrics(isOpen: boolean, failures: number) {
  firecrawlCircuitBreakerState.set(isOpen ? 1 : 0)
  firecrawlFailures.set(failures)
}

/**
 * Helper: Record robots.txt check
 */
export function recordRobotsTxtCheck(result: 'allowed' | 'disallowed' | 'error') {
  robotsTxtChecks.inc({ result })
}

/**
 * Helper: Record schema extraction
 */
export function recordSchemaExtraction(type: 'jsonld' | 'microdata' | 'patterns', found: boolean) {
  schemaExtractionTotal.inc({ type, found: found ? 'true' : 'false' })
}

/**
 * Helper: Record user agent rotation
 */
export function recordUserAgentRotation(browser: 'chrome' | 'firefox' | 'safari') {
  userAgentRotation.inc({ browser })
}
