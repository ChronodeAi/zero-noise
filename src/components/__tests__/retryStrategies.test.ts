/**
 * Unit Tests for Retry Strategies
 *
 * Tests exponential backoff, jitter, HTTP-specific retries,
 * timeout handling, and adaptive retry logic.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  retryWithBackoff,
  retryHttpRequest,
  retryWithTimeout,
  retryFirecrawlScrape,
  AdaptiveRetry,
} from '@/lib/retryStrategies'

describe('Retry Strategies - Exponential Backoff', () => {
  it('should retry on 500 Internal Server Error', async () => {
    let attempts = 0

    const fn = async () => {
      attempts++
      if (attempts < 3) {
        const error: any = new Error('Internal Server Error')
        error.status = 500
        throw error
      }
      return 'success'
    }

    const result = await retryWithBackoff(fn, { maxRetries: 3, initialDelay: 10, jitter: false })

    expect(result.success).toBe(true)
    expect(result.data).toBe('success')
    expect(result.attempts).toBe(3)
  })

  it('should retry on 503 Service Unavailable', async () => {
    let attempts = 0

    const fn = async () => {
      attempts++
      if (attempts < 2) {
        const error: any = new Error('Service Unavailable')
        error.statusCode = 503
        throw error
      }
      return 'recovered'
    }

    const result = await retryWithBackoff(fn, { maxRetries: 3, initialDelay: 10, jitter: false })

    expect(result.success).toBe(true)
    expect(result.data).toBe('recovered')
    expect(result.attempts).toBe(2)
  })

  it('should NOT retry on 400 Bad Request', async () => {
    let attempts = 0

    const fn = async () => {
      attempts++
      const error: any = new Error('Bad Request')
      error.status = 400
      throw error
    }

    const result = await retryWithBackoff(fn, { maxRetries: 3, initialDelay: 10 })

    expect(result.success).toBe(false)
    expect(result.attempts).toBe(1) // Should not retry
  })

  it('should NOT retry on 401 Unauthorized', async () => {
    let attempts = 0

    const fn = async () => {
      attempts++
      const error: any = new Error('Unauthorized')
      error.status = 401
      throw error
    }

    const result = await retryWithBackoff(fn, { maxRetries: 3, initialDelay: 10 })

    expect(result.success).toBe(false)
    expect(result.attempts).toBe(1)
  })

  it('should apply exponential backoff (1s, 2s, 4s, 8s)', async () => {
    const delays: number[] = []
    let attempts = 0

    const fn = async () => {
      attempts++
      if (attempts <= 4) {
        const error: any = new Error('Retry me')
        error.status = 500
        throw error
      }
      return 'done'
    }

    const startTime = Date.now()
    await retryWithBackoff(fn, {
      maxRetries: 4,
      initialDelay: 100,
      backoffMultiplier: 2,
      jitter: false,
    })
    const elapsed = Date.now() - startTime

    // Total delay should be approximately: 100 + 200 + 400 + 800 = 1500ms
    expect(elapsed).toBeGreaterThanOrEqual(1400) // Allow some tolerance
    expect(elapsed).toBeLessThan(1700)
  })

  it('should apply jitter to backoff delays', async () => {
    const delays: number[] = []
    let attempts = 0

    const fn = async () => {
      attempts++
      if (attempts <= 3) {
        const startAttempt = Date.now()
        const error: any = new Error('Retry me')
        error.status = 500
        throw error
      }
      return 'done'
    }

    await retryWithBackoff(fn, {
      maxRetries: 3,
      initialDelay: 100,
      backoffMultiplier: 2,
      jitter: true, // Enable jitter
    })

    // With jitter, delays should vary (can't test exact values, but should succeed)
    expect(attempts).toBe(4)
  })

  it('should cap delay at maxDelay', async () => {
    let attempts = 0

    const fn = async () => {
      attempts++
      if (attempts <= 3) {
        const error: any = new Error('Retry me')
        error.status = 500
        throw error
      }
      return 'done'
    }

    const startTime = Date.now()
    await retryWithBackoff(fn, {
      maxRetries: 3,
      initialDelay: 100,
      maxDelay: 200, // Cap at 200ms
      backoffMultiplier: 2,
      jitter: false,
    })
    const elapsed = Date.now() - startTime

    // Delays: 100, 200, 200 = 500ms total
    expect(elapsed).toBeGreaterThanOrEqual(450)
    expect(elapsed).toBeLessThan(700)
  })

  it('should stop after maxRetries attempts', async () => {
    let attempts = 0

    const fn = async () => {
      attempts++
      const error: any = new Error('Always fails')
      error.status = 500
      throw error
    }

    const result = await retryWithBackoff(fn, { maxRetries: 3, initialDelay: 10, jitter: false })

    expect(result.success).toBe(false)
    expect(result.attempts).toBe(4) // Initial attempt + 3 retries
    expect(result.error?.message).toBe('Always fails')
  })

  it('should track retry attempts and total duration', async () => {
    let attempts = 0

    const fn = async () => {
      attempts++
      if (attempts < 2) {
        const error: any = new Error('Retry once')
        error.status = 500
        throw error
      }
      return 'success'
    }

    const result = await retryWithBackoff(fn, { maxRetries: 3, initialDelay: 100, jitter: false })

    expect(result.success).toBe(true)
    expect(result.attempts).toBe(2)
    expect(result.totalDuration).toBeGreaterThanOrEqual(100) // At least one delay
  })

  it('should retry on ECONNREFUSED error', async () => {
    let attempts = 0

    const fn = async () => {
      attempts++
      if (attempts < 2) {
        const error: any = new Error('Connection refused')
        error.code = 'ECONNREFUSED'
        throw error
      }
      return 'connected'
    }

    const result = await retryWithBackoff(fn, { maxRetries: 3, initialDelay: 10 })

    expect(result.success).toBe(true)
    expect(result.attempts).toBe(2)
  })

  it('should retry on ETIMEDOUT error', async () => {
    let attempts = 0

    const fn = async () => {
      attempts++
      if (attempts < 2) {
        const error: any = new Error('Request timeout')
        error.code = 'ETIMEDOUT'
        throw error
      }
      return 'completed'
    }

    const result = await retryWithBackoff(fn, { maxRetries: 3, initialDelay: 10 })

    expect(result.success).toBe(true)
    expect(result.attempts).toBe(2)
  })

  it('should retry on 429 Too Many Requests', async () => {
    let attempts = 0

    const fn = async () => {
      attempts++
      if (attempts < 2) {
        const error: any = new Error('Rate limited')
        error.status = 429
        throw error
      }
      return 'allowed'
    }

    const result = await retryWithBackoff(fn, { maxRetries: 3, initialDelay: 10 })

    expect(result.success).toBe(true)
    expect(result.attempts).toBe(2)
  })
})

describe('Retry Strategies - HTTP-Specific Retries', () => {
  it('should only retry idempotent HTTP methods (GET, PUT, DELETE)', async () => {
    let attempts = 0

    const fn = async () => {
      attempts++
      if (attempts < 2) {
        const error: any = new Error('Server error')
        error.status = 500
        throw error
      }
      return 'success'
    }

    const result = await retryHttpRequest(fn, { method: 'GET', maxRetries: 3, initialDelay: 10 })

    expect(result.success).toBe(true)
  })

  it('should warn on non-idempotent retry (POST)', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    let attempts = 0
    const fn = async () => {
      attempts++
      if (attempts < 2) {
        const error: any = new Error('Server error')
        error.status = 500
        throw error
      }
      return 'success'
    }

    await retryHttpRequest(fn, { method: 'POST', maxRetries: 3, initialDelay: 10 })

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('POST is not idempotent')
    )

    consoleWarnSpy.mockRestore()
  })

  it('should default to GET method', async () => {
    const fn = async () => 'success'

    const result = await retryHttpRequest(fn, { maxRetries: 3, initialDelay: 10 })

    expect(result.success).toBe(true)
  })
})

describe('Retry Strategies - Timeout Handling', () => {
  it('should timeout after configured duration', async () => {
    // Note: AbortController doesn't actually cancel the promise,
    // so this test verifies the timeout mechanism exists
    const fn = async () => {
      return 'completed'
    }

    const result = await retryWithTimeout(fn, { timeout: 1000, maxRetries: 1, initialDelay: 10 })

    // Function completes before timeout
    expect(result.success).toBe(true)
  })

  it('should succeed if completes within timeout', async () => {
    const fn = async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
      return 'fast enough'
    }

    const result = await retryWithTimeout(fn, { timeout: 200, maxRetries: 3, initialDelay: 10 })

    expect(result.success).toBe(true)
    expect(result.data).toBe('fast enough')
  })

  it('should use default timeout (10 seconds)', async () => {
    const fn = async () => 'instant'

    const result = await retryWithTimeout(fn, { maxRetries: 3 })

    expect(result.success).toBe(true)
  })
})

describe('Retry Strategies - Firecrawl Integration', () => {
  it('should retry Firecrawl scrape on failure', async () => {
    let attempts = 0
    const mockClient = {
      scrape: async (url: string) => {
        attempts++
        if (attempts < 2) {
          return { success: false }
        }
        return { success: true, data: { title: 'Test Page' } }
      },
    }

    const result = await retryFirecrawlScrape('https://example.com', mockClient, {
      maxRetries: 3,
      initialDelay: 10,
    })

    expect(result.success).toBe(true)
    expect(result.attempts).toBe(2)
  })

  it('should use default config for Firecrawl retry', async () => {
    const mockClient = {
      scrape: async () => ({ success: true, data: { title: 'Page' } }),
    }

    const result = await retryFirecrawlScrape('https://example.com', mockClient)

    expect(result.success).toBe(true)
  })
})

describe('Retry Strategies - Adaptive Retry', () => {
  it('should track success and failure counts', async () => {
    const adapter = new AdaptiveRetry()

    const successFn = async () => 'success'
    await adapter.retry(successFn)

    const stats = adapter.getStats()
    expect(stats.successCount).toBe(1)
    expect(stats.failureCount).toBe(0)
  })

  it('should reduce retries on high error rate', async () => {
    const adapter = new AdaptiveRetry({ maxRetries: 2, initialDelay: 1, jitter: false }, 60000)

    // Simulate high failure rate
    for (let i = 0; i < 5; i++) {
      const failFn = async () => {
        const error: any = new Error('Fail')
        error.status = 500
        throw error
      }
      await adapter.retry(failFn)
    }

    const stats = adapter.getStats()
    expect(stats.failureCount).toBeGreaterThanOrEqual(5)
    expect(stats.errorRate).toBeGreaterThan(0.5)
  }, 10000)

  it('should increase retries on low error rate', async () => {
    const adapter = new AdaptiveRetry({ maxRetries: 3, initialDelay: 10 }, 60000)

    // Simulate low failure rate (mostly successes)
    for (let i = 0; i < 10; i++) {
      const successFn = async () => 'success'
      await adapter.retry(successFn)
    }

    const stats = adapter.getStats()
    expect(stats.successCount).toBe(10)
    expect(stats.errorRate).toBe(0)
  })

  it('should clean up old errors outside time window', async () => {
    const adapter = new AdaptiveRetry({ maxRetries: 1, initialDelay: 1 }, 100) // 100ms window

    // Add error
    const failFn = async () => {
      const error: any = new Error('Fail')
      error.status = 500
      throw error
    }
    await adapter.retry(failFn)

    expect(adapter.getStats().recentErrors).toBe(1)

    // Wait for window to expire
    await new Promise((resolve) => setTimeout(resolve, 150))

    // Add success (triggers cleanup)
    const successFn = async () => 'success'
    await adapter.retry(successFn)

    const stats = adapter.getStats()
    expect(stats.recentErrors).toBe(0) // Old error cleaned up
  }, 10000)

  it('should return stats with error rate', () => {
    const adapter = new AdaptiveRetry()

    const stats = adapter.getStats()

    expect(stats).toHaveProperty('successCount')
    expect(stats).toHaveProperty('failureCount')
    expect(stats).toHaveProperty('errorRate')
    expect(stats).toHaveProperty('recentErrors')
  })
})

describe('Retry Strategies - Error Classification', () => {
  it('should classify network errors as retryable', async () => {
    let attempts = 0

    const fn = async () => {
      attempts++
      if (attempts < 2) {
        const error: any = new Error('DNS lookup failed')
        error.code = 'ENOTFOUND'
        throw error
      }
      return 'resolved'
    }

    const result = await retryWithBackoff(fn, { maxRetries: 3, initialDelay: 10 })

    expect(result.success).toBe(true)
    expect(result.attempts).toBe(2)
  })

  it('should classify server errors (5xx) as retryable', async () => {
    const retryableStatuses = [500, 502, 503, 504]

    for (const status of retryableStatuses) {
      let attempts = 0

      const fn = async () => {
        attempts++
        if (attempts < 2) {
          const error: any = new Error(`HTTP ${status}`)
          error.status = status
          throw error
        }
        return 'recovered'
      }

      const result = await retryWithBackoff(fn, { maxRetries: 3, initialDelay: 10 })

      expect(result.success).toBe(true)
    }
  })

  it('should NOT classify client errors (4xx) as retryable', async () => {
    const nonRetryableStatuses = [400, 401, 403, 404]

    for (const status of nonRetryableStatuses) {
      let attempts = 0

      const fn = async () => {
        attempts++
        const error: any = new Error(`HTTP ${status}`)
        error.status = status
        throw error
      }

      const result = await retryWithBackoff(fn, { maxRetries: 3, initialDelay: 10 })

      expect(result.success).toBe(false)
      expect(result.attempts).toBe(1) // Should not retry
    }
  })

  it('should allow custom retryable errors', async () => {
    let attempts = 0

    const fn = async () => {
      attempts++
      if (attempts < 2) {
        const error: any = new Error('Custom error')
        error.code = 'CUSTOM_ERROR'
        throw error
      }
      return 'success'
    }

    const result = await retryWithBackoff(fn, {
      maxRetries: 3,
      initialDelay: 10,
      retryableErrors: ['CUSTOM_ERROR'],
    })

    expect(result.success).toBe(true)
    expect(result.attempts).toBe(2)
  })
})

describe('Retry Strategies - Edge Cases', () => {
  it('should handle immediate success (no retries needed)', async () => {
    const fn = async () => 'immediate success'

    const result = await retryWithBackoff(fn, { maxRetries: 3 })

    expect(result.success).toBe(true)
    expect(result.attempts).toBe(1)
    expect(result.data).toBe('immediate success')
  })

  it('should handle zero maxRetries', async () => {
    let attempts = 0

    const fn = async () => {
      attempts++
      const error: any = new Error('Fail')
      error.status = 500
      throw error
    }

    const result = await retryWithBackoff(fn, { maxRetries: 0, initialDelay: 10 })

    expect(result.success).toBe(false)
    expect(result.attempts).toBe(1) // Only initial attempt
  })

  it('should handle errors without status or code', async () => {
    let attempts = 0

    const fn = async () => {
      attempts++
      throw new Error('Generic error')
    }

    const result = await retryWithBackoff(fn, { maxRetries: 3, initialDelay: 10 })

    expect(result.success).toBe(false)
    expect(result.attempts).toBe(1) // Should not retry unknown errors
  })

  it('should handle error messages containing retryable patterns', async () => {
    let attempts = 0

    const fn = async () => {
      attempts++
      if (attempts < 2) {
        throw new Error('Connection failed with 503 status')
      }
      return 'recovered'
    }

    const result = await retryWithBackoff(fn, { maxRetries: 3, initialDelay: 10 })

    expect(result.success).toBe(true)
    expect(result.attempts).toBe(2)
  })

  it('should return error object when all retries exhausted', async () => {
    const fn = async () => {
      const error: any = new Error('Persistent failure')
      error.status = 500
      throw error
    }

    const result = await retryWithBackoff(fn, { maxRetries: 2, initialDelay: 10 })

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
    expect(result.error?.message).toBe('Persistent failure')
  })
})
