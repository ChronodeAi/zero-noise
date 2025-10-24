/**
 * Schema Extraction - Legal Open Source Implementation
 *
 * Extract structured data from web pages using:
 * - JSON-LD (schema.org markup)
 * - Microdata
 * - RDFa
 * - Open Graph tags
 *
 * Uses: cheerio (MIT license) for HTML parsing
 */

import * as cheerio from 'cheerio'

export interface ExtractedSchema {
  type: string // e.g., "Article", "Product", "Organization"
  properties: Record<string, any>
  raw?: any // Raw schema.org JSON-LD
}

/**
 * Extract JSON-LD structured data from HTML
 *
 * JSON-LD is the recommended format by Google and schema.org
 * Example: <script type="application/ld+json">{ "@type": "Article", ... }</script>
 */
export function extractJsonLd(html: string): ExtractedSchema[] {
  const $ = cheerio.load(html)
  const schemas: ExtractedSchema[] = []

  // Find all JSON-LD script tags
  $('script[type="application/ld+json"]').each((_, element) => {
    try {
      const jsonText = $(element).html()
      if (!jsonText) return

      const data = JSON.parse(jsonText)

      // Handle arrays of schemas
      const items = Array.isArray(data) ? data : [data]

      items.forEach((item) => {
        if (item['@type']) {
          schemas.push({
            type: item['@type'],
            properties: item,
            raw: item,
          })
        }
      })
    } catch (error) {
      console.warn('Failed to parse JSON-LD:', error)
    }
  })

  return schemas
}

/**
 * Extract Microdata (HTML5 semantic markup)
 *
 * Example:
 * <div itemscope itemtype="http://schema.org/Article">
 *   <h1 itemprop="name">Article Title</h1>
 * </div>
 */
export function extractMicrodata(html: string): ExtractedSchema[] {
  const $ = cheerio.load(html)
  const schemas: ExtractedSchema[] = []

  $('[itemscope]').each((_, element) => {
    const $elem = $(element)
    const itemType = $elem.attr('itemtype')

    if (!itemType) return

    const type = itemType.split('/').pop() || 'Unknown'
    const properties: Record<string, any> = {}

    // Extract all properties
    $elem.find('[itemprop]').each((_, propElement) => {
      const $prop = $(propElement)
      const propName = $prop.attr('itemprop')
      if (!propName) return

      // Get value based on element type
      let value: string | undefined
      if ($prop.attr('content')) {
        value = $prop.attr('content')
      } else if ($prop.attr('datetime')) {
        // Prioritize datetime attribute for time elements
        value = $prop.attr('datetime')
      } else if ($prop.attr('href')) {
        value = $prop.attr('href')
      } else if ($prop.attr('src')) {
        value = $prop.attr('src')
      } else {
        value = $prop.text().trim()
      }

      properties[propName] = value
    })

    if (Object.keys(properties).length > 0) {
      schemas.push({ type, properties })
    }
  })

  return schemas
}

/**
 * Extract common structured data patterns
 *
 * This is a custom heuristic extractor for common patterns
 * not covered by schema.org markup
 */
export function extractCommonPatterns(html: string): Record<string, any> {
  const $ = cheerio.load(html)
  const data: Record<string, any> = {}

  // Article patterns
  const articleSelectors = {
    title: 'article h1, .article-title, [class*="headline"]',
    author: '[rel="author"], .author-name, [class*="author"]',
    publishDate: 'time[datetime], .publish-date, [class*="date"]',
    description: 'meta[name="description"]',
  }

  Object.entries(articleSelectors).forEach(([key, selector]) => {
    const $elem = $(selector).first()
    if ($elem.length) {
      data[key] = $elem.attr('datetime') || $elem.attr('content') || $elem.text().trim()
    }
  })

  // Product patterns
  const priceSelector = '[class*="price"], .price, [itemprop="price"]'
  const $price = $(priceSelector).first()
  if ($price.length) {
    data.price = $price.text().trim()
  }

  // Organization patterns
  const logoSelector = '[class*="logo"] img, .site-logo img, [itemprop="logo"]'
  const $logo = $(logoSelector).first()
  if ($logo.length) {
    data.logo = $logo.attr('src')
  }

  return data
}

/**
 * Main extraction function - combines all methods
 */
export function extractStructuredData(html: string): {
  jsonLd: ExtractedSchema[]
  microdata: ExtractedSchema[]
  patterns: Record<string, any>
} {
  return {
    jsonLd: extractJsonLd(html),
    microdata: extractMicrodata(html),
    patterns: extractCommonPatterns(html),
  }
}

/**
 * Get best structured data (prioritize JSON-LD > Microdata > Patterns)
 */
export function getBestSchema(html: string): ExtractedSchema | null {
  const { jsonLd, microdata } = extractStructuredData(html)

  // Prefer JSON-LD (most reliable)
  if (jsonLd.length > 0) {
    return jsonLd[0]
  }

  // Fallback to Microdata
  if (microdata.length > 0) {
    return microdata[0]
  }

  return null
}
