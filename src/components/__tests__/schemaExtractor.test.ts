/**
 * Unit Tests for Schema Extraction
 *
 * Tests JSON-LD, Microdata, and pattern-based extraction
 * from various real-world HTML structures.
 */

import { describe, it, expect } from 'vitest'
import {
  extractJsonLd,
  extractMicrodata,
  extractCommonPatterns,
  extractStructuredData,
  getBestSchema,
} from '@/lib/schemaExtractor'

describe('Schema Extractor - JSON-LD', () => {
  it('should extract JSON-LD Article schema from blog post', () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Understanding Web Scraping",
            "author": {
              "@type": "Person",
              "name": "Jane Developer"
            },
            "datePublished": "2025-10-20",
            "description": "A comprehensive guide to web scraping"
          }
          </script>
        </head>
      </html>
    `

    const schemas = extractJsonLd(html)

    expect(schemas).toHaveLength(1)
    expect(schemas[0].type).toBe('Article')
    expect(schemas[0].properties.headline).toBe('Understanding Web Scraping')
    expect(schemas[0].properties.author.name).toBe('Jane Developer')
    expect(schemas[0].properties.datePublished).toBe('2025-10-20')
  })

  it('should extract JSON-LD Product schema from e-commerce site', () => {
    const html = `
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Wireless Headphones",
        "brand": {
          "@type": "Brand",
          "name": "AudioTech"
        },
        "offers": {
          "@type": "Offer",
          "price": "99.99",
          "priceCurrency": "USD"
        }
      }
      </script>
    `

    const schemas = extractJsonLd(html)

    expect(schemas).toHaveLength(1)
    expect(schemas[0].type).toBe('Product')
    expect(schemas[0].properties.name).toBe('Wireless Headphones')
    expect(schemas[0].properties.brand.name).toBe('AudioTech')
    expect(schemas[0].properties.offers.price).toBe('99.99')
  })

  it('should extract JSON-LD Organization schema', () => {
    const html = `
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Arelion",
        "url": "https://arelion.com",
        "logo": "https://arelion.com/logo.png",
        "description": "Global Tier 1 Internet Service Provider"
      }
      </script>
    `

    const schemas = extractJsonLd(html)

    expect(schemas).toHaveLength(1)
    expect(schemas[0].type).toBe('Organization')
    expect(schemas[0].properties.name).toBe('Arelion')
    expect(schemas[0].properties.url).toBe('https://arelion.com')
  })

  it('should handle multiple JSON-LD schemas in one page', () => {
    const html = `
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "TechCorp"
      }
      </script>
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Latest News"
      }
      </script>
    `

    const schemas = extractJsonLd(html)

    expect(schemas).toHaveLength(2)
    expect(schemas[0].type).toBe('Organization')
    expect(schemas[1].type).toBe('Article')
  })

  it('should handle JSON-LD array format', () => {
    const html = `
      <script type="application/ld+json">
      [
        {
          "@type": "BreadcrumbList",
          "itemListElement": []
        },
        {
          "@type": "Article",
          "headline": "Test Article"
        }
      ]
      </script>
    `

    const schemas = extractJsonLd(html)

    expect(schemas).toHaveLength(2)
    expect(schemas[0].type).toBe('BreadcrumbList')
    expect(schemas[1].type).toBe('Article')
  })

  it('should gracefully handle malformed JSON-LD', () => {
    const html = `
      <script type="application/ld+json">
      { invalid json }
      </script>
    `

    const schemas = extractJsonLd(html)

    // Should not throw error, just return empty array
    expect(schemas).toHaveLength(0)
  })

  it('should ignore JSON-LD without @type field', () => {
    const html = `
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "name": "Test"
      }
      </script>
    `

    const schemas = extractJsonLd(html)

    expect(schemas).toHaveLength(0)
  })

  it('should extract Recipe schema with complex structure', () => {
    const html = `
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Recipe",
        "name": "Chocolate Chip Cookies",
        "author": {
          "@type": "Person",
          "name": "Chef Alice"
        },
        "recipeIngredient": ["flour", "sugar", "chocolate chips"],
        "recipeInstructions": [
          {
            "@type": "HowToStep",
            "text": "Mix ingredients"
          }
        ]
      }
      </script>
    `

    const schemas = extractJsonLd(html)

    expect(schemas).toHaveLength(1)
    expect(schemas[0].type).toBe('Recipe')
    expect(schemas[0].properties.recipeIngredient).toHaveLength(3)
  })
})

describe('Schema Extractor - Microdata', () => {
  it('should extract Microdata Article from HTML5 markup', () => {
    const html = `
      <article itemscope itemtype="http://schema.org/Article">
        <h1 itemprop="name">My Article Title</h1>
        <span itemprop="author">John Doe</span>
        <time itemprop="datePublished" datetime="2025-10-20">Oct 20, 2025</time>
        <meta itemprop="description" content="Article description" />
      </article>
    `

    const schemas = extractMicrodata(html)

    expect(schemas).toHaveLength(1)
    expect(schemas[0].type).toBe('Article')
    expect(schemas[0].properties.name).toBe('My Article Title')
    expect(schemas[0].properties.author).toBe('John Doe')
    expect(schemas[0].properties.datePublished).toBe('2025-10-20')
  })

  it('should extract Microdata Product with nested properties', () => {
    const html = `
      <div itemscope itemtype="http://schema.org/Product">
        <span itemprop="name">Gaming Laptop</span>
        <img itemprop="image" src="/laptop.jpg" />
        <span itemprop="price" content="1299.99">$1,299.99</span>
        <link itemprop="url" href="https://example.com/laptop" />
      </div>
    `

    const schemas = extractMicrodata(html)

    expect(schemas).toHaveLength(1)
    expect(schemas[0].type).toBe('Product')
    expect(schemas[0].properties.name).toBe('Gaming Laptop')
    expect(schemas[0].properties.image).toBe('/laptop.jpg')
    expect(schemas[0].properties.price).toBe('1299.99')
    expect(schemas[0].properties.url).toBe('https://example.com/laptop')
  })

  it('should handle multiple Microdata items on same page', () => {
    const html = `
      <div itemscope itemtype="http://schema.org/Organization">
        <span itemprop="name">TechCorp</span>
      </div>
      <div itemscope itemtype="http://schema.org/Person">
        <span itemprop="name">Jane Smith</span>
      </div>
    `

    const schemas = extractMicrodata(html)

    expect(schemas).toHaveLength(2)
    expect(schemas[0].type).toBe('Organization')
    expect(schemas[1].type).toBe('Person')
  })

  it('should extract property from content attribute', () => {
    const html = `
      <div itemscope itemtype="http://schema.org/Event">
        <meta itemprop="name" content="Tech Conference 2025" />
      </div>
    `

    const schemas = extractMicrodata(html)

    expect(schemas).toHaveLength(1)
    expect(schemas[0].properties.name).toBe('Tech Conference 2025')
  })

  it('should extract property from href attribute', () => {
    const html = `
      <div itemscope itemtype="http://schema.org/WebPage">
        <a itemprop="url" href="https://example.com">Visit Site</a>
      </div>
    `

    const schemas = extractMicrodata(html)

    expect(schemas).toHaveLength(1)
    expect(schemas[0].properties.url).toBe('https://example.com')
  })

  it('should extract property from src attribute', () => {
    const html = `
      <div itemscope itemtype="http://schema.org/ImageObject">
        <img itemprop="contentUrl" src="/photo.jpg" />
      </div>
    `

    const schemas = extractMicrodata(html)

    expect(schemas).toHaveLength(1)
    expect(schemas[0].properties.contentUrl).toBe('/photo.jpg')
  })

  it('should ignore itemscope without itemtype', () => {
    const html = `
      <div itemscope>
        <span itemprop="name">Test</span>
      </div>
    `

    const schemas = extractMicrodata(html)

    expect(schemas).toHaveLength(0)
  })

  it('should extract text content as fallback', () => {
    const html = `
      <div itemscope itemtype="http://schema.org/Book">
        <span itemprop="name">The Great Gatsby</span>
      </div>
    `

    const schemas = extractMicrodata(html)

    expect(schemas).toHaveLength(1)
    expect(schemas[0].properties.name).toBe('The Great Gatsby')
  })
})

describe('Schema Extractor - Common Patterns', () => {
  it('should extract article title from common selectors', () => {
    const html = `
      <article>
        <h1 class="article-title">My Blog Post</h1>
      </article>
    `

    const data = extractCommonPatterns(html)

    expect(data.title).toBe('My Blog Post')
  })

  it('should extract author from rel attribute', () => {
    const html = `
      <a rel="author" class="author-name">John Author</a>
    `

    const data = extractCommonPatterns(html)

    expect(data.author).toBe('John Author')
  })

  it('should extract publish date from time element', () => {
    const html = `
      <time datetime="2025-10-20T10:00:00Z" class="publish-date">Oct 20, 2025</time>
    `

    const data = extractCommonPatterns(html)

    expect(data.publishDate).toBe('2025-10-20T10:00:00Z')
  })

  it('should extract description from meta tag', () => {
    const html = `
      <head>
        <meta name="description" content="This is a great article about web scraping" />
      </head>
    `

    const data = extractCommonPatterns(html)

    expect(data.description).toBe('This is a great article about web scraping')
  })

  it('should extract price from price class', () => {
    const html = `
      <span class="product-price">$49.99</span>
    `

    const data = extractCommonPatterns(html)

    expect(data.price).toBe('$49.99')
  })

  it('should extract logo from img with logo class', () => {
    const html = `
      <div class="site-logo">
        <img src="/logo.png" alt="Company Logo" />
      </div>
    `

    const data = extractCommonPatterns(html)

    expect(data.logo).toBe('/logo.png')
  })

  it('should handle missing patterns gracefully', () => {
    const html = `<div>Just some text</div>`

    const data = extractCommonPatterns(html)

    expect(data).toEqual({})
  })
})

describe('Schema Extractor - Combined Extraction', () => {
  it('should extract all formats from complex page', () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="description" content="Product description" />
          <script type="application/ld+json">
          {
            "@type": "Product",
            "name": "Widget Pro"
          }
          </script>
        </head>
        <body>
          <div itemscope itemtype="http://schema.org/Organization">
            <span itemprop="name">WidgetCo</span>
          </div>
          <span class="price">$99.99</span>
        </body>
      </html>
    `

    const result = extractStructuredData(html)

    expect(result.jsonLd).toHaveLength(1)
    expect(result.jsonLd[0].type).toBe('Product')

    expect(result.microdata).toHaveLength(1)
    expect(result.microdata[0].type).toBe('Organization')

    expect(result.patterns.description).toBe('Product description')
    expect(result.patterns.price).toBe('$99.99')
  })

  it('should prioritize JSON-LD in getBestSchema', () => {
    const html = `
      <script type="application/ld+json">
      {
        "@type": "Article",
        "headline": "JSON-LD Article"
      }
      </script>
      <div itemscope itemtype="http://schema.org/Product">
        <span itemprop="name">Microdata Product</span>
      </div>
    `

    const best = getBestSchema(html)

    expect(best).not.toBeNull()
    expect(best!.type).toBe('Article')
    expect(best!.properties.headline).toBe('JSON-LD Article')
  })

  it('should fallback to Microdata when no JSON-LD', () => {
    const html = `
      <div itemscope itemtype="http://schema.org/Event">
        <span itemprop="name">Tech Conference</span>
      </div>
    `

    const best = getBestSchema(html)

    expect(best).not.toBeNull()
    expect(best!.type).toBe('Event')
    expect(best!.properties.name).toBe('Tech Conference')
  })

  it('should return null when no structured data found', () => {
    const html = `<div>Just plain HTML</div>`

    const best = getBestSchema(html)

    expect(best).toBeNull()
  })
})

