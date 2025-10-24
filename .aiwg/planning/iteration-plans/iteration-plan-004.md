# Iteration Plan 004: Feature Integration & Production Deployment

**Project**: Zero Noise - URL Metadata Scraping Platform
**Phase**: Construction
**Iteration**: Sprint 4
**Duration**: 2 weeks (10 business days)
**Start Date**: 2025-10-23
**End Date**: 2025-11-05

---

## Sprint Goal

**Primary Objective**: Integrate legal feature enhancements (schema extraction, anti-bot strategies, retry logic) with Firecrawl, establish production monitoring, and deploy complete system to VPS + Vercel production.

**Success Criteria**:
- ✅ All legal features have >90% unit test coverage
- ✅ Firecrawl client uses retry strategies and anti-bot enhancements
- ✅ Schema extraction integrated into metadata pipeline
- ✅ Prometheus metrics tracking scraping performance
- ✅ Grafana dashboard visualizing scraper health
- ✅ Firecrawl deployed to Contabo VPS with <5s p95 latency
- ✅ Production deployment on Vercel with >90% success rate
- ✅ Circuit breaker validated under load

---

## Sprint Backlog

### Epic 1: Testing Legal Features (5 story points)

#### US-4.1: Unit Tests for Schema Extraction
**As a** developer
**I want** comprehensive unit tests for schema extraction
**So that** I can ensure reliable structured data parsing from web pages

**Acceptance Criteria**:
- [ ] Tests cover JSON-LD extraction from various websites
- [ ] Tests cover Microdata extraction (itemscope, itemprop)
- [ ] Tests validate extraction from real-world HTML samples (GitHub, Medium, Amazon)
- [ ] Tests handle malformed JSON-LD gracefully
- [ ] Tests validate getBestSchema() priority logic (JSON-LD > Microdata > Patterns)
- [ ] Coverage: >90% for `src/lib/schemaExtractor.ts`

**Story Points**: 2
**Priority**: High
**Dependencies**: None

**Test Cases to Implement**:
```typescript
describe('Schema Extractor', () => {
  it('should extract JSON-LD Article schema from blog post')
  it('should extract JSON-LD Product schema from e-commerce site')
  it('should extract Microdata from HTML5 semantic markup')
  it('should handle multiple JSON-LD schemas in one page')
  it('should gracefully handle malformed JSON-LD')
  it('should prioritize JSON-LD over Microdata')
  it('should extract common patterns as fallback')
  it('should detect generic titles (Home, Welcome, etc.)')
})
```

**Files to Create**:
- `src/components/__tests__/schemaExtractor.test.ts`

---

#### US-4.2: Unit Tests for Anti-Bot Strategies
**As a** developer
**I want** unit tests for anti-bot evasion techniques
**So that** I can verify realistic browser behavior without detection

**Acceptance Criteria**:
- [ ] Tests validate user agent rotation (5+ different UAs)
- [ ] Tests validate viewport randomization (5+ common sizes)
- [ ] Tests validate realistic header generation (Accept, Accept-Language, Sec-Ch-Ua)
- [ ] Tests validate robots.txt parsing and compliance
- [ ] Tests validate random delay range (1000-3000ms)
- [ ] Tests validate enhanceFirecrawlRequest() adds stealth config
- [ ] Coverage: >90% for `src/lib/antiBotStrategies.ts`

**Story Points**: 2
**Priority**: High
**Dependencies**: None

**Test Cases to Implement**:
```typescript
describe('Anti-Bot Strategies', () => {
  it('should return different user agents on rotation')
  it('should generate realistic Chrome headers')
  it('should generate realistic Firefox headers')
  it('should randomize viewport sizes within common ranges')
  it('should parse robots.txt and allow permitted paths')
  it('should parse robots.txt and disallow restricted paths')
  it('should respect User-agent: * in robots.txt')
  it('should add random delays between requests')
  it('should enhance Firecrawl request with stealth config')
})
```

