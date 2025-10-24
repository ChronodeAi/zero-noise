# Firecrawl Self-Hosted Deployment Guide

## Overview

This guide walks through deploying Firecrawl OSS to Contabo VPS for improved URL metadata extraction in Zero Noise.

**Benefits**:
- ✅ Better handling of JavaScript-heavy SPAs (React, Vue apps)
- ✅ Reduced "generic title" problem (sites showing "Home" instead of proper name)
- ✅ Self-hosted = no recurring vendor costs
- ✅ Full control over scraping infrastructure

**Architecture**:
```
User → Vercel (Zero Noise) → Contabo VPS (Firecrawl) → Target Website
                           ↓ (fallback)
                          OpenGraph Scraper
```

---

## Prerequisites

- [ ] Contabo VPS provisioned (minimum 4 vCPU, 4 GB RAM)
- [ ] Domain name pointing to VPS IP (for SSL)
- [ ] SSH access to VPS
- [ ] Basic Linux command-line knowledge

---

## Step 1: Provision Contabo VPS

1. Sign up at https://contabo.com/en/
2. Choose **VPS M** or higher:
   - 4 vCPU
   - 8 GB RAM (recommended)
   - 200 GB SSD
   - Ubuntu 22.04 LTS
3. Note down:
   - **IP Address**: `___.___.___.___`
   - **Root Password**: `_______________`
   - **SSH Port**: Usually `22`

**Cost**: ~$7-10/month

---

## Step 2: Point Domain to VPS

1. Add an **A record** in your DNS provider:
   ```
   Type: A
   Name: firecrawl (or subdomain of choice)
   Value: <your-vps-ip>
   TTL: 3600
   ```

2. Verify DNS propagation:
   ```bash
   dig firecrawl.yourdomain.com +short
   # Should return your VPS IP
   ```

**Wait 5-15 minutes for DNS propagation before proceeding.**

---

## Step 3: Deploy Firecrawl to VPS

### Option A: Automated Script (Recommended)

1. Copy deployment script to VPS:
   ```bash
   scp scripts/setup-firecrawl-contabo.sh root@<vps-ip>:/root/
   ```

2. SSH into VPS and run:
   ```bash
   ssh root@<vps-ip>
   chmod +x /root/setup-firecrawl-contabo.sh
   ./setup-firecrawl-contabo.sh
   ```

3. Follow prompts:
   - Enter your domain name (e.g., `firecrawl.yourdomain.com`)
   - Confirm SSL certificate setup
   - Wait for Docker images to download (~5-10 minutes)

### Option B: Manual Deployment

See detailed manual steps in `scripts/setup-firecrawl-contabo.sh` comments.

---

## Step 4: Configure Firecrawl

1. SSH into VPS:
   ```bash
   ssh root@<vps-ip>
   ```

2. Edit environment file:
   ```bash
   cd /opt/firecrawl
   nano .env
   ```

3. **CRITICAL**: Set secure API keys:
   ```bash
   # Generate secure keys
   openssl rand -hex 32  # Run twice for two keys

   # Update .env
   FIRECRAWL_TEST_API_KEY=<generated-key-1>
   FIRECRAWL_BULL_AUTH_KEY=<generated-key-2>
   ```

4. Save changes (`Ctrl+O`, `Enter`, `Ctrl+X`)

5. Copy `docker-compose.firecrawl.yml` from your local repo to VPS:
   ```bash
   # On your local machine
   scp docker-compose.firecrawl.yml root@<vps-ip>:/opt/firecrawl/docker-compose.yml
   ```

6. Start Firecrawl:
   ```bash
   cd /opt/firecrawl
   docker-compose up -d
   ```

7. Verify health:
   ```bash
   curl http://localhost:3002/health
   # Should return: {"status":"ok"}

   # Check via domain
   curl https://firecrawl.yourdomain.com/health
   ```

---

## Step 5: Configure Vercel Environment Variables

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. Add the following:
   ```
   FIRECRAWL_BASE_URL = https://firecrawl.yourdomain.com
   FIRECRAWL_API_KEY = <your-FIRECRAWL_TEST_API_KEY>
   ENABLE_FIRECRAWL = true
   ```

3. **Redeploy** your Vercel app:
   ```bash
   git commit --allow-empty -m "Trigger Vercel redeploy for Firecrawl"
   git push
   ```

---

## Step 6: Test End-to-End

### Test Firecrawl Directly

```bash
curl -X POST https://firecrawl.yourdomain.com/v1/scrape \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-api-key>" \
  -d '{
    "url": "https://arelion.com",
    "formats": ["markdown", "metadata"]
  }'
```

**Expected response**:
```json
{
  "success": true,
  "data": {
    "metadata": {
      "title": "Arelion – Global Connectivity Provider",
      "ogTitle": "Arelion",
      ...
    }
  }
}
```

### Test via Zero Noise