describe('Schema Extractor - Real-World Examples', () => {
  it('should extract GitHub repository schema', () => {
    const html = `
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "SoftwareSourceCode",
        "name": "firecrawl",
        "description": "Turn websites into LLM-ready data",
        "author": {
          "@type": "Organization",
          "name": "Firecrawl"
        }
      }
      </script>
    `

    const schemas = extractJsonLd(html)

    expect(schemas).toHaveLength(1)
    expect(schemas[0].type).toBe('SoftwareSourceCode')
    expect(schemas[0].properties.name).toBe('firecrawl')
  })

  it('should extract Medium article schema', () => {
    const html = `
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": "How to Build a Scraper",
        "author": {
          "@type": "Person",
          "name": "Tech Writer"
        },
        "datePublished": "2025-10-15",
        "publisher": {
          "@type": "Organization",
          "name": "Medium"
        }
      }
      </script>
    `

    const schemas = extractJsonLd(html)

    expect(schemas).toHaveLength(1)
    expect(schemas[0].type).toBe('NewsArticle')
    expect(schemas[0].properties.headline).toBe('How to Build a Scraper')
    expect(schemas[0].properties.publisher.name).toBe('Medium')
  })

  it('should extract Amazon product schema', () => {
    const html = `
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Wireless Mouse",
        "image": "https://example.com/mouse.jpg",
        "brand": {
          "@type": "Brand",
          "name": "Logitech"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.5",
          "reviewCount": "1234"
        },
        "offers": {
          "@type": "Offer",
          "price": "29.99",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        }
      }
      </script>
    `

    const schemas = extractJsonLd(html)

    expect(schemas).toHaveLength(1)
    expect(schemas[0].type).toBe('Product')
    expect(schemas[0].properties.brand.name).toBe('Logitech')
    expect(schemas[0].properties.aggregateRating.ratingValue).toBe('4.5')
    expect(schemas[0].properties.offers.price).toBe('29.99')
  })

  it('should handle YouTube video schema', () => {
    const html = `
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        "name": "Web Scraping Tutorial",
        "description": "Learn how to scrape websites",
        "thumbnailUrl": "https://example.com/thumb.jpg",
        "uploadDate": "2025-10-01",
        "duration": "PT15M30S"
      }
      </script>
    `

    const schemas = extractJsonLd(html)

    expect(schemas).toHaveLength(1)
    expect(schemas[0].type).toBe('VideoObject')
    expect(schemas[0].properties.duration).toBe('PT15M30S')
  })
})

