# Zero Noise Production Monitoring Setup

This guide walks through setting up Prometheus and Grafana monitoring for the Zero Noise scraper.

## Architecture Overview

```
Zero Noise App (Vercel)
    ↓ /api/metrics (Prometheus format)
Prometheus Server (scrapes every 15s)
    ↓ stores time-series data
Grafana Dashboard (visualizes + alerts)
```

## Prerequisites

- Docker installed (for Prometheus and Grafana)
- Access to production Vercel deployment
- Domain configured for monitoring (optional)

## Step 1: Deploy Prometheus

### 1.1 Update Prometheus Configuration

Edit `prometheus.yml` and replace `your-app.vercel.app` with your actual Vercel domain:

```yaml
scrape_configs:
  - job_name: 'zero-noise-scraper'
    metrics_path: '/api/metrics'
    scheme: https
    static_configs:
      - targets: ['zero-noise.vercel.app']  # ← Update this
```

### 1.2 Run Prometheus Container

```bash
# From project root
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v $(pwd)/.aiwg/deployment/prometheus.yml:/etc/prometheus/prometheus.yml \
  -v prometheus-data:/prometheus \
  prom/prometheus
```

### 1.3 Verify Prometheus is Scraping

1. Open http://localhost:9090
2. Go to Status → Targets
3. Verify `zero-noise-scraper` job shows as **UP** (green)
4. If DOWN, check:
   - Vercel deployment is live
   - `/api/metrics` endpoint returns data
   - Domain is correct in prometheus.yml

### 1.4 Test Metrics Query

