/**
 * Anti-Bot Evasion Strategies - Legal Open Source Implementation
 *
 * Uses publicly documented techniques and open-source libraries
 * to improve scraping success rates against bot detection.
 *
 * NOT reverse engineered - based on:
 * - Public documentation (Playwright, Puppeteer docs)
 * - Open-source projects (browserless, headless-stealth)
 * - Published research papers
 */

export interface AntiBotConfig {
  // User agent rotation
  rotateUserAgents?: boolean
  userAgents?: string[]

  // Viewport randomization
  randomizeViewport?: boolean
  viewportSizes?: Array<{ width: number; height: number }>

  // Request timing
  randomDelay?: { min: number; max: number } // milliseconds
  respectRobotsTxt?: boolean

  // Headers
  customHeaders?: Record<string, string>
  acceptLanguage?: string

  // Fingerprinting
  disableWebGL?: boolean
  disableWebRTC?: boolean
  maskTimezone?: boolean
}

/**
 * Common desktop user agents (public data)
 * Source: https://www.useragentstring.com/pages/useragentstring.php
 */
const COMMON_USER_AGENTS = [
  // Chrome on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  // Chrome on macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  // Firefox on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  // Safari on macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  // Edge on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
]

/**
 * Common viewport sizes (public data - most common screen resolutions)
 * Source: StatCounter Global Stats
 */
const COMMON_VIEWPORTS = [
  { width: 1920, height: 1080 }, // Full HD
  { width: 1366, height: 768 }, // HD
  { width: 1536, height: 864 }, // HD+
  { width: 1440, height: 900 }, // MacBook
  { width: 2560, height: 1440 }, // 2K
]

/**
 * Get random user agent from common desktop browsers
 */
export function getRandomUserAgent(): string {
  return COMMON_USER_AGENTS[Math.floor(Math.random() * COMMON_USER_AGENTS.length)]
}

/**
 * Get random viewport size
 */
export function getRandomViewport(): { width: number; height: number } {
  return COMMON_VIEWPORTS[Math.floor(Math.random() * COMMON_VIEWPORTS.length)]
}

/**
 * Generate realistic browser headers
 *
 * Based on analysis of real browser requests
 * (publicly available via browser dev tools)
 */
export function generateRealisticHeaders(userAgent?: string): Record<string, string> {
  const ua = userAgent || getRandomUserAgent()

  return {
    'User-Agent': ua,
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'max-age=0',
    'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
  }
}

/**
 * Add random delay to mimic human behavior
 *
 * Research shows humans take 1-3 seconds between actions
 * Source: Human-Computer Interaction studies (public research)
 */
export async function randomDelay(min: number = 1000, max: number = 3000): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min
  await new Promise((resolve) => setTimeout(resolve, delay))
}

/**
 * Playwright/Puppeteer stealth configuration
 *
 * Based on: playwright-extra-plugin-stealth (MIT license)
 * and puppeteer-extra-plugin-stealth (MIT license)
 *
 * These are publicly documented techniques, not reverse engineered
 */
export function getStealthConfig() {
  return {
    // Override navigator properties to look like real browser
    navigator: {
      webdriver: false, // Hide webdriver flag
      languages: ['en-US', 'en'],
      platform: 'Win32',
      hardwareConcurrency: 8,
      deviceMemory: 8,
    },

    // Override permissions API to avoid detection
    permissions: {
      query: async () => ({ state: 'granted' }),
    },

    // Disable automation indicators
    automation: {
      disableWebDriver: true,
      disableAutomationControlled: true,
    },

    // Canvas fingerprinting countermeasures
    canvas: {
      noise: true, // Add slight noise to canvas fingerprints
    },

    // WebGL fingerprinting countermeasures
    webgl: {
      vendor: 'Intel Inc.',
      renderer: 'Intel Iris OpenGL Engine',
    },
  }
}

/**
 * Check robots.txt before scraping (ethical web scraping)
 *
 * This is NOT anti-bot evasion - it's respecting website policies
 */
export async function checkRobotsTxt(url: string, userAgent: string = '*'): Promise<boolean> {
  try {
    const urlObj = new URL(url)
    const robotsTxtUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`

    const response = await fetch(robotsTxtUrl)
    if (!response.ok) return true // No robots.txt = allowed

    const robotsTxt = await response.text()

    // Simple parser - checks if path is disallowed
    // Note: Allow rules can override Disallow rules (more specific wins)
    const lines = robotsTxt.split('\n')
    let relevantSection = false
    let disallowed = false
    let explicitlyAllowed = false

    for (const line of lines) {
      const trimmed = line.trim()

      if (trimmed.startsWith('User-agent:')) {
        const agent = trimmed.split(':')[1]?.trim()
        relevantSection = agent === '*' || agent === userAgent
      }

      if (relevantSection && trimmed.startsWith('Disallow:')) {
        const path = trimmed.split(':')[1]?.trim()
        if (path && urlObj.pathname.startsWith(path)) {
          disallowed = true
        }
      }

      if (relevantSection && trimmed.startsWith('Allow:')) {
        const path = trimmed.split(':')[1]?.trim()
        if (path && urlObj.pathname.startsWith(path)) {
          explicitlyAllowed = true
        }
      }
    }

    // Allow overrides Disallow
    return !disallowed || explicitlyAllowed
  } catch (error) {
    console.warn('Failed to check robots.txt:', error)
    return true // Fail open - allow scraping if robots.txt check fails
  }
}

/**
 * Generate Playwright launch args for stealth mode
 *
 * Based on public Playwright documentation and community best practices
 */
export function getPlaywrightStealthArgs(): string[] {
  return [
    '--disable-blink-features=AutomationControlled', // Hide automation flag
    '--disable-dev-shm-usage', // Overcome limited resource problems
    '--no-sandbox', // Needed for some environments
    '--disable-setuid-sandbox',
    '--disable-web-security', // Avoid CORS issues
    '--disable-features=IsolateOrigins,site-per-process',
    '--disable-gpu', // Disable GPU hardware acceleration
    '--window-size=1920,1080', // Set realistic window size
  ]
}

/**
 * Example: Apply stealth config to Firecrawl request
 */
export function enhanceFirecrawlRequest(baseRequest: any, config: AntiBotConfig = {}) {
  const enhanced = { ...baseRequest }

  // Rotate user agent
  if (config.rotateUserAgents !== false) {
    enhanced.userAgent = getRandomUserAgent()
  }

  // Randomize viewport
  if (config.randomizeViewport !== false) {
    const viewport = getRandomViewport()
    enhanced.viewport = viewport
  }

  // Add realistic headers
  enhanced.headers = {
    ...enhanced.headers,
    ...generateRealisticHeaders(enhanced.userAgent),
    ...config.customHeaders,
  }

  // Add wait time (appear more human)
  if (config.randomDelay) {
    enhanced.waitFor = Math.floor(
      Math.random() * (config.randomDelay.max - config.randomDelay.min + 1) +
        config.randomDelay.min
    )
  }

  return enhanced
}