**Files to Create**:
- `src/components/__tests__/antiBotStrategies.test.ts`

---

#### US-4.3: Unit Tests for Retry Strategies
**As a** developer
**I want** unit tests for exponential backoff retry logic
**So that** I can ensure reliable error recovery and avoid cascading failures

**Acceptance Criteria**:
- [ ] Tests validate exponential backoff calculation (2^n progression)
- [ ] Tests validate jitter randomization (0.5-1.5x delay)
- [ ] Tests validate max delay cap (30s default)
- [ ] Tests validate retryable vs non-retryable errors
- [ ] Tests validate HTTP-specific retry logic (only idempotent methods)
- [ ] Tests validate timeout wrapper (10s default)
- [ ] Tests validate AdaptiveRetry adjusts based on error rate
- [ ] Coverage: >90% for `src/lib/retryStrategies.ts`

**Story Points**: 1
**Priority**: High
**Dependencies**: None

**Test Cases to Implement**:
```typescript
describe('Retry Strategies', () => {
  it('should retry on 500 Internal Server Error')
  it('should retry on 503 Service Unavailable')
  it('should NOT retry on 400 Bad Request')
  it('should NOT retry on 401 Unauthorized')
  it('should apply exponential backoff (1s, 2s, 4s, 8s)')
  it('should apply jitter to backoff delays')
  it('should cap delay at maxDelay')
  it('should stop after maxRetries attempts')
  it('should only retry idempotent HTTP methods (GET, PUT, DELETE)')
  it('should warn on non-idempotent retry (POST)')
  it('should timeout after configured duration')
  it('should track retry attempts and total duration')
})
```

**Files to Create**:
- `src/components/__tests__/retryStrategies.test.ts`

---

### Epic 2: Feature Integration (8 story points)

#### US-4.4: Integrate Schema Extraction with Firecrawl
**As a** user
**I want** schema extraction to run on Firecrawl responses
**So that** I can enrich metadata with structured data (author, publish date, product info)

**Acceptance Criteria**:
- [ ] Firecrawl HTML responses automatically parsed for structured data
- [ ] Schema extraction results stored in `urlMetadata` database table
- [ ] JSON-LD schemas stored as JSONB column in Postgres
- [ ] UI displays author, publish date, and product price (if available)
- [ ] Admin panel shows schema extraction stats (% of URLs with structured data)
- [ ] Fallback to heuristic extraction if no schema.org markup found

**Story Points**: 3
**Priority**: High
**Dependencies**: US-4.1 (schema tests)

**Implementation Tasks**:
1. Add `structuredData` JSONB column to `urlMetadata` table (Prisma migration)
2. Modify `src/lib/urlScraper.ts` to call `extractStructuredData()` on Firecrawl HTML
3. Store extracted schema in database alongside existing metadata
4. Update `src/app/api/scrape-url/route.ts` to return `structuredData` field
5. Update frontend to display author, publishDate, price (if present)

**Files to Modify**:
- `prisma/schema.prisma` (add structuredData field)
- `src/lib/urlScraper.ts` (integrate schema extraction)
- `src/app/api/scrape-url/route.ts` (return structured data)

**Database Migration**:
```sql
ALTER TABLE "UrlMetadata"
ADD COLUMN "structuredData" JSONB DEFAULT NULL;
```

---

#### US-4.5: Integrate Retry Strategies with Firecrawl Client
**As a** system administrator
**I want** automatic retry on transient Firecrawl failures
**So that** we maximize scraping success rate despite network glitches

**Acceptance Criteria**:
- [ ] Firecrawl requests use `retryWithBackoff()` wrapper
- [ ] Retry on 429 (rate limit), 500, 502, 503, 504 errors
- [ ] Do NOT retry on 400 (bad request) or 403 (forbidden)
- [ ] Max 3 retries with exponential backoff (1s, 2s, 4s)
- [ ] Jitter applied to avoid thundering herd
- [ ] Circuit breaker still triggers after retries exhausted
- [ ] Metrics track retry attempts and success rate improvement

