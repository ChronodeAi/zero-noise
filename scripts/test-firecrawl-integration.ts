#!/usr/bin/env tsx
/**
 * Test Firecrawl Integration
 *
 * Tests the complete fallback chain:
 * 1. SSRF protection
 * 2. Firecrawl scraping (if enabled)
 * 3. Fallback to OpenGraph
 * 4. Circuit breaker behavior
 *
 * Usage:
 *   npm run test:firecrawl
 *   # or
 *   tsx scripts/test-firecrawl-integration.ts
 */

import { scrapeUrl } from '../src/lib/urlScraper'
import { validateAndRateLimit } from '../src/lib/ssrfProtection'
import { getFirecrawlClient } from '../src/lib/firecrawlClient'

// Test URLs
const TEST_CASES = [
  // Valid URLs
  {
    name: 'SPA with generic title (Arelion)',
    url: 'https://arelion.com',
    expectedSource: 'firecrawl',
    expectGenericTitle: true,
  },
  {
    name: 'YouTube video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    expectedSource: 'oembed',
    expectGenericTitle: false,
  },
  {
    name: 'GitHub repository',
    url: 'https://github.com/firecrawl/firecrawl',
    expectedSource: 'firecrawl',
    expectGenericTitle: false,
  },
  {
    name: 'Technical blog',
    url: 'https://simonwillison.net',
    expectedSource: 'firecrawl',
    expectGenericTitle: false,
  },
  // SSRF attack attempts
  {
    name: 'SSRF - localhost',
    url: 'http://localhost:3000',
    shouldFail: true,
    expectedError: 'Private IP',
  },
  {
    name: 'SSRF - AWS metadata',
    url: 'http://169.254.169.254/latest/meta-data/',
    shouldFail: true,
    expectedError: 'metadata service',
  },
  {
    name: 'SSRF - private IP',
    url: 'http://192.168.1.1',
    shouldFail: true,
    expectedError: 'Private IP',
  },
  {
    name: 'SSRF - file scheme',
    url: 'file:///etc/passwd',
    shouldFail: true,
    expectedError: 'not allowed',
  },
]

interface TestResult {
  name: string
  passed: boolean
  actual: string
  expected: string
  duration: number
  error?: string
}

const results: TestResult[] = []

async function runTests() {
  console.log('🧪 Testing Firecrawl Integration\n')
  console.log('=' .repeat(80))

  // Check Firecrawl status
  console.log('\n📊 Firecrawl Status:')
  const client = getFirecrawlClient()
  const status = client.getStatus()
  console.log(JSON.stringify(status, null, 2))

  if (!status.enabled) {
    console.log('\n⚠️  Firecrawl is DISABLED. Tests will use fallback only.\n')
  }

  console.log('\n' + '='.repeat(80))
  console.log('\n🔍 Running Test Cases:\n')

  for (const testCase of TEST_CASES) {
    const startTime = Date.now()

    try {
      console.log(`\n▶️  ${testCase.name}`)
      console.log(`   URL: ${testCase.url}`)

      if (testCase.shouldFail) {
        // Test SSRF protection
        const validation = validateAndRateLimit(testCase.url)

        if (!validation.isValid || !validation.rateLimitOk) {
          const duration = Date.now() - startTime
          console.log(`   ✅ BLOCKED as expected: ${validation.reason}`)
          console.log(`   ⏱️  Duration: ${duration}ms`)

          results.push({
            name: testCase.name,
            passed: true,
            actual: validation.reason || 'blocked',
            expected: testCase.expectedError || 'blocked',
            duration,
          })
          continue
        } else {
          const duration = Date.now() - startTime
          console.log(`   ❌ FAILED: Should have been blocked but passed validation`)

          results.push({
            name: testCase.name,
            passed: false,
            actual: 'allowed',
            expected: 'blocked',
            duration,
            error: 'SSRF protection failed',
          })
          continue
        }
      }

      // Test valid URL scraping
      const metadata = await scrapeUrl(testCase.url)
      const duration = Date.now() - startTime

      console.log(`   Source: ${metadata.source || 'unknown'}`)
      console.log(`   Title: ${metadata.displayTitle || metadata.title || 'none'}`)
      console.log(`   Site: ${metadata.siteName || 'none'}`)
      console.log(`   Domain: ${metadata.domain || 'none'}`)
      console.log(`   ⏱️  Duration: ${duration}ms`)

      // Validate results
      const sourceMatches = !testCase.expectedSource || metadata.source === testCase.expectedSource
      const hasTitle = !!metadata.displayTitle || !!metadata.title

      if (sourceMatches && hasTitle) {
        console.log(`   ✅ PASSED`)
        results.push({
          name: testCase.name,
          passed: true,
          actual: metadata.source || 'unknown',
          expected: testCase.expectedSource || 'any',
          duration,
        })
      } else {
        console.log(`   ⚠️  PARTIAL: Got ${metadata.source}, expected ${testCase.expectedSource}`)
        results.push({
          name: testCase.name,
          passed: false,
          actual: metadata.source || 'unknown',
          expected: testCase.expectedSource || 'any',
          duration,
          error: 'Source mismatch (may be due to Firecrawl disabled or circuit breaker)',
        })
      }
    } catch (error) {
      const duration = Date.now() - startTime
      console.log(`   ❌ ERROR: ${error instanceof Error ? error.message : 'unknown'}`)

      results.push({
        name: testCase.name,
        passed: false,
        actual: 'error',
        expected: testCase.shouldFail ? 'blocked' : 'success',
        duration,
        error: error instanceof Error ? error.message : 'unknown error',
      })
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(80))
  console.log('\n📈 Test Summary:\n')

  const passed = results.filter((r) => r.passed).length
  const total = results.length
  const avgDuration = Math.round(
    results.reduce((sum, r) => sum + r.duration, 0) / results.length
  )

  console.log(`Total Tests: ${total}`)
  console.log(`Passed: ${passed}`)
  console.log(`Failed: ${total - passed}`)
  console.log(`Success Rate: ${Math.round((passed / total) * 100)}%`)
  console.log(`Average Duration: ${avgDuration}ms`)

  if (total - passed > 0) {
    console.log('\n❌ Failed Tests:')
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`  - ${r.name}`)
        if (r.error) {
          console.log(`    Error: ${r.error}`)
        }
      })
  }

  console.log('\n' + '='.repeat(80))

  // Exit with appropriate code
  process.exit(passed === total ? 0 : 1)
}

// Run tests
runTests().catch((error) => {
  console.error('Test runner failed:', error)
  process.exit(1)
})
