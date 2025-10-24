# ADR-006: Web Scraping Strategy – Adopt Firecrawl for Robust Metadata Extraction

**Status**: ACCEPTED  
**Date**: 2025-10-22  
**Deciders**: chronode  
**Tags**: data-acquisition, integration, reliability  

---

## Context and Problem Statement

Our current URL metadata extraction relies on OpenGraph (ogs) and oEmbed. This works for many sites but fails on:
- SPA (Single Page Application) pages with generic titles like "Home"
- Sites requiring JS execution for correct tags/content
- Rate limiting / anti-bot protection
- Inconsistent metadata quality (missing `og:site_name`, thumbnails)

**Concrete Example**: https://arelion.com scrapes as `title='Home'` instead of `'Arelion – Global Connectivity Provider'`, harming search relevance and user experience.

We need higher-fidelity, resilient scraping to power link previews, indexing, and search ranking. Firecrawl offers a self-hostable crawling/rendering API with Playwright-based JS execution, markdown extraction, and structured metadata, which may address these gaps.

---

## Decision Drivers

- **Accuracy**: Reduce generic titles and missing metadata
- **Reliability**: Handle JS-heavy sites and anti-bot measures
- **Cost control**: Self-hosting avoids recurring vendor costs
- **Performance**: Must stay within p95 <5s target
- **Developer velocity**: Simple API, minimal integration effort

---

## Decision

Adopt Firecrawl as a primary scraping backend with a layered fallback:

1. **Try Firecrawl** `/v1/scrape` (JS-rendered, structured metadata)
2. **Fallback to existing** ogs + oEmbed flow
3. **Final fallback** to heuristic title from URL

**Display Title Policy**: Prefer `og:site_name` when `og:title` is generic (e.g., "Home", "Welcome"), else use rendered title; always store `domain` and `originalTitle` for search indexing.

**Scope**: Metadata-only extraction for MVP (full-page markdown indexing deferred to Sprint 5).

---

## Rationale

- **Accuracy**: JS rendering and content extraction reduce generic titles and missing metadata
- **Resilience**: Built-in retries, rate limiting, and anti-bot techniques
- **Developer velocity**: Simple REST API, markdown/content extraction ready for future use
- **Cost control**: Self-hosting avoids per-call vendor pricing; can scale to need
- **Alignment**: Fallback strategy aligns with ADR-003 (Gateway Fallback Strategy)

---

## Alternatives Considered

### Option 1: Keep ogs + oEmbed Only
**Rejected**: Lowest complexity but poorer accuracy on SPAs; fails to address core problem (generic titles).

### Option 2: Custom Playwright Microservice
**Rejected**: Full control, but higher maintenance burden for solo developer; reinvents Firecrawl features.

### Option 3: Third-Party Hosted Scrapers (ScrapingBee, Zyte)
**Rejected**: Good reliability but recurring cost (~$50-200/mo) and potential ToS risk for high-volume scraping.

---

## Architecture Changes

### Code Changes
- Add Firecrawl client SDK (`@firecrawl/sdk` or REST client)
- Update `src/lib/urlScraper.ts` to attempt Firecrawl first for non-video links
- Enhance title selection with `isGenericTitle()` helper and `og:site_name` preference
- Persist both `displayTitle` (user-facing) and `originalTitle` (search indexing)

### Configuration
- `FIRECRAWL_BASE_URL` (default: `http://localhost:3002`)
- `FIRECRAWL_API_KEY` (if using cloud or protected self-host)
- `ENABLE_FIRECRAWL` (feature flag for rollback, default: `true`)

---

## Self-Hosting Requirements

### Components
- **Firecrawl API**: REST endpoint with Playwright browser runtime
- **Redis**: Session/cache storage
- **Postgres** (optional): Job queue persistence

### Resources
- **Minimum**: 2 vCPU, 2 GB RAM, 20 GB disk
- **Recommended**: 4 vCPU, 4 GB RAM (for concurrent scraping)

### Deployment (Docker Compose)

```yaml
services:
  firecrawl:
    image: firecrawl/firecrawl:latest
    ports: ["3002:3002"]
    environment:
      - REDIS_URL=redis://redis:6379
      - PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
    volumes:
      - playwright-cache:/ms-playwright

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
```

**Checklist**:
1. Pull Docker image: `docker pull firecrawl/firecrawl:latest`
2. Configure environment variables
3. Run health check: `curl http://localhost:3002/health`
4. Point `FIRECRAWL_BASE_URL` to instance

### Security Hardening

**CRITICAL (Required Before Merge)**:
1. **SSRF Protection**: Validate URLs before scraping (block internal IPs RFC1918, `file://` schemes)
2. **API Key Rotation**: 90-day rotation policy for `FIRECRAWL_API_KEY`
3. **Network Isolation**: Deploy Firecrawl in isolated subnet; restrict to internal API routes only
4. **Resource Limits**: Enforce memory/CPU limits to prevent DoS via resource exhaustion
5. **Rate Limiting**: Per-user and per-domain limits to prevent abuse

**MEDIUM**:
- Secrets management: Store `FIRECRAWL_API_KEY` in secure vault (not `.env` in repo)
- Keep Firecrawl/Playwright updated (patch CVEs promptly)

**Compliance**:
- DMCA: Takedown process must cover scraped metadata
- GDPR: Document data retention policy for scraped metadata (may contain PII in meta tags)

---

## Fallback Strategy

