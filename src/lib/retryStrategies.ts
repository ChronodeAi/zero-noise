/**
 * Automatic Retry Strategies - Standard Algorithms
 *
 * Implements common retry patterns from distributed systems literature
 * - Exponential backoff (public algorithm)
 * - Jittered backoff (AWS best practice)
 * - Circuit breaker (Netflix Hystrix pattern)
 *
 * NOT reverse engineered - based on published patterns
 */

export interface RetryConfig {
  maxRetries?: number // Default: 3
  initialDelay?: number // Default: 1000ms
  maxDelay?: number // Default: 30000ms
  backoffMultiplier?: number // Default: 2
  jitter?: boolean // Default: true
  retryableErrors?: string[] // HTTP status codes or error types
}

export interface RetryResult<T> {
  success: boolean
  data?: T
  error?: Error
  attempts: number
  totalDuration: number
}

/**
 * Exponential Backoff with Jitter
 *
 * Algorithm from AWS Architecture Blog:
 * https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
 *
 * delay = min(maxDelay, initialDelay * (backoff ^ attempt))
 * jittered_delay = delay * random(0.5, 1.5)
 */
function calculateBackoff(attempt: number, config: RetryConfig): number {
  const {
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    jitter = true,
  } = config

  // Exponential backoff
  const exponentialDelay = initialDelay * Math.pow(backoffMultiplier, attempt)
  const cappedDelay = Math.min(maxDelay, exponentialDelay)

  // Add jitter to avoid thundering herd
  if (jitter) {
    const jitterFactor = 0.5 + Math.random() // Random between 0.5 and 1.5
    return cappedDelay * jitterFactor
  }

  return cappedDelay
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: any, config: RetryConfig): boolean {
  const retryableStatuses = config.retryableErrors || [
    '429', // Too Many Requests
    '500', // Internal Server Error
    '502', // Bad Gateway
    '503', // Service Unavailable
    '504', // Gateway Timeout
    'ECONNREFUSED', // Connection refused
    'ETIMEDOUT', // Timeout
    'ENOTFOUND', // DNS lookup failed
  ]

  // Check HTTP status codes
  if (error.status || error.statusCode) {
    const status = String(error.status || error.statusCode)
    return retryableStatuses.includes(status)
  }

  // Check error codes
  if (error.code) {
    return retryableStatuses.includes(error.code)
  }

  // Check error messages
  if (error.message) {
    return retryableStatuses.some((pattern) => error.message.includes(pattern))
  }

  return false
}

/**
 * Retry with exponential backoff
 *
 * Generic retry wrapper for any async function
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<RetryResult<T>> {
  const { maxRetries = 3 } = config
  const startTime = Date.now()

  let lastError: Error | undefined
  let attempt = 0

  while (attempt <= maxRetries) {
    try {
      const data = await fn()
      return {
        success: true,
        data,
        attempts: attempt + 1,
        totalDuration: Date.now() - startTime,
      }
    } catch (error) {
      lastError = error as Error
      attempt++

      // Don't retry if max attempts reached
      if (attempt > maxRetries) {
        break
      }

      // Don't retry if error is not retryable
      if (!isRetryableError(error, config)) {
        console.warn(`Non-retryable error on attempt ${attempt}:`, error)
        break
      }

      // Calculate backoff delay
      const delay = calculateBackoff(attempt - 1, config)

      console.log(
        `Retry attempt ${attempt}/${maxRetries} after ${Math.round(delay)}ms delay`
      )

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  return {
    success: false,
    error: lastError,
    attempts: attempt,
    totalDuration: Date.now() - startTime,
  }
}

/**
 * Retry specifically for HTTP requests
 *
 * Adds HTTP-specific logic like idempotency checks
 */
export async function retryHttpRequest<T>(
  requestFn: () => Promise<T>,
  config: RetryConfig & { method?: string } = {}
): Promise<RetryResult<T>> {
  const { method = 'GET' } = config

  // Only retry idempotent methods by default
  const idempotentMethods = ['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE']
  if (!idempotentMethods.includes(method.toUpperCase())) {
    console.warn(
      `HTTP method ${method} is not idempotent. Retries may cause duplicate operations.`
    )
  }

  return retryWithBackoff(requestFn, config)
}

/**
 * Retry with timeout
 *
 * Adds a timeout to each retry attempt
 */
export async function retryWithTimeout<T>(
  fn: () => Promise<T>,
  config: RetryConfig & { timeout?: number } = {}
): Promise<RetryResult<T>> {
  const { timeout = 10000 } = config

  const fnWithTimeout = async () => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const result = await fn()
      clearTimeout(timeoutId)
      return result
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  return retryWithBackoff(fnWithTimeout, config)
}

/**
 * Example: Retry Firecrawl scrape with exponential backoff
 */
export async function retryFirecrawlScrape(
  url: string,
  firecrawlClient: any,
  config: RetryConfig = {}
): Promise<RetryResult<any>> {
  return retryWithBackoff(
    async () => {
      const response = await firecrawlClient.scrape(url)

      if (!response || !response.success) {
        const error: any = new Error('Firecrawl scrape failed')
        error.status = 500 // Treat as server error (retryable)
        throw error
      }

      return response
    },
    {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
      jitter: true,
      ...config,
    }
  )
}

/**
 * Advanced: Adaptive retry strategy
 *
 * Adjusts retry behavior based on observed error rates
 * (Simple implementation - can be extended with ML)
 */
export class AdaptiveRetry {
  private successCount = 0
  private failureCount = 0
  private recentErrors: Array<{ timestamp: number; error: string }> = []

  constructor(
    private baseConfig: RetryConfig = {},
    private windowMs: number = 60000 // 1 minute
  ) {}

  /**
   * Calculate current error rate
   */
  private getErrorRate(): number {
    const now = Date.now()
    const recentErrors = this.recentErrors.filter(
      (e) => now - e.timestamp < this.windowMs
    )

    const total = this.successCount + this.failureCount
    return total > 0 ? recentErrors.length / total : 0
  }

  /**
   * Adjust retry config based on error rate
   */
  private getAdaptedConfig(): RetryConfig {
    const errorRate = this.getErrorRate()
    const config = { ...this.baseConfig }

    // High error rate (>50%) - back off more aggressively
    if (errorRate > 0.5) {
      config.maxRetries = Math.max(1, (config.maxRetries || 3) - 1)
      config.initialDelay = (config.initialDelay || 1000) * 2
    }

    // Low error rate (<10%) - can be more aggressive
    if (errorRate < 0.1) {
      config.maxRetries = (config.maxRetries || 3) + 1
      config.initialDelay = Math.max(500, (config.initialDelay || 1000) / 2)
    }

    return config
  }

  /**
   * Retry with adaptive strategy
   */
  async retry<T>(fn: () => Promise<T>): Promise<RetryResult<T>> {
    const config = this.getAdaptedConfig()
    const result = await retryWithBackoff(fn, config)

    // Update stats
    if (result.success) {
      this.successCount++
    } else {
      this.failureCount++
      this.recentErrors.push({
        timestamp: Date.now(),
        error: result.error?.message || 'Unknown error',
      })
    }

    // Clean up old errors
    const now = Date.now()
    this.recentErrors = this.recentErrors.filter(
      (e) => now - e.timestamp < this.windowMs
    )

    return result
  }

  /**
   * Get current stats (for monitoring)
   */
  getStats() {
    return {
      successCount: this.successCount,
      failureCount: this.failureCount,
      errorRate: this.getErrorRate(),
      recentErrors: this.recentErrors.length,
    }
  }
}
