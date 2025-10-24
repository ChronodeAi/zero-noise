/**
 * Firecrawl Client with Circuit Breaker, Retry Logic, and Anti-Bot Strategies
 *
 * Implements ADR-006 Firecrawl integration with:
 * - Anti-bot evasion (user agent rotation, viewport randomization, realistic headers)
 * - Exponential backoff retry (3 attempts with jitter)
 * - Circuit breaker pattern (disable after 5 failures for 10 minutes)
 * - Timeout handling (5s max)
 * - Structured metadata extraction
 * - Robots.txt compliance (ethical scraping)
 * - Error logging
 */

import { retryWithBackoff } from './retryStrategies'
import {
  enhanceFirecrawlRequest,
  checkRobotsTxt,
  getRandomUserAgent,
  getRandomViewport,
  generateRealisticHeaders
} from './antiBotStrategies'
import {
  updateFirecrawlMetrics,
  recordRetryAttempt,
  recordRobotsTxtCheck
} from './metrics'

interface FirecrawlResponse {
  success: boolean
  data?: {
    metadata?: {
      title?: string
      description?: string
      ogTitle?: string
      ogDescription?: string
      ogImage?: string
      ogSiteName?: string
      language?: string
      sourceURL?: string
    }
    markdown?: string
    html?: string
    screenshot?: string
  }
  error?: string
}

interface CircuitBreakerState {
  failures: number
  lastFailureTime: number
  isOpen: boolean
}

interface DomainDelay {
  lastScrapeTime: number
}

class FirecrawlClient {
  private baseUrl: string
  private apiKey: string
  private enabled: boolean
  private timeout: number
  private circuitBreaker: CircuitBreakerState
  private domainDelays: Map<string, DomainDelay>

  // Circuit breaker config
  private readonly MAX_FAILURES = 5
  private readonly RESET_TIMEOUT_MS = 10 * 60 * 1000 // 10 minutes

  // Anti-bot config - domain delay tracking
  private readonly MIN_DOMAIN_DELAY_MS = 1000 // 1 second between requests to same domain
  private readonly MAX_DOMAIN_DELAY_MS = 3000 // 3 seconds max delay

  constructor() {
    this.baseUrl = process.env.FIRECRAWL_BASE_URL || 'http://localhost:3002'
    this.apiKey = process.env.FIRECRAWL_API_KEY || ''
    this.enabled = process.env.ENABLE_FIRECRAWL !== 'false'
    this.timeout = 5000 // 5 seconds

    this.circuitBreaker = {
      failures: 0,
      lastFailureTime: 0,
      isOpen: false,
    }

    this.domainDelays = new Map()
  }

  /**
   * Check if circuit breaker should reset
   */
  private checkCircuitBreaker(): boolean {
    const now = Date.now()

    // Reset circuit breaker if timeout has passed
    if (
      this.circuitBreaker.isOpen &&
      now - this.circuitBreaker.lastFailureTime > this.RESET_TIMEOUT_MS
    ) {
      console.log('[Firecrawl] Circuit breaker reset - attempting retry')
      this.circuitBreaker.failures = 0
      this.circuitBreaker.isOpen = false
    }

    return !this.circuitBreaker.isOpen
  }

  /**
   * Record a failure and potentially open circuit breaker
   */
  private recordFailure(): void {
    this.circuitBreaker.failures++
    this.circuitBreaker.lastFailureTime = Date.now()

    if (this.circuitBreaker.failures >= this.MAX_FAILURES) {
      this.circuitBreaker.isOpen = true
      console.error(
        `[Firecrawl] Circuit breaker OPEN after ${this.MAX_FAILURES} failures. ` +
          `Will retry in ${this.RESET_TIMEOUT_MS / 1000 / 60} minutes.`
      )
    }

    // Update Prometheus metrics
    updateFirecrawlMetrics(this.circuitBreaker.isOpen, this.circuitBreaker.failures)
  }