1. Go to your Zero Noise app
2. Paste a URL with known generic title issue (e.g., `https://arelion.com`)
3. Check scraped metadata:
   - **Before**: Title shows "Home"
   - **After**: Title shows "Arelion – Global Connectivity Provider" or "Arelion"

4. Check Vercel logs for Firecrawl usage:
   ```
   [Firecrawl] Request successful
   [Scraper] Source: firecrawl
   ```

---

## Step 7: Monitor and Maintain

### View Firecrawl Logs

```bash
ssh root@<vps-ip>
cd /opt/firecrawl
docker-compose logs -f
```

### Check Circuit Breaker Status

In your Zero Noise API, add a monitoring endpoint:

```typescript
// src/app/api/admin/firecrawl-status/route.ts
import { getFirecrawlClient } from '@/lib/firecrawlClient'

export async function GET() {
  const client = getFirecrawlClient()
  return Response.json(client.getStatus())
}
```

Access: `https://your-app.vercel.app/api/admin/firecrawl-status`

### Update Firecrawl

```bash
ssh root@<vps-ip>
cd /opt/firecrawl
docker-compose pull
docker-compose up -d
```

### Restart Services

```bash
docker-compose restart
```

---

## Troubleshooting

### Issue: "Connection refused" or timeout

**Cause**: Firewall blocking port 3002 or Nginx not running

**Fix**:
```bash
# Check if Nginx is running
sudo systemctl status nginx

# Check if Firecrawl container is up
docker ps | grep firecrawl

# Check firewall
sudo ufw status
```

### Issue: SSL certificate failed

**Cause**: DNS not propagated or domain not pointing to VPS

**Fix**:
```bash
# Verify DNS
dig firecrawl.yourdomain.com +short

# Manually run Certbot
sudo certbot --nginx -d firecrawl.yourdomain.com
```

### Issue: "Generic title" still appearing

**Cause**: Firecrawl disabled or circuit breaker open

**Fix**:
1. Check Vercel logs for `[Firecrawl]` messages
2. Verify `ENABLE_FIRECRAWL=true` in Vercel env vars
3. Check circuit breaker status (API endpoint above)
4. If open, wait 10 minutes for reset or restart Firecrawl

### Issue: High latency (>5s)

**Cause**: VPS underpowered or network latency

**Fix**:
- Upgrade to VPS L (8 vCPU, 16 GB RAM)
- Check VPS location (choose region close to Vercel deployment)
- Enable caching in Firecrawl (Redis TTL)

---

## Security Checklist

- [x] SSRF protections implemented (`ssrfProtection.ts`)
- [ ] Secure API keys set (not default "test-key-change-me")
- [ ] Firewall configured (SSH, HTTP, HTTPS only)
- [ ] SSL/TLS enabled with Let's Encrypt
- [ ] Rate limiting enabled (10 req/s via Nginx)
- [ ] VPS SSH key authentication (disable password login)
- [ ] Regular updates scheduled (docker-compose pull monthly)
- [ ] Monitoring/alerting configured (optional)

---

## Cost Summary

| Service | Monthly Cost | Notes |
|---------|--------------|-------|
| Contabo VPS M | $7-10 | 4 vCPU, 8 GB RAM |
| Domain (if new) | $10-15/year | ~$1/month amortized |
| SSL Certificate | $0 | Let's Encrypt (free) |
| **Total** | **~$8-11/month** | vs $50-200/month for SaaS scrapers |

**Break-even**: Self-hosting saves money after ~50-100 scrape requests/month compared to ScrapingBee/Zyte.

---

## Rollback Plan

If Firecrawl causes issues:

1. **Disable via feature flag**:
   ```bash
   # Vercel environment variables
   ENABLE_FIRECRAWL=false
   ```

2. **Redeploy Vercel app**:
   ```bash
   git commit --allow-empty -m "Disable Firecrawl"
   git push
   ```

3. **Application automatically falls back to OpenGraph scraper** (no code changes needed)

---

## Next Steps

After successful deployment:

1. [ ] Monitor generic title reduction (target: 25%+ improvement)
2. [ ] Track scraping success rate (target: >90%)
3. [ ] Measure p95 latency (target: <5s)
4. [ ] Document findings in `.aiwg/testing/firecrawl-production-metrics.md`
5. [ ] Update ADR-006 with production learnings
6. [ ] Consider adding full-page markdown indexing (Sprint 5)

---

## Support

- **Firecrawl OSS Issues**: https://github.com/firecrawl/firecrawl/issues
- **Contabo Support**: https://contabo.com/en/support/
- **Zero Noise Issues**: (Your GitHub repo)

---

## References

- ADR-006: Firecrawl Metadata Extraction Strategy
- Firecrawl Self-Host Guide: https://github.com/firecrawl/firecrawl/blob/main/SELF_HOST.md
- Contabo VPS Docs: https://contabo.com/en/vps/
