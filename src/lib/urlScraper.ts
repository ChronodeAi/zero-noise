import ogs from 'open-graph-scraper'
// @ts-ignore - no proper types for oembed-parser
import { extract } from 'oembed-parser'
import { validateAndRateLimit } from './ssrfProtection'
import { extractStructuredData, getBestSchema } from './schemaExtractor'
import { recordScraperRequest, recordSchemaExtraction } from './metrics'

export interface UrlMetadata {
  url: string
  title?: string
  displayTitle?: string  // User-facing title (prefers site_name over generic)
  originalTitle?: string // Original scraped title (for search indexing)
  description?: string
  imageUrl?: string
  siteName?: string
  author?: string // Channel name for YouTube, username for Twitter, etc.
  linkType: 'article' | 'video' | 'social' | 'generic'
  domain?: string // Domain for search indexing
  source?: 'firecrawl' | 'oembed' | 'ogs' | 'fallback' // Source of metadata
  structuredData?: {
    jsonLd?: any[]
    microdata?: any[]
    patterns?: Record<string, any>
  } // Schema.org structured data
}

/**
 * Generic titles that should prefer siteName
 */
const GENERIC_TITLES = ['home', 'welcome', 'index', 'homepage', 'main page', 'untitled', 'landing']

function isGenericTitle(title: string | undefined): boolean {
  if (!title) return false
  const lowerTitle = title.toLowerCase().trim()
  return GENERIC_TITLES.some(generic => lowerTitle === generic || lowerTitle.startsWith(generic + ' '))
}

/**
 * Choose best display title (ADR-006 policy)
 */
function selectDisplayTitle(title: string | undefined, siteName: string | undefined): string | undefined {
  // If title is generic but siteName exists, prefer siteName
  if (isGenericTitle(title) && siteName) {
    return siteName
  }
  return title || siteName
}

/**
 * Scrape metadata from a URL using Firecrawl, OpenGraph, oEmbed, and fallback methods
 *
 * ADR-006 Fallback Chain:
 * 1. Firecrawl (JS-rendered, structured metadata)
 * 2. oEmbed (for video platforms)
 * 3. OpenGraph (ogs library)
 * 4. Heuristic fallback (extract from URL)
 */