**Story Points**: 2
**Priority**: High
**Dependencies**: US-4.3 (retry tests)

**Implementation Tasks**:
1. Modify `FirecrawlClient.scrape()` to use `retryWithBackoff()`
2. Configure retry config: `maxRetries: 3, initialDelay: 1000, backoffMultiplier: 2, jitter: true`
3. Define retryable errors: [429, 500, 502, 503, 504, ECONNREFUSED, ETIMEDOUT]
4. Track retry metrics in Prometheus (retry_attempts_total, retry_success_rate)

**Files to Modify**:
- `src/lib/firecrawlClient.ts` (add retry wrapper)

**Example Implementation**:
```typescript
async scrape(url: string): Promise<FirecrawlResponse | null> {
  if (!this.checkCircuitBreaker()) return null

  const result = await retryWithBackoff(
    async () => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      try {
        const response = await fetch(`${this.baseUrl}/v1/scrape`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
          body: JSON.stringify({ url, formats: ['markdown', 'metadata'], onlyMainContent: true }),
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        return await response.json()
      } finally {
        clearTimeout(timeoutId)
      }
    },
    {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
      jitter: true,
      retryableErrors: ['429', '500', '502', '503', '504', 'ECONNREFUSED', 'ETIMEDOUT'],
    }
  )

  if (result.success) {
    this.recordSuccess()
    return result.data
  } else {
    this.recordFailure()
    return null
  }
}
```

---

#### US-4.6: Integrate Anti-Bot Strategies with Firecrawl Requests
**As a** system administrator
**I want** Firecrawl requests to use anti-bot evasion techniques
**So that** we reduce blocking rate and appear as legitimate browser traffic

**Acceptance Criteria**:
- [ ] Firecrawl requests rotate user agents on each scrape
- [ ] Firecrawl requests randomize viewport size (1920x1080, 1366x768, etc.)
- [ ] Firecrawl requests include realistic browser headers
- [ ] Firecrawl respects robots.txt before scraping (ethical compliance)
- [ ] Random delay (1-3s) added between consecutive scrapes to same domain
- [ ] Metrics track blocking rate reduction (target: <5%)

**Story Points**: 3
**Priority**: Medium
**Dependencies**: US-4.2 (anti-bot tests)

**Implementation Tasks**:
1. Modify `FirecrawlClient.scrape()` to call `enhanceFirecrawlRequest()`
2. Check `checkRobotsTxt()` before scraping (return error if disallowed)
3. Add domain-based delay tracking (prevent rapid-fire scraping same domain)
4. Pass enhanced config to Firecrawl API (userAgent, viewport, headers)

**Files to Modify**:
- `src/lib/firecrawlClient.ts` (add anti-bot integration)
- `src/lib/urlScraper.ts` (add robots.txt check before Firecrawl call)

**Example Implementation**:
```typescript
async scrape(url: string): Promise<FirecrawlResponse | null> {
  // Check robots.txt (ethical scraping)
  const robotsAllowed = await checkRobotsTxt(url)
  if (!robotsAllowed) {
    console.warn(`[Firecrawl] robots.txt disallows scraping: ${url}`)
    return null
  }

  // Apply anti-bot strategies
  const baseRequest = {
    url,
    formats: ['markdown', 'metadata'],
    onlyMainContent: true,
  }

  const enhancedRequest = enhanceFirecrawlRequest(baseRequest, {
    rotateUserAgents: true,
    randomizeViewport: true,
    randomDelay: { min: 1000, max: 3000 },
  })

  // Add domain delay (prevent rapid scraping)
  await this.addDomainDelay(url)

  // Proceed with retry-wrapped request
  // ... (rest of scrape logic)
}
```

---

### Epic 3: Production Monitoring (5 story points)

#### US-4.7: Add Prometheus Metrics for Scraping
**As a** DevOps engineer
**I want** Prometheus metrics tracking scraper performance
**So that** I can monitor success rates, latency, and circuit breaker trips in production