  /**
   * Reset circuit breaker on successful request
   */
  private recordSuccess(): void {
    if (this.circuitBreaker.failures > 0) {
      console.log('[Firecrawl] Circuit breaker reset - successful request')
    }
    this.circuitBreaker.failures = 0
    this.circuitBreaker.isOpen = false

    // Update Prometheus metrics
    updateFirecrawlMetrics(this.circuitBreaker.isOpen, this.circuitBreaker.failures)
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname
    } catch {
      return url
    }
  }

  /**
   * Add delay if we recently scraped this domain (prevent rapid-fire scraping)
   * US-4.6: Random delay (1-3s) between consecutive scrapes to same domain
   */
  private async addDomainDelay(url: string): Promise<void> {
    const domain = this.extractDomain(url)
    const now = Date.now()
    const lastScrape = this.domainDelays.get(domain)

    if (lastScrape) {
      const timeSinceLastScrape = now - lastScrape.lastScrapeTime
      const minDelay = this.MIN_DOMAIN_DELAY_MS

      if (timeSinceLastScrape < minDelay) {
        // Add random delay between MIN and MAX to appear more human
        const randomDelay =
          Math.floor(
            Math.random() * (this.MAX_DOMAIN_DELAY_MS - this.MIN_DOMAIN_DELAY_MS + 1)
          ) + this.MIN_DOMAIN_DELAY_MS

        const delayNeeded = Math.max(randomDelay, minDelay - timeSinceLastScrape)
        console.log(`[Firecrawl] Domain delay: waiting ${delayNeeded}ms before scraping ${domain}`)
        await new Promise((resolve) => setTimeout(resolve, delayNeeded))
      }
    }

    // Record this scrape time
    this.domainDelays.set(domain, { lastScrapeTime: Date.now() })
  }

  /**
   * Scrape a single URL using Firecrawl
   *
   * @param url - URL to scrape
   * @returns Firecrawl response or null if disabled/failed
   */
  async scrape(url: string): Promise<FirecrawlResponse | null> {
    // Check if Firecrawl is enabled
    if (!this.enabled) {
      console.log('[Firecrawl] Disabled via ENABLE_FIRECRAWL=false')
      return null
    }

    // Check circuit breaker
    if (!this.checkCircuitBreaker()) {
      console.log('[Firecrawl] Circuit breaker is OPEN - skipping request')
      return null
    }

    // ETHICAL SCRAPING: Check robots.txt before scraping
    try {
      const robotsAllowed = await checkRobotsTxt(url)
      if (!robotsAllowed) {
        console.warn(`[Firecrawl] robots.txt disallows scraping: ${url}`)
        recordRobotsTxtCheck('disallowed')
        return null
      }
      recordRobotsTxtCheck('allowed')
    } catch (error) {
      console.warn('[Firecrawl] robots.txt check failed, proceeding:', error)
      recordRobotsTxtCheck('error')
      // Fail open - continue if robots.txt check fails
    }

    // ANTI-BOT: Add domain delay (prevent rapid-fire scraping)
    await this.addDomainDelay(url)

    // Wrap fetch in retry logic with exponential backoff
    const result = await retryWithBackoff(
      async () => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.timeout)

        try {
          // Base request
          const baseRequest = {
            url,
            formats: ['markdown', 'metadata', 'html'],
            onlyMainContent: true,
            waitFor: 0,
          }

          // Enhance with anti-bot strategies
          const enhancedRequest = enhanceFirecrawlRequest(baseRequest, {
            rotateUserAgents: true,
            randomizeViewport: true,
            randomDelay: { min: 1000, max: 3000 },
          })

          const response = await fetch(`${this.baseUrl}/v1/scrape`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
            },
            body: JSON.stringify(enhancedRequest),
            signal: controller.signal,
          })

          clearTimeout(timeoutId)

          if (!response.ok) {
            const error = await response.text()
            const err: any = new Error(`Firecrawl API error: ${error}`)
            err.status = response.status
            throw err
          }

          const data: FirecrawlResponse = await response.json()
          return data
        } catch (error) {
          clearTimeout(timeoutId)

          // Re-throw with proper error structure for retry logic
          if (error instanceof Error) {
            if (error.name === 'AbortError') {
              const timeoutError: any = new Error('Request timeout')
              timeoutError.code = 'ETIMEDOUT'
              throw timeoutError
            }
          }
          throw error
        }
      },
      {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2,
        jitter: true,
      }
    )

    // Handle retry result
    if (result.success && result.data) {
      this.recordSuccess()
      // Record successful retry (including first attempt)
      recordRetryAttempt('firecrawl', 'success', result.attempts, result.totalDuration)
      return result.data
    } else {
      // Only record circuit breaker failure after all retries exhausted
      this.recordFailure()
      // Record failed retry attempts
      recordRetryAttempt('firecrawl', 'failure', result.attempts, result.totalDuration)

      if (result.error) {
        console.error(`[Firecrawl] All retries failed after ${result.attempts} attempts:`, result.error.message)
      }

      return null
    }
  }

  /**
   * Get circuit breaker status (for monitoring)
   */
  getStatus(): {
    enabled: boolean
    circuitBreakerOpen: boolean
    failures: number
    baseUrl: string
  } {
    return {
      enabled: this.enabled,
      circuitBreakerOpen: this.circuitBreaker.isOpen,
      failures: this.circuitBreaker.failures,
      baseUrl: this.baseUrl,
    }
  }
}

// Singleton instance
let firecrawlClientInstance: FirecrawlClient | null = null

export function getFirecrawlClient(): FirecrawlClient {
  if (!firecrawlClientInstance) {
    firecrawlClientInstance = new FirecrawlClient()
  }
  return firecrawlClientInstance
}

export type { FirecrawlResponse }
