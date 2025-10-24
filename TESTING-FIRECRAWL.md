# Firecrawl Integration - Local Testing Guide

Quick reference for testing the Firecrawl integration before VPS deployment.

---

## Prerequisites

```bash
# Ensure all dependencies are installed
npm install

# Verify TypeScript files compile
npx tsc --noEmit
```

---

## Step 1: Test SSRF Protections (Unit Tests)

**Run all unit tests**:
```bash
npm test
```

**Run only SSRF protection tests**:
```bash
npm test ssrfProtection
```

**Expected Output**:
```
✓ should accept valid HTTPS URLs
✓ should reject localhost
✓ should reject 127.0.0.1
✓ should reject private IP ranges
✓ should reject AWS metadata service
✓ should reject file:// scheme
... (17 total tests)

Test Files  1 passed (1)
     Tests  17 passed (17)
```

**Status**: ✅ All security tests must pass before proceeding

---

## Step 2: Test Firecrawl Integration (Without VPS)

Since you don't have Firecrawl running yet, test the fallback chain:

```bash
npm run test:firecrawl
```

**Expected Behavior** (without Firecrawl):
```
🧪 Testing Firecrawl Integration
================================================================================

📊 Firecrawl Status:
{
  "enabled": true,
  "circuitBreakerOpen": false,
  "failures": 0,
  "baseUrl": "http://localhost:3002"
}

⚠️  Firecrawl is DISABLED or unreachable. Tests will use fallback.

🔍 Running Test Cases:

▶️  SPA with generic title (Arelion)
   URL: https://arelion.com
   Source: ogs  ⬅️ Falls back to OpenGraph (no Firecrawl)
   Title: Home
   ⚠️  PARTIAL: Got ogs, expected firecrawl

▶️  YouTube video
   URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ
   Source: oembed  ⬅️ Works via oEmbed
   Title: Rick Astley - Never Gonna Give You Up
   ✅ PASSED

...

▶️  SSRF - localhost
   ✅ BLOCKED as expected: Hostname 'localhost' is blocked

▶️  SSRF - AWS metadata
   ✅ BLOCKED as expected: Hostname '169.254.169.254' is blocked
```

**Status**:
- ✅ SSRF blocks should ALL pass
- ⚠️ Valid URLs may use `ogs` source (expected without Firecrawl)

---

## Step 3: Test API Route Locally

**Start development server**:
```bash
npm run dev
```

**Test scraping endpoint** (new terminal):

```bash
# Test valid URL
curl -X POST http://localhost:3000/api/scrape-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com/firecrawl/firecrawl"}'
```

**Expected Response**:
```json
{
  "success": true,
  "metadata": {
    "url": "https://github.com/firecrawl/firecrawl",
    "title": "GitHub - firecrawl/firecrawl",
    "displayTitle": "GitHub - firecrawl/firecrawl",
    "description": "...",
    "imageUrl": "https://opengraph.githubassets.com/...",
    "siteName": "GitHub",
    "author": "firecrawl/firecrawl",
    "linkType": "generic",
    "domain": "github.com",
    "source": "ogs"  ⬅️ Without Firecrawl, falls back to OGS
  }
}
```

---

**Test SSRF protection** (should be blocked):

```bash
# Test localhost (should fail)
curl -X POST http://localhost:3000/api/scrape-url \
  -H "Content-Type: application/json" \
  -d '{"url": "http://localhost:3000"}'
```

**Expected Response**:
```json
{
  "error": "Invalid URL",
  "message": "URL validation failed: Hostname 'localhost' is blocked (localhost/metadata service)"
}
```

---

**Test AWS metadata** (should be blocked):

```bash
curl -X POST http://localhost:3000/api/scrape-url \
  -H "Content-Type: application/json" \
  -d '{"url": "http://169.254.169.254/latest/meta-data/"}'
```

**Expected Response**:
```json
{
  "error": "Invalid URL",
  "message": "URL validation failed: Hostname '169.254.169.254' is blocked (localhost/metadata service)"
}
```

---

**Test rate limiting** (should block after 10 requests):

```bash
# Make 11 rapid requests to same domain
for i in {1..11}; do
  echo "Request $i:"
  curl -s -X POST http://localhost:3000/api/scrape-url \
    -H "Content-Type: application/json" \
    -d '{"url": "https://example.com"}' | jq '.error // "Success"'
done
```

**Expected**: First 10 succeed, 11th fails with rate limit error

---

## Step 4: Test with Local Firecrawl (Optional)