**Acceptance Criteria**:
- [ ] Metrics endpoint exposed at `/api/metrics` (Prometheus format)
- [ ] Metrics tracked:
  - `scraper_requests_total{source, status}` (counter)
  - `scraper_request_duration_seconds{source}` (histogram)
  - `scraper_generic_titles_total{source}` (counter)
  - `firecrawl_circuit_breaker_state{state}` (gauge: 0=closed, 1=open)
  - `firecrawl_retry_attempts_total{status}` (counter)
- [ ] Metrics queryable via `/api/admin/metrics` (JSON format for UI)
- [ ] Metrics persisted to Prometheus server (manual setup on VPS)

**Story Points**: 3
**Priority**: High
**Dependencies**: None

**Implementation Tasks**:
1. Install `prom-client` package: `npm install prom-client`
2. Create `src/lib/metrics.ts` with Prometheus metrics definitions
3. Create `/api/metrics/route.ts` to expose Prometheus metrics
4. Integrate metrics tracking into `urlScraper.ts`, `firecrawlClient.ts`
5. Document Prometheus scrape config for VPS deployment

**Files to Create**:
- `src/lib/metrics.ts`
- `src/app/api/metrics/route.ts`

**Metrics Implementation**:
```typescript
// src/lib/metrics.ts
import { Counter, Histogram, Gauge, register } from 'prom-client'

export const scraperRequestsTotal = new Counter({
  name: 'scraper_requests_total',
  help: 'Total scraper requests by source and status',
  labelNames: ['source', 'status'],
})

export const scraperRequestDuration = new Histogram({
  name: 'scraper_request_duration_seconds',
  help: 'Scraper request duration in seconds',
  labelNames: ['source'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
})

export const scraperGenericTitles = new Counter({
  name: 'scraper_generic_titles_total',
  help: 'Count of generic titles by source',
  labelNames: ['source'],
})

export const firecrawlCircuitBreakerState = new Gauge({
  name: 'firecrawl_circuit_breaker_state',
  help: 'Firecrawl circuit breaker state (0=closed, 1=open)',
})

export const firecrawlRetryAttempts = new Counter({
  name: 'firecrawl_retry_attempts_total',
  help: 'Total Firecrawl retry attempts by final status',
  labelNames: ['status'],
})

export { register }
```

---

#### US-4.8: Create Grafana Dashboard for Monitoring
**As a** product manager
**I want** a Grafana dashboard visualizing scraper health
**So that** I can see real-time performance and identify issues quickly

**Acceptance Criteria**:
- [ ] Grafana dashboard JSON exported to `.aiwg/deployment/grafana-dashboard.json`
- [ ] Dashboard panels:
  - Scraper Success Rate (%) by Source (Firecrawl, oEmbed, OpenGraph)
  - Request Latency (p50, p95, p99) by Source
  - Generic Title Rate (%) by Source
  - Circuit Breaker State (open/closed timeline)
  - Retry Success Rate (%)
  - Requests per Minute by Source
- [ ] Dashboard deployed to Grafana Cloud or self-hosted Grafana on VPS
- [ ] Alert rules configured for critical metrics (success rate <90%, p95 latency >5s)

**Story Points**: 2
**Priority**: Medium
**Dependencies**: US-4.7 (Prometheus metrics)

**Implementation Tasks**:
1. Set up Grafana (use Grafana Cloud free tier or Docker on VPS)
2. Configure Prometheus data source in Grafana
3. Create dashboard with 6 panels (success rate, latency, generic titles, circuit breaker, retries, RPM)
4. Configure alerts: success rate <90%, p95 latency >5s, circuit breaker open >5min
5. Export dashboard JSON and commit to `.aiwg/deployment/grafana-dashboard.json`

**Files to Create**:
- `.aiwg/deployment/grafana-dashboard.json`
- `.aiwg/deployment/prometheus.yml` (scrape config)
- `.aiwg/deployment/grafana-alerts.yml` (alert rules)

