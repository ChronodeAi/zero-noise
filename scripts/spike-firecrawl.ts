#!/usr/bin/env tsx
/**
 * Firecrawl PoC Spike Script
 * 
 * Purpose: Compare Firecrawl vs OpenGraph scraping for metadata quality
 * 
 * Acceptance Criteria (ADR-006):
 * - ≥25% reduction in generic titles compared to ogs baseline
 * - ≥90% scraping success rate across test set
 * - p95 latency <5s end-to-end (including fallback)
 * 
 * Output: CSV to .aiwg/testing/test-results-firecrawl.csv
 */

import ogs from 'open-graph-scraper'
import { writeFileSync } from 'fs'
import { join } from 'path'

// Test URLs covering SPA, news, docs, social
const TEST_URLS = [
  // SPAs (known generic title offenders)
  { url: 'https://arelion.com', category: 'SPA', expectedTitle: 'Arelion' },
  { url: 'https://react.dev', category: 'SPA', expectedTitle: 'React' },
  { url: 'https://vuejs.org', category: 'SPA', expectedTitle: 'Vue.js' },
  
  // News/Media
  { url: 'https://www.theverge.com', category: 'News', expectedTitle: 'The Verge' },
  { url: 'https://techcrunch.com', category: 'News', expectedTitle: 'TechCrunch' },
  
  // Docs
  { url: 'https://docs.github.com', category: 'Docs', expectedTitle: 'GitHub Docs' },
  { url: 'https://nextjs.org/docs', category: 'Docs', expectedTitle: 'Next.js Documentation' },
  
  // Social
  { url: 'https://twitter.com/vercel', category: 'Social', expectedTitle: 'Vercel (@vercel)' },
  { url: 'https://github.com/firecrawl/firecrawl', category: 'Code', expectedTitle: 'firecrawl/firecrawl' },
  
  // Blog
  { url: 'https://simonwillison.net', category: 'Blog', expectedTitle: 'Simon Willison' },
]

const GENERIC_TITLES = ['home', 'welcome', 'index', 'homepage', 'main page', 'untitled']

interface ScraperResult {
  url: string
  category: string
  expectedTitle: string
  
  // OpenGraph results
  ogsTitle?: string
  ogsSiteName?: string
  ogsDescription?: string
  ogsImageUrl?: string
  ogsSuccess: boolean
  ogsLatencyMs: number
  ogsIsGeneric: boolean
  
  // Firecrawl results
  firecrawlTitle?: string
  firecrawlSiteName?: string
  firecrawlDescription?: string
  firecrawlImageUrl?: string
  firecrawlSuccess: boolean
  firecrawlLatencyMs: number
  firecrawlIsGeneric: boolean
  
  // Comparison
  winner: 'firecrawl' | 'ogs' | 'tie' | 'both-failed'
  notes: string
}

// Check if title is generic
function isGenericTitle(title?: string): boolean {
  if (!title) return true
  return GENERIC_TITLES.some(generic => 
    title.toLowerCase().trim() === generic
  )
}

// Score metadata quality (0-100)
function scoreMetadata(title?: string, siteName?: string, description?: string, imageUrl?: string): number {
  let score = 0
  if (title && !isGenericTitle(title)) score += 40
  if (siteName) score += 20
  if (description && description.length > 20) score += 20
  if (imageUrl) score += 20
  return score
}

// Scrape with OpenGraph
async function scrapeWithOgs(url: string): Promise<Partial<ScraperResult>> {
  const start = Date.now()
  try {
    const { result } = await ogs({ url, timeout: 5000 })
    const latency = Date.now() - start
    
    const title = result.ogTitle || result.twitterTitle
    const siteName = result.ogSiteName
    
    return {
      ogsTitle: title,
      ogsSiteName: siteName,
      ogsDescription: result.ogDescription || result.twitterDescription,
      ogsImageUrl: result.ogImage?.[0]?.url || result.twitterImage?.[0]?.url,
      ogsSuccess: true,
      ogsLatencyMs: latency,
      ogsIsGeneric: isGenericTitle(title),
    }
  } catch (error) {
    return {
      ogsSuccess: false,
      ogsLatencyMs: Date.now() - start,
      ogsIsGeneric: true,
      notes: `OGS error: ${error instanceof Error ? error.message : 'unknown'}`,
    }
  }
}

