/**
 * Unit Tests for Anti-Bot Strategies
 *
 * Tests user agent rotation, viewport randomization, header generation,
 * robots.txt parsing, and stealth configuration.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getRandomUserAgent,
  getRandomViewport,
  generateRealisticHeaders,
  randomDelay,
  getStealthConfig,
  checkRobotsTxt,
  getPlaywrightStealthArgs,
  enhanceFirecrawlRequest,
} from '@/lib/antiBotStrategies'

describe('Anti-Bot Strategies - User Agent Rotation', () => {
  it('should return different user agents on rotation', () => {
    const userAgents = new Set<string>()

    // Generate 20 user agents - should get at least 3 different ones
    for (let i = 0; i < 20; i++) {
      userAgents.add(getRandomUserAgent())
    }

    expect(userAgents.size).toBeGreaterThanOrEqual(3)
  })

  it('should return valid Chrome user agent', () => {
    let foundChrome = false

    for (let i = 0; i < 10; i++) {
      const ua = getRandomUserAgent()
      if (ua.includes('Chrome')) {
        foundChrome = true
        expect(ua).toContain('Mozilla/5.0')
        expect(ua).toContain('AppleWebKit')
        expect(ua).toContain('Safari')
        break
      }
    }

    expect(foundChrome).toBe(true)
  })

  it('should return valid Firefox user agent', () => {
    let foundFirefox = false

    for (let i = 0; i < 10; i++) {
      const ua = getRandomUserAgent()
      if (ua.includes('Firefox')) {
        foundFirefox = true
        expect(ua).toContain('Mozilla/5.0')
        expect(ua).toContain('Gecko')
        break
      }
    }

    expect(foundFirefox).toBe(true)
  })

  it('should return valid Safari user agent', () => {
    let foundSafari = false

    for (let i = 0; i < 10; i++) {
      const ua = getRandomUserAgent()
      if (ua.includes('Safari') && !ua.includes('Chrome')) {
        foundSafari = true
        expect(ua).toContain('Mozilla/5.0')
        expect(ua).toContain('AppleWebKit')
        expect(ua).toContain('Version')
        break
      }
    }

    expect(foundSafari).toBe(true)
  })

  it('should always return a user agent string', () => {
    for (let i = 0; i < 10; i++) {
      const ua = getRandomUserAgent()
      expect(ua).toBeTruthy()
      expect(ua.length).toBeGreaterThan(0)
    }
  })
})

describe('Anti-Bot Strategies - Viewport Randomization', () => {
  it('should randomize viewport sizes within common ranges', () => {
    const viewports = new Set<string>()

    // Generate 20 viewports - should get at least 3 different ones
    for (let i = 0; i < 20; i++) {
      const vp = getRandomViewport()
      viewports.add(`${vp.width}x${vp.height}`)
    }

    expect(viewports.size).toBeGreaterThanOrEqual(3)
  })

  it('should return common viewport sizes (1920x1080, 1366x768, etc)', () => {
    const commonSizes = [
      '1920x1080', // Full HD
      '1366x768', // HD
      '1536x864', // HD+
      '1440x900', // MacBook
      '2560x1440', // 2K
    ]

    let foundCommonSize = false

    for (let i = 0; i < 10; i++) {
      const vp = getRandomViewport()
      const size = `${vp.width}x${vp.height}`
      if (commonSizes.includes(size)) {
        foundCommonSize = true
        break
      }
    }

    expect(foundCommonSize).toBe(true)
  })

  it('should return viewports with width and height', () => {
    for (let i = 0; i < 10; i++) {
      const vp = getRandomViewport()
      expect(vp).toHaveProperty('width')
      expect(vp).toHaveProperty('height')
      expect(typeof vp.width).toBe('number')
      expect(typeof vp.height).toBe('number')
      expect(vp.width).toBeGreaterThan(0)
      expect(vp.height).toBeGreaterThan(0)
    }
  })

  it('should return realistic aspect ratios', () => {
    for (let i = 0; i < 10; i++) {
      const vp = getRandomViewport()
      const aspectRatio = vp.width / vp.height

      // Most common aspect ratios: 16:9, 16:10, 21:9
      expect(aspectRatio).toBeGreaterThan(1.2) // At least 6:5
      expect(aspectRatio).toBeLessThan(2.5) // At most 21:9
    }
  })
})

describe('Anti-Bot Strategies - Header Generation', () => {
  it('should generate realistic Chrome headers', () => {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    const headers = generateRealisticHeaders(ua)

    expect(headers['User-Agent']).toBe(ua)
    expect(headers['Accept']).toContain('text/html')
    expect(headers['Accept-Language']).toBe('en-US,en;q=0.9')
    expect(headers['Accept-Encoding']).toContain('gzip')
    expect(headers['Sec-Ch-Ua']).toBeTruthy()
    expect(headers['Sec-Ch-Ua-Mobile']).toBe('?0')
    expect(headers['Sec-Fetch-Dest']).toBe('document')
    expect(headers['Sec-Fetch-Mode']).toBe('navigate')
  })

  it('should use random user agent if none provided', () => {
    const headers = generateRealisticHeaders()

    expect(headers['User-Agent']).toBeTruthy()
    expect(headers['User-Agent']).toContain('Mozilla')
  })

  it('should include security headers (Sec-Fetch-*)', () => {
    const headers = generateRealisticHeaders()

    expect(headers['Sec-Fetch-Dest']).toBe('document')
    expect(headers['Sec-Fetch-Mode']).toBe('navigate')
    expect(headers['Sec-Fetch-Site']).toBe('none')
    expect(headers['Sec-Fetch-User']).toBe('?1')
  })

  it('should include client hints (Sec-Ch-Ua-*)', () => {
    const headers = generateRealisticHeaders()

    expect(headers['Sec-Ch-Ua']).toBeTruthy()
    expect(headers['Sec-Ch-Ua-Mobile']).toBe('?0')
    expect(headers['Sec-Ch-Ua-Platform']).toBe('"Windows"')
  })

  it('should include Cache-Control header', () => {
    const headers = generateRealisticHeaders()

    expect(headers['Cache-Control']).toBe('max-age=0')
  })

  it('should include Upgrade-Insecure-Requests header', () => {
    const headers = generateRealisticHeaders()

    expect(headers['Upgrade-Insecure-Requests']).toBe('1')
  })
})

describe('Anti-Bot Strategies - Random Delays', () => {
  it('should add random delay between min and max', async () => {
    const startTime = Date.now()
    await randomDelay(100, 200)
    const elapsed = Date.now() - startTime

    expect(elapsed).toBeGreaterThanOrEqual(100)
    expect(elapsed).toBeLessThan(300) // Allow some overhead
  })

  it('should use default delay range (1000-3000ms)', async () => {
    const startTime = Date.now()
    await randomDelay()
    const elapsed = Date.now() - startTime

    expect(elapsed).toBeGreaterThanOrEqual(1000)
    expect(elapsed).toBeLessThan(3500) // Allow some overhead
  })

  it('should handle zero delay', async () => {
    const startTime = Date.now()
    await randomDelay(0, 0)
    const elapsed = Date.now() - startTime

    expect(elapsed).toBeLessThan(50) // Should be nearly instant
  })
})

describe('Anti-Bot Strategies - Stealth Configuration', () => {
  it('should return stealth config with navigator overrides', () => {
    const config = getStealthConfig()

    expect(config.navigator).toBeDefined()
    expect(config.navigator.webdriver).toBe(false)
    expect(config.navigator.languages).toContain('en-US')
    expect(config.navigator.platform).toBe('Win32')
    expect(config.navigator.hardwareConcurrency).toBe(8)
  })

  it('should disable automation indicators', () => {
    const config = getStealthConfig()

    expect(config.automation).toBeDefined()
    expect(config.automation.disableWebDriver).toBe(true)
    expect(config.automation.disableAutomationControlled).toBe(true)
  })

  it('should include canvas fingerprint countermeasures', () => {
    const config = getStealthConfig()

    expect(config.canvas).toBeDefined()
    expect(config.canvas.noise).toBe(true)
  })

  it('should include WebGL fingerprint countermeasures', () => {
    const config = getStealthConfig()

    expect(config.webgl).toBeDefined()
    expect(config.webgl.vendor).toBeTruthy()
    expect(config.webgl.renderer).toBeTruthy()
  })
})

describe('Anti-Bot Strategies - Robots.txt Parsing', () => {
  it('should parse robots.txt and allow permitted paths', async () => {
    // Mock fetch to return robots.txt
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => `
User-agent: *
Allow: /api/
Disallow: /admin/
      `,
    } as Response)

    const allowed = await checkRobotsTxt('https://example.com/api/data')

    expect(allowed).toBe(true)
  })

  it('should parse robots.txt and disallow restricted paths', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => `
User-agent: *
Disallow: /admin/
Disallow: /private/
      `,
    } as Response)

    const allowed = await checkRobotsTxt('https://example.com/admin/users')

    expect(allowed).toBe(false)
  })

  it('should respect User-agent: * in robots.txt', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => `
User-agent: *
Disallow: /blocked/

User-agent: Googlebot
Allow: /
      `,
    } as Response)

    const allowed = await checkRobotsTxt('https://example.com/blocked/page', '*')

    expect(allowed).toBe(false)
  })

  it('should allow scraping if no robots.txt found', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    } as Response)

    const allowed = await checkRobotsTxt('https://example.com/any/path')

    expect(allowed).toBe(true)
  })

  it('should allow scraping if robots.txt fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const allowed = await checkRobotsTxt('https://example.com/any/path')

    expect(allowed).toBe(true) // Fail open
  })

  it('should handle robots.txt with Allow directive', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => `
User-agent: *
Disallow: /
Allow: /public/
      `,
    } as Response)

    const allowed = await checkRobotsTxt('https://example.com/public/data')

    expect(allowed).toBe(true)
  })

  it('should handle empty robots.txt', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '',
    } as Response)

    const allowed = await checkRobotsTxt('https://example.com/any/path')

    expect(allowed).toBe(true)
  })
})

describe('Anti-Bot Strategies - Playwright Stealth Args', () => {
  it('should return array of Playwright launch arguments', () => {
    const args = getPlaywrightStealthArgs()

    expect(Array.isArray(args)).toBe(true)
    expect(args.length).toBeGreaterThan(0)
  })

  it('should disable automation detection', () => {
    const args = getPlaywrightStealthArgs()

    expect(args).toContain('--disable-blink-features=AutomationControlled')
  })

  it('should include resource optimization flags', () => {
    const args = getPlaywrightStealthArgs()

    expect(args).toContain('--disable-dev-shm-usage')
    expect(args).toContain('--no-sandbox')
  })

  it('should set realistic window size', () => {
    const args = getPlaywrightStealthArgs()

    const windowSizeArg = args.find((arg) => arg.startsWith('--window-size='))
    expect(windowSizeArg).toBeTruthy()
    expect(windowSizeArg).toContain('1920')
  })
})

describe('Anti-Bot Strategies - Firecrawl Request Enhancement', () => {
  it('should enhance Firecrawl request with stealth config', () => {
    const baseRequest = {
      url: 'https://example.com',
      formats: ['metadata'],
    }

    const enhanced = enhanceFirecrawlRequest(baseRequest, {
      rotateUserAgents: true,
      randomizeViewport: true,
    })

    expect(enhanced.userAgent).toBeTruthy()
    expect(enhanced.viewport).toBeDefined()
    expect(enhanced.viewport.width).toBeGreaterThan(0)
    expect(enhanced.viewport.height).toBeGreaterThan(0)
    expect(enhanced.headers).toBeDefined()
  })

  it('should add realistic headers to request', () => {
    const baseRequest = {
      url: 'https://example.com',
    }

    const enhanced = enhanceFirecrawlRequest(baseRequest)

    expect(enhanced.headers['User-Agent']).toBeTruthy()
    expect(enhanced.headers['Accept']).toContain('text/html')
    expect(enhanced.headers['Accept-Language']).toBeTruthy()
  })

  it('should preserve original request properties', () => {
    const baseRequest = {
      url: 'https://example.com',
      formats: ['markdown', 'metadata'],
      onlyMainContent: true,
    }

    const enhanced = enhanceFirecrawlRequest(baseRequest)

    expect(enhanced.url).toBe('https://example.com')
    expect(enhanced.formats).toEqual(['markdown', 'metadata'])
    expect(enhanced.onlyMainContent).toBe(true)
  })

  it('should allow custom headers override', () => {
    const baseRequest = {
      url: 'https://example.com',
    }

    const enhanced = enhanceFirecrawlRequest(baseRequest, {
      customHeaders: {
        'X-Custom-Header': 'test-value',
        Authorization: 'Bearer token',
      },
    })

    expect(enhanced.headers['X-Custom-Header']).toBe('test-value')
    expect(enhanced.headers['Authorization']).toBe('Bearer token')
  })

  it('should add random delay wait time', () => {
    const baseRequest = {
      url: 'https://example.com',
    }

    const enhanced = enhanceFirecrawlRequest(baseRequest, {
      randomDelay: { min: 1000, max: 3000 },
    })

    expect(enhanced.waitFor).toBeDefined()
    expect(enhanced.waitFor).toBeGreaterThanOrEqual(1000)
    expect(enhanced.waitFor).toBeLessThanOrEqual(3000)
  })

  it('should disable user agent rotation when configured', () => {
    const baseRequest = {
      url: 'https://example.com',
      userAgent: 'Custom UA',
    }

    const enhanced = enhanceFirecrawlRequest(baseRequest, {
      rotateUserAgents: false,
    })

    // Should preserve original userAgent
    expect(enhanced.userAgent).toBe('Custom UA')
  })

  it('should disable viewport randomization when configured', () => {
    const baseRequest = {
      url: 'https://example.com',
      viewport: { width: 1024, height: 768 },
    }

    const enhanced = enhanceFirecrawlRequest(baseRequest, {
      randomizeViewport: false,
    })

    // Should preserve original viewport
    expect(enhanced.viewport).toEqual({ width: 1024, height: 768 })
  })
})

describe('Anti-Bot Strategies - Integration', () => {
  it('should combine user agent, viewport, and headers', () => {
    const baseRequest = {
      url: 'https://example.com',
    }

    const enhanced = enhanceFirecrawlRequest(baseRequest, {
      rotateUserAgents: true,
      randomizeViewport: true,
      customHeaders: { 'X-Test': 'value' },
    })

    expect(enhanced.userAgent).toBeTruthy()
    expect(enhanced.viewport).toBeDefined()
    expect(enhanced.headers['User-Agent']).toBe(enhanced.userAgent)
    expect(enhanced.headers['X-Test']).toBe('value')
    expect(enhanced.headers['Accept']).toBeTruthy()
  })

  it('should handle minimal config', () => {
    const baseRequest = {
      url: 'https://example.com',
    }

    const enhanced = enhanceFirecrawlRequest(baseRequest)

    // Should still add defaults
    expect(enhanced.userAgent).toBeTruthy()
    expect(enhanced.viewport).toBeDefined()
    expect(enhanced.headers).toBeDefined()
  })

  it('should handle empty config object', () => {
    const baseRequest = {
      url: 'https://example.com',
    }

    const enhanced = enhanceFirecrawlRequest(baseRequest, {})

    expect(enhanced.userAgent).toBeTruthy()
    expect(enhanced.viewport).toBeDefined()
  })
})