**Prometheus Scrape Config**:
```yaml
# .aiwg/deployment/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'zero-noise-scraper'
    static_configs:
      - targets: ['your-app.vercel.app']
    metrics_path: '/api/metrics'
    scheme: https
```

---

### Epic 4: VPS & Production Deployment (7 story points)

#### US-4.9: Provision Contabo VPS
**As a** DevOps engineer
**I want** a Contabo VPS provisioned and configured
**So that** I can deploy Firecrawl self-hosted instance

**Acceptance Criteria**:
- [ ] VPS provisioned: VPS M (4 vCPU, 8 GB RAM, 200 GB SSD)
- [ ] Ubuntu 22.04 LTS installed
- [ ] SSH access configured with public key authentication
- [ ] UFW firewall configured (ports 22, 80, 443 open)
- [ ] DNS A record created: `firecrawl.yourdomain.com` → VPS IP
- [ ] DNS propagation verified (<15 min)
- [ ] Cost: ~$8-11/month

**Story Points**: 1
**Priority**: High
**Dependencies**: None

**Tasks**:
1. Go to https://contabo.com/en/ and order VPS M
2. Configure Ubuntu 22.04 LTS
3. Wait for VPS provisioning email (IP address, root password)
4. Add SSH public key to VPS: `ssh-copy-id root@<vps-ip>`
5. Configure DNS A record in domain registrar
6. Verify DNS: `dig firecrawl.yourdomain.com +short` (should return VPS IP)

**Verification Commands**:
```bash
# Test SSH access
ssh root@<vps-ip>

# Verify firewall
sudo ufw status

# Check DNS propagation
dig firecrawl.yourdomain.com +short
```

---

#### US-4.10: Deploy Firecrawl to Production VPS
**As a** DevOps engineer
**I want** Firecrawl deployed to VPS with automated script
**So that** we have a self-hosted scraping service with SSL and monitoring

**Acceptance Criteria**:
- [ ] Firecrawl OSS deployed via `setup-firecrawl-contabo.sh` script
- [ ] Docker and Docker Compose installed on VPS
- [ ] Nginx reverse proxy configured with rate limiting (10 req/s)
- [ ] SSL certificate issued via Let's Encrypt (certbot)
- [ ] Firecrawl health check responds: `curl https://firecrawl.yourdomain.com/health` → `{"status":"ok"}`
- [ ] API key secured (not default test key)
- [ ] Firecrawl scrapes test URL successfully (arelion.com → "Arelion" title, not "Home")
- [ ] Deployment documented in runbook

**Story Points**: 3
**Priority**: High
**Dependencies**: US-4.9 (VPS provisioned)

**Tasks**:
1. Copy deployment script to VPS: `scp scripts/setup-firecrawl-contabo.sh root@<vps-ip>:/root/`
2. Copy docker-compose config: `scp docker-compose.firecrawl.yml root@<vps-ip>:/opt/firecrawl/`
3. SSH to VPS and run: `chmod +x /root/setup-firecrawl-contabo.sh && ./setup-firecrawl-contabo.sh`
4. Generate secure API keys: `openssl rand -hex 32` (run twice)
5. Update VPS `/opt/firecrawl/.env` with secure keys
6. Restart services: `cd /opt/firecrawl && docker-compose restart`
7. Validate health: `curl https://firecrawl.yourdomain.com/health`
8. Test scraping: `curl -X POST https://firecrawl.yourdomain.com/v1/scrape -H "Content-Type: application/json" -H "Authorization: Bearer <api-key>" -d '{"url": "https://arelion.com", "formats": ["metadata"]}'`

**Expected Output**:
```json
{
  "success": true,
  "data": {
    "metadata": {
      "title": "Arelion",
      "description": "Global Tier 1 Internet Service Provider"
    }
  }
}
```

**Files Referenced**:
- `scripts/setup-firecrawl-contabo.sh` (existing)
- `docker-compose.firecrawl.yml` (existing)
- `.env.firecrawl.example` (existing)