// Scrape with Firecrawl (placeholder - requires Firecrawl running)
async function scrapeWithFirecrawl(url: string): Promise<Partial<ScraperResult>> {
  const start = Date.now()
  
  const firecrawlUrl = process.env.FIRECRAWL_BASE_URL || 'http://localhost:3002'
  const apiKey = process.env.FIRECRAWL_API_KEY || ''
  
  try {
    const response = await fetch(`${firecrawlUrl}/v1/scrape`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(5000),
    })
    
    if (!response.ok) {
      throw new Error(`Firecrawl returned ${response.status}`)
    }
    
    const data = await response.json()
    const latency = Date.now() - start
    
    const title = data.metadata?.title || data.metadata?.ogTitle
    const siteName = data.metadata?.siteName || data.metadata?.ogSiteName
    
    return {
      firecrawlTitle: title,
      firecrawlSiteName: siteName,
      firecrawlDescription: data.metadata?.description,
      firecrawlImageUrl: data.metadata?.ogImage || data.metadata?.image,
      firecrawlSuccess: true,
      firecrawlLatencyMs: latency,
      firecrawlIsGeneric: isGenericTitle(title),
    }
  } catch (error) {
    return {
      firecrawlSuccess: false,
      firecrawlLatencyMs: Date.now() - start,
      firecrawlIsGeneric: true,
      notes: `Firecrawl error: ${error instanceof Error ? error.message : 'unknown'}`,
    }
  }
}

// Determine winner based on metadata quality
function determineWinner(result: ScraperResult): 'firecrawl' | 'ogs' | 'tie' | 'both-failed' {
  if (!result.ogsSuccess && !result.firecrawlSuccess) return 'both-failed'
  if (!result.ogsSuccess) return 'firecrawl'
  if (!result.firecrawlSuccess) return 'ogs'
  
  const ogsScore = scoreMetadata(
    result.ogsTitle,
    result.ogsSiteName,
    result.ogsDescription,
    result.ogsImageUrl
  )
  
  const firecrawlScore = scoreMetadata(
    result.firecrawlTitle,
    result.firecrawlSiteName,
    result.firecrawlDescription,
    result.firecrawlImageUrl
  )
  
  if (firecrawlScore > ogsScore) return 'firecrawl'
  if (ogsScore > firecrawlScore) return 'ogs'
  return 'tie'
}

// Convert results to CSV
function resultsToCSV(results: ScraperResult[]): string {
  const headers = [
    'URL',
    'Category',
    'Expected Title',
    'OGS Title',
    'OGS Site Name',
    'OGS Success',
    'OGS Latency (ms)',
    'OGS Generic?',
    'Firecrawl Title',
    'Firecrawl Site Name',
    'Firecrawl Success',
    'Firecrawl Latency (ms)',
    'Firecrawl Generic?',
    'Winner',
    'Notes'
  ].join(',')
  
  const rows = results.map(r => [
    `"${r.url}"`,
    r.category,
    `"${r.expectedTitle}"`,
    `"${r.ogsTitle || ''}"`,
    `"${r.ogsSiteName || ''}"`,
    r.ogsSuccess,
    r.ogsLatencyMs,
    r.ogsIsGeneric,
    `"${r.firecrawlTitle || ''}"`,
    `"${r.firecrawlSiteName || ''}"`,
    r.firecrawlSuccess,
    r.firecrawlLatencyMs,
    r.firecrawlIsGeneric,
    r.winner,
    `"${r.notes || ''}"`
  ].join(','))
  
  return [headers, ...rows].join('\n')
}

