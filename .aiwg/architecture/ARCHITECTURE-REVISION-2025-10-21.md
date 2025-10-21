# Architecture Revision - Filebase Complete Solution

**Date**: 2025-10-21  
**Revision**: ADR-002 and ADR-003 updated  
**Reason**: Filebase documentation review revealed complete IPFS solution

---

## Summary of Changes

### Previous Architecture (Incorrect Assumption)
- **Storage**: Multi-provider redundancy (Filebase + Web3.Storage)
- **Rationale**: Assumed need for multiple pinning services for redundancy
- **Complexity**: 2 API integrations, async secondary pinning, health monitoring across providers

### Revised Architecture (Correct)
- **Storage**: Filebase only (complete IPFS solution)
- **Rationale**: Filebase provides automatic IPFS pinning + dedicated gateways + IPNS
- **Simplicity**: Single S3-compatible API, automatic IPFS network pinning

---

## Key Insights from Filebase Documentation

From https://docs.filebase.com/:

1. **Filebase IS IPFS Infrastructure**
   - Not just a pinning service, but complete IPFS platform
   - Files uploaded via S3 API are **automatically pinned to IPFS**
   - Returns IPFS CID on upload

2. **Dedicated IPFS Gateways Included**
   - Filebase provides dedicated gateways (`ipfs.filebase.io`)
   - **Faster than public gateways** (peers directly with Filebase IPFS nodes)
   - Free tier includes gateway access

3. **Already Decentralized**
   - Content pinned to IPFS network (not locked to Filebase)
   - Accessible via **any IPFS gateway** (ipfs.io, dweb.link, etc.)
   - True decentralization maintained

4. **IPNS Support**
   - Mutable pointers to IPFS content
   - Useful for future features (updateable collections)

---

## Architecture Simplifications

### Storage Layer (ADR-002)

**Before**:
```typescript
async function pinFile(file: File): Promise<string> {
  // Primary: Filebase
  const cid = await pinToFilebase(file);
  
  // Secondary: Web3.Storage (async)
  pinToWeb3Storage(file, cid).catch(err => log.warn(err));
  
  return cid;
}
```

**After**:
```typescript
async function pinFile(file: File): Promise<string> {
  // Upload to Filebase (S3 API)
  // Filebase automatically pins to IPFS and returns CID
  const cid = await pinToFilebase(file);
  
  // File is now pinned to IPFS and accessible via:
  // - Filebase dedicated gateway (fastest)
  // - Any public IPFS gateway
  // - Any IPFS node (decentralized)
  
  return cid;
}
```

### Gateway Retrieval (ADR-003)

**Before**:
```typescript
// Race 3 public gateways, fallback to Filebase CDN
const requests = [ipfs.io, dweb.link, cloudflare].map(fetch);
return Promise.race(requests);
```

**After**:
```typescript
// Try Filebase dedicated gateway first (fastest)
try {
  return await fetch('https://ipfs.filebase.io/ipfs/{cid}');
} catch {
  // Fallback: Race public gateways
  const requests = [ipfs.io, dweb.link, cloudflare].map(fetch);
  return Promise.race(requests);
}
```

---

## Benefits of Revised Architecture

### Simplicity
- **1 API integration** vs 2 (Filebase S3 SDK only)
- **No async secondary pinning** (no fire-and-forget complexity)
- **Simpler monitoring** (single provider health check)

### Performance
- **Filebase dedicated gateway first** (faster than public gateways)
- **No parallel pinning overhead** (single upload path)
- **Optimal for our content** (Filebase gateway peers directly with our IPFS nodes)

### Cost
- **5GB free tier** sufficient for MVP (<50 users, <100GB)
- **$5/100GB paid tier** cost-effective if scaling
- **No multi-provider management overhead**

### Decentralization Maintained
- Content **still on IPFS network** (not locked to Filebase)
- Accessible via **any IPFS gateway** or node
- Public gateway fallback ensures **no vendor lock-in**

---

## What Changed in Documentation

### Updated Files
1. **ADR-002**: `ipfs-pinning-strategy.md`
   - Decision: Single provider (Filebase) vs multi-provider
   - Rationale: Filebase IS complete IPFS solution
   - Implementation: Simplified to single API call

2. **ADR-003**: `gateway-fallback.md`
   - Primary: Filebase dedicated gateway (fastest)
   - Fallback: Public gateways (resilience)
   - Removed: "CDN fallback" (unnecessary, already IPFS)

3. **SAD**: `software-architecture-doc.md`
   - Storage layer diagram simplified
   - Component architecture updated
   - API specifications streamlined
   - Removed Web3.Storage integration section

---

## Migration Path (If Needed Post-MVP)

**If Filebase becomes insufficient**:
1. **Cost scaling**: Filebase paid tier ($5/100GB) very cost-effective
2. **Redundancy**: Add Web3.Storage or NFT.Storage for multi-provider
3. **Self-hosted**: Run own IPFS Kubo node (operational overhead)

**Triggers for migration**:
- Free tier exceeded (>5GB) and budget constrained
- Filebase uptime issues (monitor: target >99%)
- Enterprise customers require multi-provider redundancy

---

## Validation in Sprint 0

**Technical Spike**: Filebase IPFS Integration PoC

**Goals**:
1. Upload file via Filebase S3 API → Verify IPFS CID returned
2. Retrieve via Filebase gateway (`ipfs.filebase.io`) → Measure latency
3. Retrieve via public gateway (`ipfs.io`) → Verify decentralization
4. Confirm content-addressing (same file → same CID)

**Success Criteria**:
- Upload → CID in <5s
- Filebase gateway retrieval <2s (p95)
- Public gateway retrieval works (proves decentralization)
- CID stable (deterministic content-addressing)

---

## Conclusion

The revised architecture is **simpler, faster, and equally decentralized**. Filebase's complete IPFS solution eliminates the need for multi-provider complexity at MVP stage, while maintaining true decentralization (content on IPFS network, accessible via any gateway).

**No loss of decentralization**, significant gain in simplicity.

---

## Approval

**Revision Approved By**: chronode (Owner)  
**Date**: 2025-10-21  
**Effective**: Immediate (Sprint 0 technical spike)