---

#### US-4.11: Deploy Sprint 4 Features to Vercel Production
**As a** product manager
**I want** all Sprint 4 features deployed to Vercel
**So that** users benefit from improved scraping and monitoring

**Acceptance Criteria**:
- [ ] Vercel environment variables configured:
  - `FIRECRAWL_BASE_URL=https://firecrawl.yourdomain.com`
  - `FIRECRAWL_API_KEY=<secure-key>`
  - `ENABLE_FIRECRAWL=true`
- [ ] Git commit pushed to main branch (triggers auto-deploy)
- [ ] Vercel deployment succeeds (no build errors)
- [ ] Production API returns `"source": "firecrawl"` for arelion.com test
- [ ] Production metrics endpoint accessible: `https://your-app.vercel.app/api/metrics`
- [ ] Grafana dashboard connected to production Prometheus metrics
- [ ] Smoke tests pass: scrape 10 URLs, validate >90% success rate

**Story Points**: 3
**Priority**: High
**Dependencies**: US-4.4, US-4.5, US-4.6, US-4.7, US-4.10

**Tasks**:
1. Add environment variables in Vercel Dashboard → Settings → Environment Variables
2. Commit Sprint 4 changes: `git add . && git commit -m "feat: Sprint 4 - Feature integration + production monitoring"`
3. Push to main: `git push origin main`
4. Monitor Vercel deployment logs
5. Run smoke tests: `npm run test:production` (new script to create)
6. Verify metrics: `curl https://your-app.vercel.app/api/metrics | grep scraper_requests_total`
7. Check Grafana dashboard for incoming data

**Verification Script** (`scripts/test-production.ts`):
```typescript
const TEST_URLS = [
  'https://arelion.com',
  'https://github.com/firecrawl',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://medium.com/@someauthor/article',
  // ... 6 more URLs
]

let successCount = 0
for (const url of TEST_URLS) {
  const response = await fetch('https://your-app.vercel.app/api/scrape-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  const data = await response.json()
  if (data.displayTitle && data.displayTitle !== 'Home') {
    successCount++
  }
}

const successRate = (successCount / TEST_URLS.length) * 100
console.log(`Success Rate: ${successRate}%`)
if (successRate < 90) {
  console.error('FAILED: Success rate below 90%')
  process.exit(1)
}
console.log('PASSED: Production smoke tests')
```

**Files to Create**:
- `scripts/test-production.ts`
- `package.json` (add `"test:production": "tsx scripts/test-production.ts"`)

---

## Sprint Timeline

### Week 1 (Days 1-5)

**Day 1-2: Testing Foundation**
- US-4.1: Schema extraction tests (2 SP)
- US-4.2: Anti-bot strategy tests (2 SP)
- US-4.3: Retry strategy tests (1 SP)

**Day 3-4: Feature Integration**
- US-4.4: Schema extraction integration (3 SP)
- US-4.5: Retry strategy integration (2 SP)

**Day 5: Monitoring Setup**
- US-4.7: Prometheus metrics (3 SP)

### Week 2 (Days 6-10)

**Day 6: Advanced Integration**
- US-4.6: Anti-bot integration (3 SP)

**Day 7: Monitoring Dashboards**
- US-4.8: Grafana dashboard (2 SP)

**Day 8: VPS Deployment**
- US-4.9: Provision Contabo VPS (1 SP)
- US-4.10: Deploy Firecrawl (3 SP)

**Day 9: Production Deployment**
- US-4.11: Deploy to Vercel (3 SP)

**Day 10: Validation & Documentation**
- Run production smoke tests
- Update documentation
- Sprint retrospective

---

## Story Points Summary

| Epic | Story Points | % of Sprint |
|------|--------------|-------------|
| Epic 1: Testing Legal Features | 5 | 20% |
| Epic 2: Feature Integration | 8 | 32% |
| Epic 3: Production Monitoring | 5 | 20% |
| Epic 4: VPS & Production Deployment | 7 | 28% |
| **Total** | **25** | **100%** |