- **Timeout**: If Firecrawl request fails/timeouts (>5s), automatically fall back to ogs/oEmbed
- **Circuit Breaker**: Disable Firecrawl after 5 consecutive failures for 10 minutes (retry window)
- **Observability**: Log source (`firecrawl|ogs|fallback`), latency, and error class

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Infra overhead and maintenance | Medium | Docker Compose simplifies; monitoring alerts for failures |
| Site anti-bot may still block | Low | Fallback to ogs ensures no regressions |
| Cost spikiness if scaling browsers | Medium | Resource limits + monitoring; optimize concurrency |
| SSRF attacks via URL injection | High | **CRITICAL**: URL validation (see Security Hardening) |
| Latency increase (2-5s vs 500-800ms) | Medium | Shadow mode validation; stay within p95 <5s target |

---

## Proof-of-Concept Plan

**Spike Script**: `scripts/spike-firecrawl.ts`

**Test Set** (10 URLs covering SPA, news, docs, social):
- SPAs: React apps, Vue apps (known generic title offenders)
- News: Medium, Substack, mainstream media
- Docs: GitHub, Read the Docs
- Social: Twitter/X (`og:title` vs rendered title)

**Metrics**:
- Success rate (200 OK + valid metadata)
- Generic title rate (% matching "Home", "Welcome", etc.)
- Latency (p50, p95, p99)
- Field completeness (title, site_name, description, image)

**Output**: CSV to `.aiwg/testing/test-results-firecrawl.csv` with side-by-side comparison (Firecrawl vs ogs)

**PoC Acceptance Criteria**:
- ≥25% reduction in generic titles compared to ogs baseline
- ≥90% scraping success rate across test set
- p95 latency <5s end-to-end (including fallback)

---

## Implementation Tasks

- [ ] Add Firecrawl client SDK and config envs
- [ ] Implement SSRF protections (URL validation, IP filtering)
- [ ] Update `urlScraper.ts` fallback chain and generic-title logic
- [ ] Add spike script and record PoC results
- [ ] Add integration tests (happy path, fallback, circuit breaker)
- [ ] Document secrets management and network isolation plan
- [ ] Baseline ADR with decision and rollout plan

---

## Rollout Plan

**Phase 1 (Shadow Mode)**: Call Firecrawl and ogs in parallel; pick best; log comparison (2 weeks)
- Collect latency/quality metrics
- Validate success rate, generic title reduction

**Phase 2 (Primary)**: Use Firecrawl as primary; ogs as fallback
- Feature flag: `ENABLE_FIRECRAWL=true`
- Monitor p95 latency, error rate

**Phase 3 (Optimize)**: Tune timeouts, concurrency, and caching
- Adjust circuit breaker thresholds based on production data

---

## Rollback Plan

If Firecrawl causes issues post-merge:
1. Set `ENABLE_FIRECRAWL=false`
2. Redeploy (fallback to ogs immediately)
3. Document latency/quality regression in postmortem

---

## Monitoring & Observability

**Production Metrics**:
- `scraper_requests_total{source=firecrawl|ogs|fallback}`
- `scraper_latency_seconds{source, p95}`
- `scraper_errors_total{source, error_type}`
- `generic_title_rate` (daily calculation)

**Alerting**:
- Alert if `success_rate` <85% for 15 minutes
- Alert if p95 latency >8s (exceeds 5s + 60% buffer)
- Alert if circuit breaker trips >3 times in 1 hour

---

## Testing Strategy

### Integration Tests
1. **Happy Path**: Firecrawl returns complete metadata → displayed correctly
2. **Fallback Path**: Firecrawl times out → ogs succeeds → no user-visible error
3. **Double Failure**: Both fail → heuristic title shown + warning message
4. **Circuit Breaker**: 5 failures → Firecrawl disabled → ogs primary for 10min → re-enable
5. **Generic Title Handling**: Page title "Home" + site_name "Arelion" → display "Arelion"

### Performance Testing
- **Load Test**: 100 concurrent URL scrapes (50% Firecrawl, 50% ogs); p95 <5s acceptance
- **Chaos Test**: Kill Firecrawl mid-request → verify graceful fallback

---

## Related Decisions

- **ADR-003**: Gateway Fallback Strategy (similar reliability pattern applied here)
- **ADR-001**: Frontend Framework (metadata consumed by React components)

---

## Deferred Decisions

- **Residential proxy requirements** (target: Sprint 4)
  - Monitor blocked domains; evaluate proxy service if blocking rate >10%
- **Full-page markdown indexing vs metadata-only** (target: Sprint 5)
  - Evaluate semantic search quality with metadata-only; upgrade if needed

---

## References

- Firecrawl Documentation: https://github.com/firecrawl/firecrawl
- Firecrawl Self-Host Guide: https://github.com/firecrawl/firecrawl/blob/main/SELF_HOST.md
- OpenGraph Scraper: https://github.com/jshemas/openGraphScraper
- oEmbed Spec: https://oembed.com/

---

## Consequences

### Positive
✅ Significantly reduced generic titles (target: 25%+ reduction)  
✅ Better metadata quality for search ranking  
✅ Self-hosting avoids recurring vendor costs  
✅ Fallback strategy ensures no regressions  

### Negative
⚠️ Infrastructure complexity (Docker, Redis, Playwright)  
⚠️ Increased latency (2-5s vs 500-800ms)  
⚠️ Security attack surface (SSRF risk, browser CVEs)  

### Neutral
- Requires ongoing maintenance (updates, monitoring)
- Learning curve for Firecrawl API
- Shadow mode adds temporary observability overhead

---

## Documentation Debt

Post-merge updates:
- [ ] Update `README.md` with Firecrawl setup instructions
- [ ] Add "Metadata Extraction" section to `software-architecture-doc.md` (section 5.5)
- [ ] Update deployment guide with Firecrawl Docker Compose config
- [ ] Add Firecrawl troubleshooting to FAQ (common errors, logs to check)
- [ ] Document SSRF mitigations in security review artifact