export async function scrapeUrl(url: string): Promise<UrlMetadata> {
  const startTime = Date.now()
  let source: string = 'fallback'

  // CRITICAL: SSRF Protection
  const validation = validateAndRateLimit(url)
  if (!validation.isValid || !validation.rateLimitOk) {
    throw new Error(`URL validation failed: ${validation.reason}`)
  }

  // Use sanitized URL
  const normalizedUrl = validation.sanitizedUrl!

  // Detect link type
  const linkType = detectLinkType(normalizedUrl)

  // Extract GitHub username/repo if applicable
  const githubInfo = extractGitHubInfo(normalizedUrl)

  // Extract domain for search indexing
  const domain = extractDomain(normalizedUrl)

  try {
    // STEP 1: Try Firecrawl for non-video links (ADR-006)
    if (linkType !== 'video') {
      const firecrawlResult = await tryFirecrawl(normalizedUrl)
      if (firecrawlResult) {
        source = 'firecrawl'
        const displayTitle = selectDisplayTitle(firecrawlResult.title, firecrawlResult.siteName)
        const isGeneric = isGenericTitle(firecrawlResult.title)
        const durationMs = Date.now() - startTime

        // Record metrics
        recordScraperRequest(source, 'success', durationMs, isGeneric)

        // Track schema extraction if present
        if (firecrawlResult.structuredData) {
          recordSchemaExtraction('jsonld', (firecrawlResult.structuredData.jsonLd?.length || 0) > 0)
          recordSchemaExtraction('microdata', (firecrawlResult.structuredData.microdata?.length || 0) > 0)
          recordSchemaExtraction('patterns', Object.keys(firecrawlResult.structuredData.patterns || {}).length > 0)
        }

        return {
          ...firecrawlResult,
          displayTitle,
          originalTitle: firecrawlResult.title,
          domain,
          author: firecrawlResult.author || githubInfo,
        }
      }
    }

    // STEP 2: Try oEmbed first for video platforms (YouTube, Vimeo, etc.)
    if (linkType === 'video') {
      try {
        const oembedData = await extract(normalizedUrl)
        const title = oembedData.title
        const siteName = oembedData.provider_name
        const isGeneric = isGenericTitle(title)
        const durationMs = Date.now() - startTime
        source = 'oembed'

        // Record metrics
        recordScraperRequest(source, 'success', durationMs, isGeneric)

        return {
          url: normalizedUrl,
          title,
          displayTitle: selectDisplayTitle(title, siteName),
          originalTitle: title,
          description: oembedData.description,
          imageUrl: oembedData.thumbnail_url,
          siteName,
          author: oembedData.author_name, // YouTube channel name
          linkType: 'video',
          domain,
          source: 'oembed',
        }
      } catch (err) {
        console.warn('[Scraper] oEmbed extraction failed, falling back to OpenGraph:', err)
      }
    }

    // STEP 3: Fallback to OpenGraph scraping
    const { result } = await ogs({ url: normalizedUrl })

    const title = result.ogTitle || result.twitterTitle
    const siteName = result.ogSiteName
    const isGeneric = isGenericTitle(title)
    const durationMs = Date.now() - startTime
    source = 'ogs'

    // Record metrics
    recordScraperRequest(source, 'success', durationMs, isGeneric)

    return {
      url: normalizedUrl,
      title,
      displayTitle: selectDisplayTitle(title, siteName),
      originalTitle: title,
      description: result.ogDescription || result.twitterDescription,
      imageUrl: result.ogImage?.[0]?.url || result.twitterImage?.[0]?.url,
      siteName,
      author: result.ogArticleAuthor || result.twitterCreator || githubInfo,
      linkType,
      domain,
      source: 'ogs',
    }
  } catch (error) {
    console.error('[Scraper] All scraping methods failed:', error)

    // Record failure metrics
    const durationMs = Date.now() - startTime
    recordScraperRequest(source, 'failure', durationMs, false)

    // STEP 4: Return heuristic fallback if all scraping fails
    const fallbackTitle = extractTitleFromUrl(normalizedUrl)
    const fallbackDuration = Date.now() - startTime
    recordScraperRequest('fallback', 'success', fallbackDuration, false)

    return {
      url: normalizedUrl,
      title: fallbackTitle,
      displayTitle: fallbackTitle,
      originalTitle: fallbackTitle,
      linkType,
      domain,
      source: 'fallback',
    }
  }
}

/**
 * Try Firecrawl scraping (ADR-006)
 */
async function tryFirecrawl(url: string): Promise<UrlMetadata | null> {
  try {
    const { getFirecrawlClient } = await import('./firecrawlClient')
    const client = getFirecrawlClient()
    const response = await client.scrape(url)

    if (!response || !response.success || !response.data) {
      return null
    }

    const metadata = response.data.metadata
    if (!metadata) {
      return null
    }

    // Extract structured data from HTML if available
    let structuredDataResult
    let enrichedAuthor: string | undefined = undefined
    let enrichedTitle = metadata.ogTitle || metadata.title

    if (response.data.html) {
      try {
        structuredDataResult = extractStructuredData(response.data.html)
        const bestSchema = getBestSchema(response.data.html)

        // Enrich metadata with schema.org data
        if (bestSchema) {
          // Extract author from schema
          if (!enrichedAuthor && bestSchema.properties.author) {
            if (typeof bestSchema.properties.author === 'string') {
              enrichedAuthor = bestSchema.properties.author
            } else if (bestSchema.properties.author.name) {
              enrichedAuthor = bestSchema.properties.author.name
            }
          }

          // Use schema title if better than metadata title
          if (bestSchema.properties.headline || bestSchema.properties.name) {
            const schemaTitle = bestSchema.properties.headline || bestSchema.properties.name
            if (!isGenericTitle(schemaTitle)) {
              enrichedTitle = schemaTitle
            }
          }
        }
      } catch (error) {
        console.warn('[Scraper] Structured data extraction failed:', error)
      }
    }

    return {
      url,
      title: enrichedTitle,
      description: metadata.ogDescription || metadata.description,
      imageUrl: metadata.ogImage,
      siteName: metadata.ogSiteName,
      author: enrichedAuthor,
      linkType: detectLinkType(url),
      source: 'firecrawl',
      structuredData: structuredDataResult,
    }
  } catch (error) {
    console.error('[Scraper] Firecrawl import/execution failed:', error)
    return null
  }
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return ''
  }
}