**Team Velocity**: Assuming 1 developer @ 25 SP/sprint (2 weeks)

---

## Risks and Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| VPS provisioning delay (>24h) | High | Medium | Order VPS on Day 1; have backup plan (DigitalOcean) |
| SSL certificate issuance fails | High | Low | Manual certbot run; verify DNS first |
| Firecrawl blocking rate >10% | Medium | Medium | Enable anti-bot strategies; monitor metrics |
| Vercel build timeout (>5min) | Medium | Low | Optimize dependencies; cache Docker layers |
| Prometheus metrics OOM on Vercel | Low | Medium | Use Prometheus Cloud; sample metrics at 1min intervals |

---

## Definition of Done

A user story is considered "Done" when:
- [ ] Code implemented and peer-reviewed
- [ ] Unit tests written with >90% coverage
- [ ] Integration tests pass
- [ ] Documentation updated (README, ADR if applicable)
- [ ] Deployed to staging environment
- [ ] Smoke tests pass on staging
- [ ] Product owner accepts story

Sprint is considered "Done" when:
- [ ] All user stories meet DoD
- [ ] Production deployment successful
- [ ] Smoke tests pass with >90% success rate
- [ ] Monitoring dashboards live and reporting data
- [ ] No P0/P1 bugs in production
- [ ] Retrospective completed

---

## Dependencies

**External Dependencies**:
- Contabo VPS provisioning (1-24 hours)
- DNS propagation (5-60 minutes)
- Let's Encrypt SSL issuance (<5 minutes)

**Internal Dependencies**:
- US-4.4, US-4.5, US-4.6 depend on US-4.1, US-4.2, US-4.3 (tests first)
- US-4.8 depends on US-4.7 (metrics must exist before dashboard)
- US-4.11 depends on US-4.10 (VPS must be live before Vercel points to it)

---

## Success Metrics

**Sprint 4 Success Criteria**:
- ✅ All 11 user stories completed (25 story points)
- ✅ Test coverage >90% for new code
- ✅ Production scraping success rate >90%
- ✅ p95 latency <5 seconds
- ✅ Generic title rate <20% (down from 30% baseline)
- ✅ Circuit breaker tested under load (handle 5 consecutive failures)
- ✅ Prometheus metrics reporting data
- ✅ Grafana dashboard visualizing all key metrics
- ✅ Zero P0/P1 production bugs

**Post-Sprint Monitoring** (Week 3-4):
- Track metrics for 2 weeks
- Validate assumptions (latency, success rate, generic titles)
- Document lessons learned in `.aiwg/quality/sprint-4-retrospective.md`

---

## Retrospective Template

At end of Sprint 4, conduct retrospective covering:

**What Went Well**:
- [To be filled during retro]

**What Could Be Improved**:
- [To be filled during retro]

**Action Items for Sprint 5**:
- [To be filled during retro]

**Metrics Review**:
- Story points committed: 25
- Story points completed: [TBD]
- Velocity: [TBD]
- Bugs found in production: [TBD]
- Success rate achieved: [TBD]
- p95 latency achieved: [TBD]

---

## References

- **ADR-006**: Firecrawl Metadata Extraction (`.aiwg/architecture/adr/ADR-006-firecrawl-metadata-extraction.md`)
- **ADR-007**: Legal Feature Enhancement (`.aiwg/architecture/adr/ADR-007-legal-feature-enhancement.md`)
- **Deployment Guide**: `scripts/README-firecrawl-deployment.md`
- **Quick Start**: `FIRECRAWL-QUICKSTART.md`
- **Sprint 3 Completion Report**: `.aiwg/quality/firecrawl-implementation-complete.md`
- **SDLC Framework**: `.aiwg/planning/sdlc-framework.md`

---

**Approved By**: chronode
**Date**: 2025-10-23
**Next Review**: End of Sprint 4 (2025-11-05)