In Prometheus UI (http://localhost:9090/graph), try query:

```promql
rate(scraper_requests_total[5m])
```

You should see non-zero values if scraping is active.

## Step 2: Deploy Grafana

### 2.1 Run Grafana Container

```bash
docker run -d \
  --name grafana \
  -p 3001:3000 \
  -v grafana-storage:/var/lib/grafana \
  grafana/grafana-oss
```

**Note**: Using port 3001 to avoid conflict with Next.js dev server (port 3000)

### 2.2 Initial Grafana Setup

1. Open http://localhost:3001
2. Login with default credentials:
   - Username: `admin`
   - Password: `admin`
3. Set new admin password when prompted

### 2.3 Add Prometheus Data Source

1. Go to **Configuration → Data Sources**
2. Click **Add data source**
3. Select **Prometheus**
4. Configure:
   - **Name**: `Prometheus`
   - **URL**: `http://host.docker.internal:9090` (Mac/Windows) or `http://172.17.0.1:9090` (Linux)
   - Leave other settings as default
5. Click **Save & Test** (should show green success)

### 2.4 Import Zero Noise Dashboard

1. Go to **Dashboards → Import**
2. Click **Upload JSON file**
3. Select `.aiwg/deployment/grafana-dashboard.json`
4. Configure:
   - **Name**: Zero Noise Scraper Monitoring (pre-filled)
   - **Folder**: General (or create new folder)
   - **Prometheus**: Select the Prometheus data source from dropdown
5. Click **Import**

You should now see the dashboard with 7 panels:
- ✅ Scraper Success Rate by Source
- ✅ Request Latency (p50, p95, p99)
- ✅ Generic Title Rate by Source
- ✅ Firecrawl Circuit Breaker State
- ✅ Firecrawl Failure Count
- ✅ Requests per Second by Source
- ✅ Retry Success Rate

## Step 3: Configure Alerts

### 3.1 Load Alert Rules into Prometheus

Alert rules are defined in `grafana-alerts.yml`. To load them:

#### Option A: Mount alerts file in Prometheus container

Stop and restart Prometheus with alerts:

```bash
docker stop prometheus
docker rm prometheus

docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v $(pwd)/.aiwg/deployment/prometheus.yml:/etc/prometheus/prometheus.yml \
  -v $(pwd)/.aiwg/deployment/grafana-alerts.yml:/etc/prometheus/alerts.yml \
  -v prometheus-data:/prometheus \
  prom/prometheus \
  --config.file=/etc/prometheus/prometheus.yml \
  --storage.tsdb.path=/prometheus \
  --web.console.libraries=/usr/share/prometheus/console_libraries \
  --web.console.templates=/usr/share/prometheus/consoles
```

Then update `prometheus.yml` to reference the alerts file:

```yaml
rule_files:
  - '/etc/prometheus/alerts.yml'
```

#### Option B: Use Grafana Alerting (Recommended)

Grafana has built-in alerting that's easier to configure:

1. Go to **Alerting → Alert rules** in Grafana
2. Click **New alert rule**
3. For each alert in `grafana-alerts.yml`, create a corresponding Grafana alert:

**Example: LowSuccessRate Alert**

- **Alert name**: `LowSuccessRate`
- **Query A**:
  ```promql
  sum(rate(scraper_requests_total{status="success"}[5m])) / sum(rate(scraper_requests_total[5m]))
  ```
- **Condition**: `WHEN last() OF A IS BELOW 0.9`
- **For**: `5m` (alert after condition persists for 5 minutes)
- **Labels**:
  - `severity: warning`
  - `component: scraper`
- **Annotations**:
  - **Summary**: `Scraper success rate below 90%`
  - **Description**: `Success rate is {{ $value | humanizePercentage }} (threshold: 90%)`

Repeat for all 8 alerts defined in `grafana-alerts.yml`.

### 3.2 Configure Alert Notifications

1. Go to **Alerting → Contact points**
2. Add notification channels:
   - **Email**: Configure SMTP settings
   - **Slack**: Add webhook URL
   - **PagerDuty**: Add integration key
   - **Discord/Teams/etc**: Configure webhook

3. Go to **Alerting → Notification policies**
4. Create routing rules based on severity:
   - `severity=critical` → PagerDuty (immediate)
   - `severity=warning` → Slack (batched every 5 min)
   - `severity=info` → Email (daily digest)

## Step 4: Verify Monitoring

### 4.1 Generate Test Traffic

Trigger some scraping requests to populate metrics:

```bash
# Test scraping endpoint
curl -X POST https://your-app.vercel.app/api/scrape-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### 4.2 Check Dashboard

1. Go to Grafana dashboard
2. Verify data is flowing:
   - Success rate should show ~90-100%
   - Latency should show reasonable values (< 5s)
   - Circuit breaker should be CLOSED (0)
   - Failure count should be low (< 3)

### 4.3 Test Alert

Trigger a test alert to verify notification pipeline:

1. **Option A**: Use Grafana UI
   - Go to alert rule
   - Click **Test** button
   - Check if notification received

2. **Option B**: Simulate failure
   - Disable Firecrawl temporarily (set `ENABLE_FIRECRAWL=false`)
   - Make 5+ scraping requests
   - Circuit breaker should open
   - Alert should fire within 5 minutes

## Production Deployment Options

### Option 1: Docker Compose (Recommended)

Create `docker-compose.monitoring.yml`:

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - ./grafana-alerts.yml:/etc/prometheus/alerts.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    restart: unless-stopped

  grafana:
    image: grafana/grafana-oss
    ports:
      - "3001:3000"
    volumes:
      - grafana-storage:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=<strong-password>
      - GF_SERVER_ROOT_URL=https://monitoring.yourdomain.com
    depends_on:
      - prometheus
    restart: unless-stopped

volumes:
  prometheus-data:
  grafana-storage:
```

Deploy:

```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

### Option 2: Managed Services

Use cloud-managed alternatives:

- **Prometheus**: Grafana Cloud, AWS Managed Prometheus, Google Cloud Monitoring
- **Grafana**: Grafana Cloud (free tier: 10k series, 14-day retention)

Benefits:
- No infrastructure management
- High availability
- Better retention policies
- Integrated alerting

### Option 3: Deploy on Contabo VPS

If deploying Firecrawl to Contabo VPS, co-locate monitoring:

```bash
# SSH to VPS
ssh root@your-vps-ip

# Install Docker (if not already)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Deploy monitoring stack
cd /opt/zero-noise-monitoring
docker-compose -f docker-compose.monitoring.yml up -d

# Configure reverse proxy for Grafana (optional)
# Use nginx/caddy to expose Grafana at https://monitoring.yourdomain.com
```

## Alert Reference

### Critical Alerts (Immediate Response)

1. **CircuitBreakerOpen**: Firecrawl circuit breaker open for 5+ minutes
   - **Action**: Check Firecrawl service health, review recent errors
   - **SLA Impact**: High (scraping degraded)

2. **NoScraperActivity**: No scraping requests for 10+ minutes
   - **Action**: Check app deployment, verify API endpoints accessible
   - **SLA Impact**: Critical (complete outage)

### Warning Alerts (Review Within 1 Hour)

3. **LowSuccessRate**: Success rate < 90% for 5+ minutes
   - **Action**: Review error logs, check external service health

4. **HighLatency**: p95 latency > 5 seconds for 5+ minutes
   - **Action**: Check Firecrawl performance, review anti-bot strategies

5. **HighFailureCount**: 3+ failures in 2 minutes
   - **Action**: Investigate specific URLs causing failures

6. **HighRetryRate**: Average > 2 retries per request
   - **Action**: Review retry strategy configuration, check upstream services

### Info Alerts (Review Daily)

7. **HighGenericTitleRate**: > 30% generic titles for 10+ minutes
   - **Action**: Assess scraping quality, consider schema extraction improvements

8. **HighRobotsTxtDisallowRate**: > 50% requests blocked by robots.txt
   - **Action**: Review URL sources, adjust ethical scraping policies

## Troubleshooting

### Prometheus Not Scraping

**Symptom**: Targets show DOWN in Prometheus UI

**Fixes**:
1. Verify Vercel deployment is live: `curl https://your-app.vercel.app/api/metrics`
2. Check DNS resolution: `nslookup your-app.vercel.app`
3. Check firewall/network connectivity
4. Review Prometheus logs: `docker logs prometheus`

### Grafana Dashboard Shows "No Data"

**Fixes**:
1. Verify Prometheus data source connected (green check mark)
2. Check time range (default: last 1 hour)
3. Verify metrics are being scraped: Go to Prometheus → Graph → Run query
4. Check dashboard variable configuration

### Alerts Not Firing

**Fixes**:
1. Verify alert rules loaded: Prometheus UI → Alerts
2. Check alert evaluation interval: Should be 15s in prometheus.yml
3. Verify notification channels configured in Grafana
4. Test alert manually: Grafana → Alert rule → Test

### High Memory Usage

**Symptom**: Prometheus using > 4GB RAM

**Fixes**:
1. Reduce scrape interval: Change from 15s to 30s or 60s
2. Reduce retention period: Add `--storage.tsdb.retention.time=7d` to Prometheus command
3. Use remote storage: Configure remote write to long-term storage (S3, GCS)

## Metrics Reference

### Core Scraping Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `scraper_requests_total` | Counter | Total scraper requests by source and status |
| `scraper_request_duration_seconds` | Histogram | Scraper request duration (buckets: 0.1s, 0.5s, 1s, 2s, 5s, 10s, 30s) |
| `scraper_generic_titles_total` | Counter | Count of generic/low-quality titles scraped |

### Firecrawl Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `firecrawl_circuit_breaker_state` | Gauge | Circuit breaker state (0=closed, 1=open) |
| `firecrawl_failures_total` | Gauge | Current failure count |

### Retry Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `retry_attempts_total` | Counter | Total retry attempts by operation, status, attempt number |
| `retry_duration_seconds` | Histogram | Total retry duration including delays |

### Quality Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `robots_txt_checks_total` | Counter | Robots.txt check results (allowed, disallowed, error) |
| `schema_extraction_total` | Counter | Schema extraction attempts by type and success |
| `user_agent_rotation_total` | Counter | User agent rotation events by agent type |

## Next Steps

1. ✅ Complete this monitoring setup
2. ⏳ Run monitoring for 24-48 hours to establish baselines
3. ⏳ Tune alert thresholds based on actual production traffic
4. ⏳ Configure on-call rotation for critical alerts
5. ⏳ Create runbooks for common alert scenarios
6. ⏳ Set up log aggregation (optional: ELK, Loki, Datadog)

## Support

- **Prometheus Docs**: https://prometheus.io/docs/
- **Grafana Docs**: https://grafana.com/docs/
- **prom-client (Node.js)**: https://github.com/siimon/prom-client
- **ADR-006**: `.aiwg/architecture/adr/ADR-006-firecrawl-metadata-extraction.md` (monitoring requirements)