/**
 * Scrape multiple URLs in parallel
 */
export async function scrapeUrls(urls: string[]): Promise<UrlMetadata[]> {
  const results = await Promise.allSettled(
    urls.map((url) => scrapeUrl(url))
  )
  
  return results
    .filter((result): result is PromiseFulfilledResult<UrlMetadata> => result.status === 'fulfilled')
    .map((result) => result.value)
}

/**
 * Normalize URL (add protocol if missing, trim whitespace)
 */
function normalizeUrl(url: string): string {
  let normalized = url.trim()
  
  // Add https:// if no protocol
  if (!normalized.match(/^https?:\/\//i)) {
    normalized = `https://${normalized}`
  }
  
  return normalized
}

/**
 * Detect link type based on URL patterns
 */
function detectLinkType(url: string): 'article' | 'video' | 'social' | 'generic' {
  const urlLower = url.toLowerCase()
  
  // Video platforms
  if (
    urlLower.includes('youtube.com') ||
    urlLower.includes('youtu.be') ||
    urlLower.includes('vimeo.com') ||
    urlLower.includes('dailymotion.com') ||
    urlLower.includes('twitch.tv')
  ) {
    return 'video'
  }
  
  // Social media
  if (
    urlLower.includes('twitter.com') ||
    urlLower.includes('x.com') ||
    urlLower.includes('facebook.com') ||
    urlLower.includes('instagram.com') ||
    urlLower.includes('linkedin.com') ||
    urlLower.includes('reddit.com')
  ) {
    return 'social'
  }
  
  // News/blog domains (common patterns)
  if (
    urlLower.includes('medium.com') ||
    urlLower.includes('substack.com') ||
    urlLower.includes('blog.') ||
    urlLower.includes('/article/') ||
    urlLower.includes('/post/')
  ) {
    return 'article'
  }
  
  return 'generic'
}

/**
 * Extract GitHub username and repo name from URL
 */
function extractGitHubInfo(url: string): string | undefined {
  try {
    const urlObj = new URL(url)
    if (urlObj.hostname === 'github.com') {
      // Extract username and repo from path like /username/repo
      const pathParts = urlObj.pathname.split('/').filter(Boolean)
      if (pathParts.length >= 2) {
        return `${pathParts[0]}/${pathParts[1]}`
      }
      // Just username
      if (pathParts.length === 1) {
        return pathParts[0]
      }
    }
  } catch {
    // Ignore parse errors
  }
  return undefined
}

/**
 * Extract a basic title from URL if scraping fails
 */
function extractTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    
    // Get last path segment
    const segments = pathname.split('/').filter(Boolean)
    const lastSegment = segments[segments.length - 1] || urlObj.hostname
    
    // Clean up (remove file extension, replace dashes/underscores with spaces)
    return lastSegment
      .replace(/\.[^.]+$/, '') // Remove extension
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()) // Title case
  } catch {
    return url
  }
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const normalized = normalizeUrl(url)
    new URL(normalized)
    return true
  } catch {
    return false
  }
}
