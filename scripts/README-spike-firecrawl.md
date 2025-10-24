# Firecrawl PoC Spike Script

**Purpose**: Compare Firecrawl vs OpenGraph scraping for URL metadata quality.

**Acceptance Criteria** (ADR-006):
- ≥25% reduction in generic titles
- ≥90% scraping success rate
- p95 latency ≤5s

---

## Prerequisites

1. **Install Dependencies**:
   ```bash
   npm install  # Installs ogs, tsx already in package.json
   ```

2. **Setup Firecrawl** (Optional - script runs without it):
   
   **Option A: Docker (Recommended)**:
   ```bash
   # Pull and run Firecrawl
   docker run -d \
     --name firecrawl \
     -p 3002:3002 \
     -e REDIS_URL=redis://host.docker.internal:6379 \
     firecrawl/firecrawl:latest
   
   # Run Redis
   docker run -d --name redis -p 6379:6379 redis:7-alpine
   ```
   
   **Option B: Docker Compose**:
   ```bash
   # Create docker-compose.yml (see ADR-006 section 5.4)
   docker-compose -f docker-compose.firecrawl.yml up -d
   ```
   
   **Verify Firecrawl**:
   ```bash
   curl http://localhost:3002/health
   # Should return 200 OK
   ```

3. **Environment Variables** (Optional):
   ```bash
   export FIRECRAWL_BASE_URL=http://localhost:3002
   export FIRECRAWL_API_KEY=your-api-key  # If Firecrawl has auth enabled
   ```

---

## Usage

### Run Spike Script

```bash
# With Firecrawl running
npm run spike:firecrawl

# Or using tsx directly
tsx scripts/spike-firecrawl.ts
```

**Note**: If Firecrawl is not running, the script will still run and compare OGS results against failures (useful for baseline).

---

## Output

**Console Output**:
- Real-time progress for each URL
- Summary statistics
- Acceptance criteria evaluation

**Files Generated**:
- `.aiwg/testing/test-results-firecrawl.csv` - Detailed results
- `.aiwg/testing/test-results-firecrawl-summary.txt` - Summary report

**Example Console Output**:
```
🔬 Firecrawl PoC Spike Script
============================================================
Testing 10 URLs...

Firecrawl URL: http://localhost:3002
✅ Firecrawl health check: 200

Testing: https://arelion.com
  OGS: Home (523ms)
  Firecrawl: Arelion – Global Connectivity Provider (2145ms)
  Winner: firecrawl

...

============================================================
📊 SUMMARY
============================================================
Total URLs tested: 10

🏷️  Generic Titles:
  OGS: 3 (30.0%)
  Firecrawl: 0 (0.0%)
  Reduction: 100.0%

✅ Success Rates:
  OGS: 100.0%
  Firecrawl: 90.0%

⚡ Latency (p95):
  OGS: 987ms
  Firecrawl: 3200ms

🏆 Winners:
  Firecrawl: 7
  OGS: 2
  Ties: 1

============================================================
✅ ACCEPTANCE CRITERIA (ADR-006)
============================================================
✅ Generic title reduction ≥25%: 100.0%
✅ Success rate ≥90%: 90.0%
✅ P95 latency ≤5s: 3200ms

🎉 ALL CRITERIA MET

📄 Results saved to: .aiwg/testing/test-results-firecrawl.csv
📄 Summary saved to: .aiwg/testing/test-results-firecrawl-summary.txt
```

---

## Customization

### Add Test URLs

Edit `scripts/spike-firecrawl.ts`:

```typescript
const TEST_URLS = [
  { url: 'https://example.com', category: 'SPA', expectedTitle: 'Example Site' },
  // Add more...
]
```

### Adjust Timeouts

```typescript
// In scrapeWithOgs() and scrapeWithFirecrawl()
signal: AbortSignal.timeout(5000) // Change to 10000 for 10s timeout
```

---

## Troubleshooting

**Firecrawl connection refused**:
```bash
# Check if Firecrawl is running
docker ps | grep firecrawl

# Check logs
docker logs firecrawl
```

**OGS timeouts**:
- Some sites block automated scraping
- Increase timeout in `scrapeWithOgs()`

**All URLs failing**:
- Check internet connection
- Try running with fewer URLs (comment out some in TEST_URLS)

---

## Next Steps

1. **Review Results**: Check CSV and summary files
2. **Document Findings**: Add summary to ADR-006 Implementation Tasks
3. **Proceed with Integration**: If criteria met, implement Firecrawl integration in `src/lib/urlScraper.ts`

---

## Related Documentation

- ADR-006: `.aiwg/architecture/adr/ADR-006-firecrawl-metadata-extraction.md`
- Firecrawl Docs: https://github.com/firecrawl/firecrawl
- Architecture Doc: `.aiwg/architecture/software-architecture-doc.md` (section 5.4)
