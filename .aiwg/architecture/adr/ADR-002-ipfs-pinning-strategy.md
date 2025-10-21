# ADR-002: Multi-Provider IPFS Pinning Strategy

**Status**: Accepted  
**Date**: 2025-10-21  
**Deciders**: chronode  
**Tags**: ipfs, storage, reliability

---

## Context and Problem Statement

IPFS content is ephemeral unless pinned. Need reliable pinning strategy that balances cost, redundancy, and ease of integration while staying within $50/mo budget for MVP (<50 users, <100GB storage).

**Key Requirements**:
- Files persist indefinitely (no link rot)
- Redundancy (no single point of failure)
- Free tier sufficient for MVP
- S3-compatible API preferred (ease of integration)
- Automatic pinning on upload

---

## Decision Drivers

- **Cost**: Free tier critical for MVP validation
- **Reliability**: Pinning must succeed >95% of time
- **Redundancy**: Multi-provider fallback
- **Developer experience**: Simple API, good documentation
- **Performance**: Fast pinning (<5s), fast retrieval (<5s p95)

---

## Considered Options

### Option 1: Single Provider (Filebase Only)

**Provider**: Filebase (S3-compatible IPFS pinning)

**Pros**:
- 5GB free tier (sufficient for MVP <50 users)
- S3-compatible API (familiar, well-documented)
- Automatic IPFS pinning + CDN delivery
- Mature, stable, backed by funding

**Cons**:
- **Single point of failure** (if Filebase down, all uploads fail)
- Free tier limit (need plan if exceeding 5GB)

**Cost**: $0/mo (free tier), $5/100GB after

---

### Option 2: Multi-Provider Redundancy

**Primary**: Filebase (5GB free)  
**Secondary**: Web3.Storage (free tier, Protocol Labs)  
**Tertiary**: NFT.Storage (free tier, Protocol Labs)

**Pros**:
- **No single point of failure** (if one provider down, others work)
- Combined free tier: ~15GB (3 providers × 5GB each)
- Cost spreading (reduce vendor lock-in)

**Cons**:
- **Increased complexity** (3 API integrations, error handling)
- Slower uploads (pin to multiple providers sequentially or parallel)
- API inconsistencies (S3-compatible vs native IPFS API)

**Cost**: $0/mo (free tiers combined)

---

### Option 3: Self-Hosted IPFS Node

**Provider**: Own IPFS Kubo node on VPS

**Pros**:
- Full control, no vendor dependency
- Unlimited storage (VPS disk size)
- Learning opportunity (IPFS deep dive)

**Cons**:
- **High operational burden** (solo developer, part-time)
- VPS cost ($5-10/mo minimum)
- Reliability concerns (no SLA, self-managed uptime)
- Complexity (networking, NAT traversal, monitoring)

**Cost**: $5-10/mo (VPS) + time investment

---

## Decision Outcome

**Chosen**: **Option 2: Multi-Provider Redundancy (Filebase + Storacha)**

**Rationale**:
- **Redundancy critical** for true decentralization (no single point of failure)
- **Filebase (primary)**: S3-compatible API, 5GB free, dedicated gateways, fast integration
- **Storacha (secondary)**: Formerly Web3.Storage, Filecoin-backed, 99.9% uptime, free tier
- Combined free tier: ~10GB+ (sufficient for MVP runway)
- Different underlying infrastructure (Filebase + Filecoin) = true redundancy
- Storacha adds Filecoin provable storage (cryptographic proofs)
- Async secondary pinning = no upload latency impact

**Implementation**:
```typescript
async function pinFile(file: File): Promise<string> {
  try {
    // Primary: Filebase (S3-compatible, synchronous)
    const cid = await pinToFilebase(file);
    
    // Secondary: Storacha (async, background redundancy)
    // Storacha stores to Filecoin + IPFS (double redundancy)
    pinToStoracha(file, cid).catch(err => 
      log.warn('Secondary pin to Storacha failed', err)
    );
    
    return cid;
  } catch (filebaseError) {
    // Fallback: If Filebase fails, try Storacha synchronously
    log.error('Filebase pin failed, falling back to Storacha', filebaseError);
    return await pinToStoracha(file);
  }
}
```

---

## Consequences

**Positive**:
- **True redundancy**: Different infrastructure (Filebase + Filecoin)
- **No single point of failure**: If one provider down, other works
- **Combined free tier**: ~10GB+ (Filebase 5GB + Storacha free)
- **Filecoin provable storage**: Cryptographic proofs (via Storacha)
- **99.9% uptime**: Storacha SLA + Filebase reliability
- **Cost spreading**: Reduces vendor lock-in risk

**Negative**:
- **Increased complexity**: 2 API integrations (S3 + Storacha SDK)
- **Async secondary pinning**: Fire-and-forget complexity
- **Monitoring overhead**: Track both providers' health

**Mitigations**:
- **Primary pin synchronous** (Filebase), secondary async (Storacha) = no user-facing latency
- **Health monitoring**: Alert if either provider fails >5% of time
- **Graceful degradation**: If both fail, queue uploads and retry
- **Cost management**: Alert at 80% combined free tier (8GB), evaluate paid tiers

---

## Monitoring

**Metrics to Track**:
- **Pin success rate per provider** (target: >95% each, >99% combined)
- **Pin latency per provider** (Filebase target: <5s p95, Storacha: best-effort async)
- **Storage capacity per provider** (alert at 80%: Filebase 4GB, Storacha varies)
- **Failover rate** (how often Storacha used as primary fallback)
- **Provider uptime** (monitor via Uptime Robot: Filebase, Storacha APIs)

**Tools**:
- Uptime Robot: Ping Filebase/Web3.Storage APIs
- Sentry: Track pin failures, log errors
- Custom dashboard: Storage capacity gauge

---

## Scaling Plan

**If free tier exceeded** (>5GB Filebase, varies Storacha):
1. Evaluate usage across providers (may have headroom on Storacha)
2. Upgrade Filebase paid tier: $5/100GB (cost-effective)
3. Evaluate Storacha paid tier if needed
4. Add 3rd provider (NFT.Storage, Pinata) if costs prohibitive
5. Seek grants (IPFS ecosystem, Protocol Labs, Filecoin Foundation)
6. Community donations (if open source gains traction)

---

## Related Decisions

- ADR-003: IPFS Gateway Fallback Architecture
- ADR-001: Frontend Framework Selection (Helia integration)
