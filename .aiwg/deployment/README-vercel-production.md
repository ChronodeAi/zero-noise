# Vercel Production Deployment Guide - Sprint 4

This guide walks through deploying Sprint 4 features to Vercel production, including Firecrawl integration and Prometheus monitoring.

## Sprint 4 Feature Summary

**New Features**:
- ✅ Schema.org structured data extraction
- ✅ Retry strategies with exponential backoff
- ✅ Anti-bot evasion (user agent rotation, viewport randomization, robots.txt)
- ✅ Firecrawl integration with circuit breaker
- ✅ Prometheus metrics endpoint
- ✅ Production monitoring dashboards

**Changes**:
- Database schema updated (added `structuredData` Json field)
- New API endpoint: `/api/metrics` (Prometheus format)
- Enhanced URL scraping with 4-tier fallback chain
- Circuit breaker pattern for Firecrawl failures

## Prerequisites

Before deploying:

- [ ] Sprint 4 features tested locally (build successful, tests passing)
- [ ] Database migration applied to production (`structuredData` field)
- [ ] Firecrawl VPS deployed and accessible (or using feature flag to disable)
- [ ] Vercel account with project linked to GitHub repo
- [ ] Production environment variables configured

## Step 1: Verify Local Build

### 1.1 Clean Build

```bash
# Clean previous builds
rm -rf .next
rm -rf node_modules/.cache

# Install dependencies
npm install

# Run build
npm run build
```

**Expected output**:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (15/15)
✓ Collecting build traces
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    ...
...
```

### 1.2 Run Tests

```bash
# Unit and integration tests
npm test

# Expected: All 113 tests passing
# If any fail, fix before deploying
```

### 1.3 Test Production Build Locally

```bash
# Start production server locally
npm start
```

Visit http://localhost:3000 and verify:
- Homepage loads
- Authentication works
- URL scraping works
- Metrics endpoint accessible: http://localhost:3000/api/metrics

## Step 2: Configure Vercel Environment Variables

### 2.1 Required Variables

Log in to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

#### Core Application Variables

| Variable | Value | Environment | Notes |
|----------|-------|-------------|-------|
| `DATABASE_URL` | `postgresql://...` | Production | From Vercel Postgres |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Production | Your production URL |
| `NEXTAUTH_SECRET` | `<generated-secret>` | Production | Generate: `openssl rand -base64 32` |

#### Email Configuration (NextAuth)

| Variable | Value | Environment | Notes |
|----------|-------|-------------|-------|
| `EMAIL_SERVER_HOST` | `smtp.sendgrid.net` | All | Or your SMTP provider |
| `EMAIL_SERVER_PORT` | `587` | All | TLS port |
| `EMAIL_SERVER_USER` | `apikey` | All | SendGrid uses "apikey" |
| `EMAIL_SERVER_PASSWORD` | `<sendgrid-api-key>` | All | Your SendGrid API key |
| `EMAIL_FROM` | `noreply@yourdomain.com` | All | Verified sender |

#### Firecrawl Configuration

| Variable | Value | Environment | Notes |
|----------|-------|-------------|-------|
| `FIRECRAWL_BASE_URL` | `https://firecrawl.yourdomain.com` | Production | Your VPS domain |
| `FIRECRAWL_API_KEY` | `<secure-api-key>` | Production | From VPS `/opt/firecrawl/.env` |
| `ENABLE_FIRECRAWL` | `true` | Production | Set to `false` to disable |

**Note**: If Firecrawl VPS is not ready yet, set:
```
ENABLE_FIRECRAWL=false
```

Application will gracefully fall back to OpenGraph scraper.

### 2.2 Verify Environment Variables

After adding all variables:

1. Go to **Settings** → **Environment Variables**
2. Verify all variables are set for **Production** environment
3. Check no sensitive values are exposed in logs

### 2.3 Generate Secure Secrets

For any secrets that need rotation:

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate Firecrawl API key (from VPS)
ssh firecrawl@<vps-ip>
openssl rand -hex 32
```

## Step 3: Database Migration

### 3.1 Check Current Production Schema

```bash
# Connect to production database
psql $DATABASE_URL

# Check if structuredData field exists
\d "Link"

# Should show:
# structuredData | jsonb | nullable
```

### 3.2 Apply Migration (If Needed)

If migration hasn't been applied to production:

```bash
# Set production database URL
export DATABASE_URL="<production-database-url>"

# Generate and apply migration
npx prisma migrate deploy
```

**Expected output**:
```
1 migration found in prisma/migrations
Applying migration `20251023184622_add_structured_data_to_links`
Migration applied successfully
```

### 3.3 Verify Migration

```bash
# Check migration status
npx prisma migrate status

# Should show all migrations applied
```

## Step 4: Deploy to Production

### 4.1 Push to Main Branch

```bash
# Check git status
git status

# Review changes
git diff

# Stage all changes
git add .

# Create commit
git commit -m "Deploy Sprint 4: Firecrawl integration + monitoring