describe('Schema Extractor - Edge Cases', () => {
  it('should handle empty HTML', () => {
    const html = ''

    const result = extractStructuredData(html)

    expect(result.jsonLd).toHaveLength(0)
    expect(result.microdata).toHaveLength(0)
    expect(result.patterns).toEqual({})
  })

  it('should handle HTML with no schema markup', () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <body>
          <h1>Plain HTML Page</h1>
          <p>No schema.org markup here</p>
        </body>
      </html>
    `

    const result = extractStructuredData(html)

    expect(result.jsonLd).toHaveLength(0)
    expect(result.microdata).toHaveLength(0)
  })

  it('should handle nested Microdata scopes', () => {
    const html = `
      <div itemscope itemtype="http://schema.org/Review">
        <span itemprop="reviewRating">5</span>
        <div itemprop="itemReviewed" itemscope itemtype="http://schema.org/Product">
          <span itemprop="name">Great Product</span>
        </div>
      </div>
    `

    const schemas = extractMicrodata(html)

    // Should extract both Review and Product
    expect(schemas.length).toBeGreaterThanOrEqual(1)
  })

  it('should handle whitespace in JSON-LD', () => {
    const html = `
      <script type="application/ld+json">

      {
        "@type": "Article",
        "headline": "Test"
      }

      </script>
    `

    const schemas = extractJsonLd(html)

    expect(schemas).toHaveLength(1)
    expect(schemas[0].type).toBe('Article')
  })

  it('should trim whitespace from extracted text', () => {
    const html = `
      <div itemscope itemtype="http://schema.org/Article">
        <h1 itemprop="name">

          Title with Whitespace

        </h1>
      </div>
    `

    const schemas = extractMicrodata(html)

    expect(schemas[0].properties.name).toBe('Title with Whitespace')
  })
})
