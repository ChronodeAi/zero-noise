import ogs from 'open-graph-scraper'
// @ts-ignore - no proper types for oembed-parser
import { extract } from 'oembed-parser'

export interface UrlMetadata {
  url: string
  title?: string
  description?: string
  imageUrl?: string
  siteName?: string
  author?: string // Channel name for YouTube, username for Twitter, etc.
  linkType: 'article' | 'video' | 'social' | 'generic'
}

/**
 * Scrape metadata from a URL using OpenGraph, oEmbed, and fallback methods
 */
export async function scrapeUrl(url: string): Promise<UrlMetadata> {
  // Normalize URL
  const normalizedUrl = normalizeUrl(url)
  
  // Detect link type
  const linkType = detectLinkType(normalizedUrl)
  
  // Extract GitHub username/repo if applicable
  const githubInfo = extractGitHubInfo(normalizedUrl)
  
  try {
    // Try oEmbed first for video platforms (YouTube, Vimeo, etc.)
    if (linkType === 'video') {
      try {
        const oembedData = await extract(normalizedUrl)
        return {
          url: normalizedUrl,
          title: oembedData.title,
          description: oembedData.description,
          imageUrl: oembedData.thumbnail_url,
          siteName: oembedData.provider_name,
          author: oembedData.author_name, // YouTube channel name
          linkType: 'video',
        }
      } catch (err) {
        console.warn('oEmbed extraction failed, falling back to OpenGraph:', err)
      }
    }
    
    // Fallback to OpenGraph scraping
    const { result } = await ogs({ url: normalizedUrl })
    
    return {
      url: normalizedUrl,
      title: result.ogTitle || result.twitterTitle,
      description: result.ogDescription || result.twitterDescription,
      imageUrl: result.ogImage?.[0]?.url || result.twitterImage?.[0]?.url,
      siteName: result.ogSiteName,
      author: result.ogArticleAuthor || result.twitterCreator || githubInfo,
      linkType,
    }
  } catch (error) {
    console.error('URL scraping failed:', error)
    
    // Return minimal metadata if scraping fails
    return {
      url: normalizedUrl,
      title: extractTitleFromUrl(normalizedUrl),
      linkType,
    }
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
