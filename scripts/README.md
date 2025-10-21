# Sprint 0: Technical Validation Spikes

Technical validation scripts for Zero Noise IPFS integration.

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Set required environment variables**:
   ```bash
   export FILEBASE_IPFS_RPC_ENDPOINT="https://rpc.filebase.io"
   export FILEBASE_IPFS_RPC_KEY="your_base64_key_here"
   export STORACHA_DID="did:key:z6MknwmQg1FgQXqXkUq3187NTeXFxRbuYMbTi3ErEvZow73j"
   ```

## Spikes

### 1. Filebase IPFS RPC Upload

**Purpose**: Validate Filebase IPFS RPC API integration.

**Run**:
```bash
npm run spike:filebase
```

**Expected Results**:
- ✅ Upload latency <5s for <10MB files
- ✅ CID accessible via ipfs.filebase.io gateway
- ✅ Content verified via retrieval

**Success Criteria**:
- 100% upload success rate
- p95 upload latency <5s
- p95 retrieval latency <2s

---

### 2. Storacha Integration Pattern

**Purpose**: Validate async secondary pinning pattern.

**Run**:
```bash
npm run spike:storacha
```

**Expected Results**:
- ✅ Integration pattern validated
- ✅ Fire-and-forget async suitable
- ✅ Multi-provider redundancy confirmed

**Success Criteria**:
- Pattern matches architecture design
- Async secondary pinning viable
- No blocking on secondary pin

---

### 3. Gateway Fallback Testing

**Purpose**: Measure gateway reliability and latency.

**Run**:
```bash
npm run spike:gateways
```

**Expected Results**:
- ✅ Each gateway >90% success rate
- ✅ Combined success rate >99%
- ✅ p95 latency <5s

**Success Criteria**:
- Filebase gateway fastest (primary)
- Public gateways viable fallback
- Combined >99% retrieval success

---

## Run All Spikes

```bash
npm run spike:all
```

## Results

Document results in `.aiwg/risks/technical-spike-report.md`:
- Actual latencies vs targets
- Success rates vs thresholds
- Architecture validation
- Risk mitigation confirmation

## Next Steps

After spikes complete:
1. Document results in spike report
2. Update architecture if needed
3. Proceed to user stories (Days 6-8)
4. Master test plan (Day 9)
5. Sprint 1 planning (Day 10)
