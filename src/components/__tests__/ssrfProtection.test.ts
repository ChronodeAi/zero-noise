/**
 * SSRF Protection Unit Tests
 *
 * Critical security tests for ADR-006 compliance
 */

import { describe, it, expect } from 'vitest'
import {
  validateUrlForScraping,
  validateUrlsForScraping,
  checkDomainRateLimit,
  validateAndRateLimit,
} from '@/lib/ssrfProtection'

describe('SSRF Protection', () => {
  describe('validateUrlForScraping', () => {
    it('should accept valid HTTPS URLs', () => {
      const result = validateUrlForScraping('https://example.com')
      expect(result.isValid).toBe(true)
      expect(result.sanitizedUrl).toBe('https://example.com/')
    })

    it('should accept valid HTTP URLs', () => {
      const result = validateUrlForScraping('http://example.com')
      expect(result.isValid).toBe(true)
    })

    it('should reject localhost', () => {
      const result = validateUrlForScraping('http://localhost:3000')
      expect(result.isValid).toBe(false)
      expect(result.reason).toContain('localhost')
    })

    it('should reject 127.0.0.1', () => {
      const result = validateUrlForScraping('http://127.0.0.1')
      expect(result.isValid).toBe(false)
      expect(result.reason).toContain('Private IP')
    })

    it('should reject 10.0.0.0/8 private range', () => {
      const result = validateUrlForScraping('http://10.0.0.1')
      expect(result.isValid).toBe(false)
      expect(result.reason).toContain('Private IP')
    })

    it('should reject 172.16.0.0/12 private range', () => {
      const result = validateUrlForScraping('http://172.16.0.1')
      expect(result.isValid).toBe(false)
      expect(result.reason).toContain('Private IP')
    })

    it('should reject 192.168.0.0/16 private range', () => {
      const result = validateUrlForScraping('http://192.168.1.1')
      expect(result.isValid).toBe(false)
      expect(result.reason).toContain('Private IP')
    })

    it('should reject AWS metadata service', () => {
      const result = validateUrlForScraping('http://169.254.169.254/latest/meta-data/')
      expect(result.isValid).toBe(false)
      expect(result.reason).toContain('metadata service')
    })

    it('should reject file:// scheme', () => {
      const result = validateUrlForScraping('file:///etc/passwd')
      expect(result.isValid).toBe(false)
      expect(result.reason).toContain('not allowed')
    })

    it('should reject ftp:// scheme', () => {
      const result = validateUrlForScraping('ftp://example.com')
      expect(result.isValid).toBe(false)
      expect(result.reason).toContain('not allowed')
    })

    it('should reject data: scheme', () => {
      const result = validateUrlForScraping('data:text/html,<script>alert(1)</script>')
      expect(result.isValid).toBe(false)
      expect(result.reason).toContain('not allowed')
    })

    it('should reject javascript: scheme', () => {
      const result = validateUrlForScraping('javascript:alert(1)')
      expect(result.isValid).toBe(false)
      expect(result.reason).toContain('not allowed')
    })

    it('should reject URLs with embedded credentials', () => {
      const result = validateUrlForScraping('http://user:pass@example.com')
      expect(result.isValid).toBe(false)
      expect(result.reason).toContain('credentials')
    })

    it('should reject IPv6 localhost (::1)', () => {
      const result = validateUrlForScraping('http://[::1]')
      expect(result.isValid).toBe(false)
      expect(result.reason).toContain('Private IPv6')
    })

    it('should reject IPv6 link-local (fe80::)', () => {
      const result = validateUrlForScraping('http://[fe80::1]')
      expect(result.isValid).toBe(false)
      expect(result.reason).toContain('Private IPv6')
    })

    it('should reject empty string', () => {
      const result = validateUrlForScraping('')
      expect(result.isValid).toBe(false)
      expect(result.reason).toContain('non-empty string')
    })

    it('should reject invalid URL format', () => {
      const result = validateUrlForScraping('not a url')
      expect(result.isValid).toBe(false)
      expect(result.reason).toContain('Invalid URL format')
    })

    it('should reject URLs exceeding 2048 characters', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(2048)
      const result = validateUrlForScraping(longUrl)
      expect(result.isValid).toBe(false)
      expect(result.reason).toContain('maximum length')
    })
  })

  describe('validateUrlsForScraping (batch)', () => {
    it('should validate multiple URLs', () => {
      const urls = [
        'https://example.com',
        'http://localhost',
        'https://github.com/firecrawl/firecrawl',
      ]

      const results = validateUrlsForScraping(urls)

      expect(results).toHaveLength(3)
      expect(results[0].isValid).toBe(true)
      expect(results[1].isValid).toBe(false)
      expect(results[2].isValid).toBe(true)
    })
  })

  describe('checkDomainRateLimit', () => {
    it('should allow first request to a domain', () => {
      const uniqueDomain = `https://test-${Date.now()}.com`
      const result = checkDomainRateLimit(uniqueDomain)
      expect(result.allowed).toBe(true)
    })

    it('should enforce rate limit after max requests', () => {
      const uniqueDomain = `https://test-ratelimit-${Date.now()}.com`

      // Make 10 requests (max allowed)
      for (let i = 0; i < 10; i++) {
        const result = checkDomainRateLimit(uniqueDomain)
        expect(result.allowed).toBe(true)
      }

      // 11th request should be blocked
      const result = checkDomainRateLimit(uniqueDomain)
      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('Rate limit exceeded')
    })
  })

  describe('validateAndRateLimit (combined)', () => {
    it('should validate and check rate limit for valid URL', () => {
      const uniqueDomain = `https://test-combined-${Date.now()}.com`
      const result = validateAndRateLimit(uniqueDomain)

      expect(result.isValid).toBe(true)
      expect(result.rateLimitOk).toBe(true)
      expect(result.sanitizedUrl).toBeDefined()
    })

    it('should reject invalid URL regardless of rate limit', () => {
      const result = validateAndRateLimit('http://localhost')

      expect(result.isValid).toBe(false)
      expect(result.rateLimitOk).toBe(false)
    })
  })
})