// Calculate summary statistics
function calculateSummary(results: ScraperResult[]) {
  const ogsGenericCount = results.filter(r => r.ogsSuccess && r.ogsIsGeneric).length
  const firecrawlGenericCount = results.filter(r => r.firecrawlSuccess && r.firecrawlIsGeneric).length
  
  const ogsSuccessRate = results.filter(r => r.ogsSuccess).length / results.length * 100
  const firecrawlSuccessRate = results.filter(r => r.firecrawlSuccess).length / results.length * 100
  
  const ogsLatencies = results.filter(r => r.ogsSuccess).map(r => r.ogsLatencyMs)
  const firecrawlLatencies = results.filter(r => r.firecrawlSuccess).map(r => r.firecrawlLatencyMs)
  
  const p95 = (arr: number[]) => {
    if (arr.length === 0) return 0
    const sorted = arr.sort((a, b) => a - b)
    const idx = Math.ceil(sorted.length * 0.95) - 1
    return sorted[idx]
  }
  
  const genericReduction = ogsGenericCount > 0
    ? ((ogsGenericCount - firecrawlGenericCount) / ogsGenericCount * 100)
    : 0
  
  return {
    totalUrls: results.length,
    ogsGenericCount,
    firecrawlGenericCount,
    genericReduction,
    ogsSuccessRate,
    firecrawlSuccessRate,
    ogsP95Latency: p95(ogsLatencies),
    firecrawlP95Latency: p95(firecrawlLatencies),
    firecrawlWins: results.filter(r => r.winner === 'firecrawl').length,
    ogsWins: results.filter(r => r.winner === 'ogs').length,
    ties: results.filter(r => r.winner === 'tie').length,
  }
}