Features:
- Schema.org structured data extraction
- Retry strategies with exponential backoff
- Anti-bot evasion (user agents, robots.txt)
- Firecrawl integration with circuit breaker
- Prometheus metrics endpoint
- Grafana dashboards and alerts

Technical:
- Added structuredData JSON field to Link model
- Created /api/metrics Prometheus endpoint
- Integrated firecrawlClient with retry logic
- Added 11 Prometheus metrics
- Created monitoring documentation

Testing:
- 113 tests passing
- Build successful
- Local smoke tests verified"

# Push to GitHub (triggers Vercel deployment)
git push origin main
```

### 4.2 Monitor Deployment

1. Go to **Vercel Dashboard** → Your Project → **Deployments**
2. Watch deployment progress (typically 2-5 minutes)
3. Check for any build errors

**Deployment stages**:
- ✅ Queued
- ✅ Building (npm install, build)
- ✅ Deploying (upload to CDN)
- ✅ Ready (live)

### 4.3 Check Deployment Logs

If deployment fails:

1. Click on failed deployment
2. Review **Build Logs**
3. Look for errors in:
   - **Install**: Dependency issues
   - **Build**: TypeScript/compilation errors
   - **Export**: Static generation errors

Common errors:
- Missing environment variables
- TypeScript type errors
- Database connection issues

## Step 5: Post-Deployment Verification

### 5.1 Health Check

```bash
# Check homepage
curl -I https://your-app.vercel.app

# Should return: 200 OK

# Check metrics endpoint
curl https://your-app.vercel.app/api/metrics

# Should return Prometheus-format metrics
```

### 5.2 Test Core Functionality

**Manual smoke tests**:

1. **Homepage**: https://your-app.vercel.app
   - ✅ Page loads
   - ✅ No console errors

2. **Authentication**:
   - ✅ Sign in with email works
   - ✅ Magic link received
   - ✅ Successfully authenticated

3. **Collection Creation**:
   - ✅ Create new collection
   - ✅ Collection shows in list

4. **URL Scraping**:
   - ✅ Paste URL in collection
   - ✅ Metadata extracted correctly
   - ✅ Title not "Home" (generic title issue resolved)
   - ✅ Author/site name populated

5. **Metrics Endpoint**:
   - ✅ Visit `/api/metrics`
   - ✅ Prometheus metrics returned
   - ✅ No authentication required (public endpoint)

### 5.3 Test Firecrawl Integration

If `ENABLE_FIRECRAWL=true`:

```bash
# Check Vercel function logs
vercel logs --follow

# Add URL to collection and watch for logs:
# [Firecrawl] Request successful
# [Scraper] Source: firecrawl
```

Test with known problematic URLs:
- https://arelion.com (generic title "Home" → should be "Arelion")
- https://example.com (simple site)
- https://youtube.com/watch?v=... (video with metadata)

**Expected behavior**:
- Firecrawl used for non-video links
- OEmbed used for video platforms
- OpenGraph fallback if Firecrawl fails
- Circuit breaker opens after 5 failures

### 5.4 Monitor Circuit Breaker

Check circuit breaker status:

```bash
# Create admin status endpoint (if not exists)
curl https://your-app.vercel.app/api/admin/firecrawl-status

# Expected response:
{
  "enabled": true,
  "circuitBreakerOpen": false,
  "failures": 0,
  "baseUrl": "https://firecrawl.yourdomain.com"
}
```

## Step 6: Configure Production Monitoring

### 6.1 Set Up Prometheus Scraping

Follow instructions in `.aiwg/deployment/README-monitoring-setup.md`:

1. **Deploy Prometheus** to scrape `/api/metrics`
2. **Deploy Grafana** with Zero Noise dashboard
3. **Configure alerts** for critical metrics

### 6.2 Monitor Key Metrics

In Grafana dashboard, watch for:

- **Success Rate**: Should be >90%
- **Latency**: p95 should be <5s
- **Circuit Breaker**: Should stay CLOSED (0)
- **Failure Count**: Should stay low (<3)
- **Generic Title Rate**: Should decrease from baseline

### 6.3 Set Up Alerts

Configure alert notifications:

- **Critical alerts** → PagerDuty (immediate)
- **Warning alerts** → Slack (5 min batches)
- **Info alerts** → Email (daily digest)

## Step 7: Rollback Plan

If deployment causes issues:

### Option 1: Revert Deployment in Vercel

1. Go to **Vercel Dashboard** → **Deployments**
2. Find last working deployment
3. Click **...** → **Promote to Production**
4. Confirm rollback

### Option 2: Disable Firecrawl

```bash
# In Vercel Dashboard → Settings → Environment Variables
ENABLE_FIRECRAWL=false

# Redeploy
git commit --allow-empty -m "Disable Firecrawl temporarily"
git push
```

### Option 3: Revert Git Commit

```bash
# Find last working commit
git log --oneline