If you want to test Firecrawl before VPS deployment:

**Option A: Docker Compose** (Recommended):

```bash
# Start Firecrawl locally
docker-compose -f docker-compose.firecrawl.yml up -d

# Wait for services to start (~30 seconds)
sleep 30

# Health check
curl http://localhost:3002/health
# Expected: {"status":"ok"}

# Test scraping
curl -X POST http://localhost:3002/v1/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://arelion.com",
    "formats": ["metadata"]
  }'
```

**Option B: Use Firecrawl Cloud** (Temporary Testing):

```bash
# Set environment variable
export FIRECRAWL_BASE_URL=https://api.firecrawl.dev
export FIRECRAWL_API_KEY=<your-cloud-api-key>
export ENABLE_FIRECRAWL=true

# Restart dev server
npm run dev
```

---

## Step 5: Verify Admin Monitoring (Optional)

If you have admin access configured:

```bash
# Get Firecrawl status
curl http://localhost:3000/api/admin/firecrawl-status \
  -H "Authorization: Bearer <your-admin-token>"
```

**Expected Response**:
```json
{
  "firecrawl": {
    "enabled": true,
    "circuitBreakerOpen": false,
    "failures": 0,
    "baseUrl": "http://localhost:3002"
  },
  "timestamp": "2025-10-23T...",
  "environment": {
    "baseUrl": "http://localhost:3002",
    "enabled": true,
    "hasApiKey": false
  }
}
```

---

## Test Checklist

Before deploying to VPS:

- [ ] ✅ All SSRF unit tests pass (`npm test`)
- [ ] ✅ SSRF blocks localhost requests (API test)
- [ ] ✅ SSRF blocks AWS metadata requests (API test)
- [ ] ✅ SSRF blocks private IP ranges (API test)
- [ ] ✅ Rate limiting enforces 10 req/min per domain
- [ ] ✅ Valid URLs scrape successfully (fallback to OGS)
- [ ] ✅ Generic title detection works (prefers siteName)
- [ ] ✅ Circuit breaker status accessible via admin endpoint
- [ ] ⏳ Firecrawl integration (after VPS deployment)

---

## After VPS Deployment

Once Firecrawl is running on Contabo:

1. **Update Vercel environment variables**:
   ```
   FIRECRAWL_BASE_URL=https://firecrawl.yourdomain.com
   FIRECRAWL_API_KEY=<your-vps-api-key>
   ENABLE_FIRECRAWL=true
   ```

2. **Deploy to Vercel**:
   ```bash
   git add .
   git commit -m "Add Firecrawl integration with SSRF protection"
   git push
   ```

3. **Test in production**:
   ```bash
   curl -X POST https://your-app.vercel.app/api/scrape-url \
     -H "Content-Type: application/json" \
     -d '{"url": "https://arelion.com"}'

   # Check for source: "firecrawl" in response
   ```

4. **Monitor Vercel logs** for Firecrawl usage:
   ```
   [Firecrawl] Request successful
   [Scraper] Source: firecrawl
   ```

---

## Troubleshooting

### Tests Failing

**Issue**: SSRF tests fail
- **Fix**: Check `src/lib/ssrfProtection.ts` is imported correctly

**Issue**: API returns 500 errors
- **Fix**: Check Vercel/console logs for stack traces

### Local Firecrawl Not Working

**Issue**: "Connection refused" to localhost:3002
```bash
# Check if Firecrawl container is running
docker ps | grep firecrawl

# Check logs
docker logs firecrawl-api

# Restart
docker-compose -f docker-compose.firecrawl.yml restart
```

**Issue**: Health check fails
```bash
# Check Redis is running
docker ps | grep redis

# Check Firecrawl can reach Redis
docker exec firecrawl-api ping redis
```

---

## Next Steps

1. ✅ **Complete local testing** (this guide)
2. ⏳ **Deploy to Contabo VPS** (`scripts/README-firecrawl-deployment.md`)
3. ⏳ **Configure Vercel** (environment variables)
4. ⏳ **Production validation** (ADR-006 acceptance criteria)

---

## Quick Commands Reference

```bash
# Unit tests
npm test

# Integration tests
npm run test:firecrawl

# Dev server
npm run dev

# Build (TypeScript check)
npm run build

# Local Firecrawl
docker-compose -f docker-compose.firecrawl.yml up -d
docker-compose -f docker-compose.firecrawl.yml logs -f
docker-compose -f docker-compose.firecrawl.yml down
```