// Main execution
async function main() {
  console.log('🔬 Firecrawl PoC Spike Script')
  console.log('=' .repeat(60))
  console.log(`Testing ${TEST_URLS.length} URLs...\n`)
  
  // Check if Firecrawl is accessible
  const firecrawlUrl = process.env.FIRECRAWL_BASE_URL || 'http://localhost:3002'
  console.log(`Firecrawl URL: ${firecrawlUrl}`)
  
  try {
    const healthCheck = await fetch(`${firecrawlUrl}/health`, { 
      signal: AbortSignal.timeout(2000) 
    })
    console.log(`✅ Firecrawl health check: ${healthCheck.status}\n`)
  } catch (err) {
    console.warn(`⚠️  Firecrawl not accessible: ${err instanceof Error ? err.message : 'unknown'}`)
    console.warn('   Firecrawl results will show as failures\n')
  }
  
  const results: ScraperResult[] = []
  
  for (const testUrl of TEST_URLS) {
    console.log(`Testing: ${testUrl.url}`)
    
    const [ogsResult, firecrawlResult] = await Promise.all([
      scrapeWithOgs(testUrl.url),
      scrapeWithFirecrawl(testUrl.url),
    ])
    
    const result: ScraperResult = {
      url: testUrl.url,
      category: testUrl.category,
      expectedTitle: testUrl.expectedTitle,
      ...ogsResult,
      ...firecrawlResult,
      ogsSuccess: ogsResult.ogsSuccess ?? false,
      firecrawlSuccess: firecrawlResult.firecrawlSuccess ?? false,
      ogsLatencyMs: ogsResult.ogsLatencyMs ?? 0,
      firecrawlLatencyMs: firecrawlResult.firecrawlLatencyMs ?? 0,
      ogsIsGeneric: ogsResult.ogsIsGeneric ?? true,
      firecrawlIsGeneric: firecrawlResult.firecrawlIsGeneric ?? true,
      winner: 'tie',
      notes: ogsResult.notes || firecrawlResult.notes || '',
    }
    
    result.winner = determineWinner(result)
    results.push(result)
    
    console.log(`  OGS: ${result.ogsTitle || 'FAILED'} (${result.ogsLatencyMs}ms)`)
    console.log(`  Firecrawl: ${result.firecrawlTitle || 'FAILED'} (${result.firecrawlLatencyMs}ms)`)
    console.log(`  Winner: ${result.winner}\n`)
  }
  
  // Calculate summary
  const summary = calculateSummary(results)
  
  console.log('=' .repeat(60))
  console.log('📊 SUMMARY')
  console.log('=' .repeat(60))
  console.log(`Total URLs tested: ${summary.totalUrls}`)
  console.log(`\n🏷️  Generic Titles:`)
  console.log(`  OGS: ${summary.ogsGenericCount} (${(summary.ogsGenericCount/summary.totalUrls*100).toFixed(1)}%)`)
  console.log(`  Firecrawl: ${summary.firecrawlGenericCount} (${(summary.firecrawlGenericCount/summary.totalUrls*100).toFixed(1)}%)`)
  console.log(`  Reduction: ${summary.genericReduction.toFixed(1)}%`)
  console.log(`\n✅ Success Rates:`)
  console.log(`  OGS: ${summary.ogsSuccessRate.toFixed(1)}%`)
  console.log(`  Firecrawl: ${summary.firecrawlSuccessRate.toFixed(1)}%`)
  console.log(`\n⚡ Latency (p95):`)
  console.log(`  OGS: ${summary.ogsP95Latency}ms`)
  console.log(`  Firecrawl: ${summary.firecrawlP95Latency}ms`)
  console.log(`\n🏆 Winners:`)
  console.log(`  Firecrawl: ${summary.firecrawlWins}`)
  console.log(`  OGS: ${summary.ogsWins}`)
  console.log(`  Ties: ${summary.ties}`)
  
  // Acceptance criteria check
  console.log('\n' + '='.repeat(60))
  console.log('✅ ACCEPTANCE CRITERIA (ADR-006)')
  console.log('=' .repeat(60))
  
  const criteriaGenericReduction = summary.genericReduction >= 25
  const criteriaSuccessRate = summary.firecrawlSuccessRate >= 90
  const criteriaLatency = summary.firecrawlP95Latency <= 5000
  
  console.log(`${criteriaGenericReduction ? '✅' : '❌'} Generic title reduction ≥25%: ${summary.genericReduction.toFixed(1)}%`)
  console.log(`${criteriaSuccessRate ? '✅' : '❌'} Success rate ≥90%: ${summary.firecrawlSuccessRate.toFixed(1)}%`)
  console.log(`${criteriaLatency ? '✅' : '❌'} P95 latency ≤5s: ${summary.firecrawlP95Latency}ms`)
  
  const allCriteriaMet = criteriaGenericReduction && criteriaSuccessRate && criteriaLatency
  console.log(`\n${allCriteriaMet ? '🎉 ALL CRITERIA MET' : '⚠️  SOME CRITERIA NOT MET'}`)
  
  // Save to CSV
  const csv = resultsToCSV(results)
  const outputPath = join(process.cwd(), '.aiwg', 'testing', 'test-results-firecrawl.csv')
  writeFileSync(outputPath, csv, 'utf-8')
  console.log(`\n📄 Results saved to: ${outputPath}`)
  
  // Save summary
  const summaryPath = join(process.cwd(), '.aiwg', 'testing', 'test-results-firecrawl-summary.txt')
  const summaryText = `
Firecrawl PoC Spike Results
Generated: ${new Date().toISOString()}

SUMMARY STATISTICS
==================
Total URLs: ${summary.totalUrls}

Generic Titles:
  OGS: ${summary.ogsGenericCount} (${(summary.ogsGenericCount/summary.totalUrls*100).toFixed(1)}%)
  Firecrawl: ${summary.firecrawlGenericCount} (${(summary.firecrawlGenericCount/summary.totalUrls*100).toFixed(1)}%)
  Reduction: ${summary.genericReduction.toFixed(1)}%

Success Rates:
  OGS: ${summary.ogsSuccessRate.toFixed(1)}%
  Firecrawl: ${summary.firecrawlSuccessRate.toFixed(1)}%

Latency (p95):
  OGS: ${summary.ogsP95Latency}ms
  Firecrawl: ${summary.firecrawlP95Latency}ms

Winners:
  Firecrawl: ${summary.firecrawlWins}
  OGS: ${summary.ogsWins}
  Ties: ${summary.ties}

ACCEPTANCE CRITERIA (ADR-006)
==============================
${criteriaGenericReduction ? '✅' : '❌'} Generic title reduction ≥25%: ${summary.genericReduction.toFixed(1)}%
${criteriaSuccessRate ? '✅' : '❌'} Success rate ≥90%: ${summary.firecrawlSuccessRate.toFixed(1)}%
${criteriaLatency ? '✅' : '❌'} P95 latency ≤5s: ${summary.firecrawlP95Latency}ms

Result: ${allCriteriaMet ? 'ALL CRITERIA MET ✅' : 'SOME CRITERIA NOT MET ⚠️'}
`.trim()
  
  writeFileSync(summaryPath, summaryText, 'utf-8')
  console.log(`📄 Summary saved to: ${summaryPath}`)
  
  process.exit(allCriteriaMet ? 0 : 1)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