# Revert to previous commit
git revert <commit-hash>
git push
```

## Step 8: Post-Deployment Tasks

### 8.1 Update Documentation

Update Sprint 4 iteration plan:

```bash
# Edit .aiwg/planning/iteration-plans/iteration-plan-004.md
# Mark all user stories as DONE
# Update "Deployment" section with production URLs
```

### 8.2 Monitor for 24 Hours

Watch for issues during first 24 hours:

- [ ] Check Vercel error logs hourly
- [ ] Monitor Grafana dashboards
- [ ] Review user feedback (if any)
- [ ] Check circuit breaker status
- [ ] Verify no database performance degradation

### 8.3 Create Deployment Report

Document findings in `.aiwg/reports/sprint-4-deployment.md`:

```markdown
# Sprint 4 Production Deployment Report

## Deployment Summary
- **Date**: YYYY-MM-DD
- **Duration**: XX minutes
- **Status**: Success / Issues
- **Rollback**: Not needed / Partial rollback

## Metrics Baseline (First 24 Hours)
- Success Rate: XX%
- p95 Latency: XXs
- Generic Title Rate: XX% (vs XX% before)
- Circuit Breaker Opens: XX times
- Total Requests: XXX

## Issues Encountered
1. Issue description
   - Root cause
   - Resolution
   - Prevention

## Next Steps
- [ ] Task 1
- [ ] Task 2
```

## Troubleshooting

### Deployment Failed: "Build Error"

**Cause**: TypeScript errors or missing dependencies

**Fix**:
```bash
# Local build to catch errors
npm run build

# Fix TypeScript errors
npm run type-check

# Commit and push again
```

### Deployment Failed: "Database Connection Error"

**Cause**: DATABASE_URL not set or incorrect

**Fix**:
1. Verify `DATABASE_URL` in Vercel environment variables
2. Test connection: `npx prisma db pull`
3. Check Vercel Postgres is running

### Metrics Endpoint Returns 500

**Cause**: prom-client not installed or metrics registry issue

**Fix**:
```bash
# Verify package installed
npm list prom-client

# Reinstall if missing
npm install prom-client

# Rebuild and redeploy
```

### Firecrawl "Connection Refused"

**Cause**: VPS not accessible or FIRECRAWL_BASE_URL incorrect

**Fix**:
1. Test VPS: `curl https://firecrawl.yourdomain.com/health`
2. Check firewall: VPS ports 80/443 open
3. Verify DNS: `nslookup firecrawl.yourdomain.com`
4. Temporarily disable: `ENABLE_FIRECRAWL=false`

### High Latency After Deployment

**Cause**: Firecrawl timeout or VPS underpowered

**Fix**:
1. Check Firecrawl VPS resource usage
2. Increase timeout in `firecrawlClient.ts` (default 5s)
3. Upgrade VPS if CPU/RAM maxed out
4. Enable caching if available

## Performance Tuning

### Edge Functions vs Serverless

Current configuration uses **Serverless Functions** for:
- `/api/upload` (scraping)
- `/api/metrics` (Prometheus)

**Consider Edge Functions** for:
- `/api/search` (faster, globally distributed)
- `/api/collection/[id]` (read-only)

```typescript
// src/app/api/search/route.ts
export const runtime = 'edge' // Add this line
```

### Enable Response Caching

For `/api/metrics`:

```typescript
// src/app/api/metrics/route.ts
export const revalidate = 15 // Cache for 15 seconds
```

For collection data:

```typescript
// src/app/api/collection/[id]/route.ts
export const revalidate = 60 // Cache for 1 minute
```

### Optimize Scraping Performance

If scraping is slow:

1. **Enable parallel scraping** (already implemented in `scrapeUrls()`)
2. **Add Redis caching** for scraped URLs (Sprint 5)
3. **Preload Firecrawl connection** (connection pooling)

## Security Checklist

Post-deployment security verification:

- [ ] No API keys in source code (all in env vars)
- [ ] NEXTAUTH_SECRET is strong (32+ characters)
- [ ] Firecrawl API key rotated from default
- [ ] SSRF protection enabled (validates URLs)
- [ ] Rate limiting configured (via Vercel)
- [ ] CORS properly configured (NextAuth)
- [ ] No sensitive data in logs
- [ ] Database uses SSL connection
- [ ] Robots.txt compliance enabled

## Cost Monitoring

**Vercel Usage**:
- Function invocations: Typically within free tier (100k/month)
- Bandwidth: Monitor if exceeding free tier (100 GB/month)
- Build minutes: Unlimited on Pro plan

**Firecrawl VPS**:
- Fixed cost: €8.99/month (Contabo VPS M)
- No per-request charges

**Database**:
- Vercel Postgres: Monitor storage (free tier: 256 MB)
- Upgrade if exceeding limits

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Firecrawl OSS**: https://github.com/firecrawl/firecrawl

---

**Estimated Deployment Time**: 30-45 minutes (including verification)

**Recommended Deployment Window**: Off-peak hours (late evening/night) to minimize user impact if issues arise.

**Post-Deployment Monitoring**: 24-48 hours of enhanced monitoring before considering deployment stable.
