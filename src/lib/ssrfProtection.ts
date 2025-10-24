/**
 * SSRF Protection Middleware
 *
 * Prevents Server-Side Request Forgery attacks by validating URLs
 * before passing them to Firecrawl or other scraping services.
 *
 * Critical Security Control per ADR-006
 */

import { URL } from 'url'

// RFC1918 private IP ranges
const PRIVATE_IP_RANGES = [
  /^10\./,                          // 10.0.0.0/8
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // 172.16.0.0/12
  /^192\.168\./,                     // 192.168.0.0/16
  /^127\./,                          // 127.0.0.0/8 (localhost)
  /^169\.254\./,                     // 169.254.0.0/16 (link-local)
  /^0\./,                            // 0.0.0.0/8
  /^::1$/,                           // IPv6 localhost
  /^fe80:/i,                         // IPv6 link-local
  /^fc00:/i,                         // IPv6 unique local
  /^fd00:/i,                         // IPv6 unique local
]

// Blocked hostnames
const BLOCKED_HOSTNAMES = [
  'localhost',
  'metadata.google.internal',  // GCP metadata service
  '169.254.169.254',            // AWS/Azure metadata service
  'instance-data',              // EC2 metadata
]

// Allowed protocols
const ALLOWED_PROTOCOLS = ['http:', 'https:']

// Blocked file extensions (prevent file:// scheme abuse)
const BLOCKED_SCHEMES = ['file:', 'ftp:', 'data:', 'javascript:', 'about:']

export interface URLValidationResult {
  isValid: boolean
  reason?: string
  sanitizedUrl?: string
}

/**
 * Validate URL for SSRF protection
 *
 * @param urlString - URL to validate
 * @returns Validation result with sanitized URL if valid
 */
export function validateUrlForScraping(urlString: string): URLValidationResult {
  // Basic string validation
  if (!urlString || typeof urlString !== 'string') {
    return { isValid: false, reason: 'URL must be a non-empty string' }
  }

  // Trim and normalize
  const trimmedUrl = urlString.trim()

  if (trimmedUrl.length > 2048) {
    return { isValid: false, reason: 'URL exceeds maximum length (2048 characters)' }
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(trimmedUrl)
  } catch (error) {
    return { isValid: false, reason: 'Invalid URL format' }
  }

  // Check protocol
  if (!ALLOWED_PROTOCOLS.includes(parsedUrl.protocol)) {
    return { isValid: false, reason: `Protocol '${parsedUrl.protocol}' not allowed. Use http: or https:` }
  }

  // Block dangerous schemes
  for (const scheme of BLOCKED_SCHEMES) {
    if (parsedUrl.protocol === scheme) {
      return { isValid: false, reason: `Dangerous scheme '${scheme}' blocked` }
    }
  }

  // Check hostname
  const hostname = parsedUrl.hostname.toLowerCase()

  // Block localhost variants
  if (BLOCKED_HOSTNAMES.includes(hostname)) {
    return { isValid: false, reason: `Hostname '${hostname}' is blocked (localhost/metadata service)` }
  }

  // Check for private IP ranges
  for (const range of PRIVATE_IP_RANGES) {
    if (range.test(hostname)) {
      return { isValid: false, reason: `Private IP address detected: ${hostname}` }
    }
  }

  // Block URLs with credentials (username:password@host)
  if (parsedUrl.username || parsedUrl.password) {
    return { isValid: false, reason: 'URLs with embedded credentials are not allowed' }
  }

  // Additional checks for IPv6
  if (hostname.includes(':') && hostname.startsWith('[')) {
    // IPv6 address
    const ipv6 = hostname.replace(/\[|\]/g, '')

    // Block IPv6 localhost and private ranges
    if (ipv6 === '::1' || ipv6.startsWith('fe80:') || ipv6.startsWith('fc00:') || ipv6.startsWith('fd00:')) {
      return { isValid: false, reason: `Private IPv6 address detected: ${ipv6}` }
    }
  }

  // URL is valid - return sanitized version
  return {
    isValid: true,
    sanitizedUrl: parsedUrl.toString(),
  }
}

/**
 * Batch validate multiple URLs
 *
 * @param urls - Array of URLs to validate
 * @returns Array of validation results
 */
export function validateUrlsForScraping(urls: string[]): URLValidationResult[] {
  return urls.map(url => validateUrlForScraping(url))
}

/**
 * Rate limiting per domain (prevent abuse of specific sites)
 *
 * Simple in-memory cache with TTL.
 * For production, use Redis-backed rate limiter.
 */
const domainRequestCache = new Map<string, number[]>()
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_DOMAIN = 10 // 10 requests per minute per domain

export function checkDomainRateLimit(url: string): { allowed: boolean; reason?: string } {
  try {
    const parsedUrl = new URL(url)
    const domain = parsedUrl.hostname

    const now = Date.now()
    const requests = domainRequestCache.get(domain) || []

    // Remove expired timestamps
    const validRequests = requests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS)

    if (validRequests.length >= MAX_REQUESTS_PER_DOMAIN) {
      return {
        allowed: false,
        reason: `Rate limit exceeded for domain '${domain}'. Max ${MAX_REQUESTS_PER_DOMAIN} requests per minute.`,
      }
    }

    // Add current request
    validRequests.push(now)
    domainRequestCache.set(domain, validRequests)

    return { allowed: true }
  } catch {
    return { allowed: false, reason: 'Invalid URL for rate limit check' }
  }
}

/**
 * Combined validation and rate limiting
 *
 * Use this as the main entry point for URL scraping validation.
 */
export function validateAndRateLimit(url: string): URLValidationResult & { rateLimitOk: boolean } {
  const validation = validateUrlForScraping(url)

  if (!validation.isValid) {
    return { ...validation, rateLimitOk: false }
  }

  const rateLimit = checkDomainRateLimit(url)

  if (!rateLimit.allowed) {
    return {
      isValid: false,
      reason: rateLimit.reason,
      rateLimitOk: false,
    }
  }

  return {
    ...validation,
    rateLimitOk: true,
  }
}

/**
 * Express/Next.js middleware wrapper
 *
 * Usage in API route:
 * ```ts
 * const validation = validateAndRateLimit(req.body.url)
 * if (!validation.isValid) {
 *   return res.status(400).json({ error: validation.reason })
 * }
 * const url = validation.sanitizedUrl
 * ```
 */
