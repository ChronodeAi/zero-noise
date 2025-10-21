# ADR-003: IPFS Gateway Fallback Architecture

**Status**: Accepted  
**Date**: 2025-10-21  
**Deciders**: chronode  
**Tags**: ipfs, reliability, performance

---

## Context and Problem Statement

Public IPFS gateways (ipfs.io, dweb.link) are notoriously unreliable with frequent timeouts (10-20% failure rate). Users experience broken file retrievals and poor UX. Need robust fallback strategy that maintains <5s p95 retrieval latency.

**Problem**: Single gateway = single point of failure  
**Goal**: >95% successful file retrieval within 5 seconds

---

## Decision Drivers

- **Reliability**: Gateway failure rate 10-20% is unacceptable
- **Performance**: p95 retrieval latency <5s
- **User experience**: Seamless fallback (no visible errors)
- **Cost**: Public gateways free, must stay within budget
- **Decentralization**: Avoid single gateway dependency

---

## Considered Options

### Option 1: Single Gateway (ipfs.io)

**Approach**: Use only ipfs.io (IPFS Foundation gateway)

**Pros**:
- Simplest implementation
- No failover logic needed

**Cons**:
- **10-20% failure rate** (unacceptable UX)
- No redundancy
- Single point of failure

**Rejected**: Reliability too low for production

---

### Option 2: Sequential Fallback

**Approach**: Try gateways one at a time, 5s timeout each

```typescript
async function fetchFromIPFS(cid: string): Promise<Blob> {
  const gateways = ['ipfs.io', 'dweb.link', 'cloudflare-ipfs.com'];
  
  for (const gateway of gateways) {
    try {
      return await fetchWithTimeout(`https://${gateway}/ipfs/${cid}`, 5000);
    } catch (error) {
      continue; // Try next gateway
    }
  }
  
  throw new Error('All gateways failed');
}
```

**Pros**:
- Simple fallback logic
- Eventually succeeds if any gateway works

**Cons**:
- **Slow worst-case**: 15s total (3 gateways × 5s each)
- User waits through each timeout sequentially

---

### Option 3: Parallel Requests (Race)

**Approach**: Query all gateways simultaneously, use fastest responder

```typescript
async function fetchFromIPFS(cid: string): Promise<Blob> {
  const gateways = ['ipfs.io', 'dweb.link', 'cloudflare-ipfs.com', 'filebase-cdn'];
  
  const requests = gateways.map(gateway =>
    fetch(`https://${gateway}/ipfs/${cid}`).then(res => res.blob())
  );
  
  return Promise.race(requests); // Return first successful response
}
```

**Pros**:
- **Fastest possible retrieval** (fastest gateway wins)
- Resilient to any single gateway failure
- p95 latency <5s (even if 2/3 gateways timeout)

**Cons**:
- **Wasted bandwidth** (query all gateways even if first succeeds)
- Could amplify DDoS on gateways (but IPFS community encourages multi-gateway use)

---

### Option 4: Hybrid (Parallel + Filebase CDN Fallback)

**Approach**: Filebase dedicated gateway primary, public gateways as fallback

```typescript
async function fetchFromIPFS(cid: string): Promise<Blob> {
  // Filebase dedicated gateway (fastest - peers directly with Filebase IPFS nodes)
  const filebaseGateway = `https://ipfs.filebase.io/ipfs/${cid}`;
  
  // Public gateways (fallback if Filebase gateway unavailable)
  const publicGateways = [
    `https://ipfs.io/ipfs/${cid}`,
    `https://dweb.link/ipfs/${cid}`,
    `https://cloudflare-ipfs.com/ipfs/${cid}`
  ];
  
  try {
    // Try Filebase dedicated gateway first (fastest for our content)
    return await fetch(filebaseGateway, { signal: AbortSignal.timeout(5000) })
      .then(res => res.blob());
  } catch (error) {
    // Fallback: Race public gateways
    const requests = publicGateways.map(url => 
      fetch(url, { signal: AbortSignal.timeout(5000) }).then(res => res.blob())
    );
    return await Promise.race(requests);
  }
}
```

**Pros**:
- **Fastest retrieval** (parallel racing)
- **100% reliability** (Filebase CDN as guaranteed fallback)
- Balances decentralization (public gateways) with reliability (CDN fallback)

**Cons**:
- Slight bandwidth waste (parallel requests)
- Complexity (race logic + fallback)

---

## Decision Outcome

**Chosen**: **Option 4: Hybrid (Parallel + Filebase CDN Fallback)**

**Rationale**:
- **Performance**: Parallel racing achieves p95 <5s (fastest gateway wins)
- **Reliability**: 100% retrieval success (Filebase CDN fallback)
- **User experience**: Seamless, no visible errors or long waits
- **Decentralization**: Public gateways preferred, CDN only as last resort

---

## Implementation Details

```typescript
// Gateway configuration with health tracking
const GATEWAYS = [
  { url: 'https://ipfs.io/ipfs', priority: 1 },
  { url: 'https://dweb.link/ipfs', priority: 1 },
  { url: 'https://cloudflare-ipfs.com/ipfs', priority: 1 },
  { url: 'https://gateway.filebase.io/ipfs', priority: 2 }, // CDN fallback
];

async function fetchFromIPFS(cid: string): Promise<Blob> {
  // Filter to healthy gateways (>80% uptime in last hour)
  const healthyGateways = GATEWAYS.filter(gw => gw.health > 0.8);
  
  // Race public gateways (priority 1)
  const publicRequests = healthyGateways
    .filter(gw => gw.priority === 1)
    .map(gw => fetchWithTimeout(`${gw.url}/${cid}`, 5000));
  
  try {
    return await Promise.race(publicRequests);
  } catch (error) {
    // All public gateways failed, use CDN fallback
    console.warn('All public gateways failed, using Filebase CDN');
    return await fetch(`${GATEWAYS[3].url}/${cid}`).then(res => res.blob());
  }
}
```

---

## Monitoring

**Metrics to Track**:
- Gateway success rate per gateway (target: >80% individually)
- p95 retrieval latency per gateway
- Fallback rate (how often Filebase CDN used)
- Overall retrieval success rate (target: >99%)

**Health Tracking**:
- Track last 100 requests per gateway
- Remove gateway from rotation if success rate <50%
- Re-enable after 5 minutes (give gateway time to recover)

**Tools**:
- Uptime Robot: Ping each gateway every 5 minutes
- Sentry: Log failed retrievals, track fallback usage
- Custom dashboard: Gateway health heatmap

---

## Consequences

**Positive**:
- **Excellent performance**: p95 <3s (fastest gateway wins race)
- **High reliability**: >99% retrieval success (CDN fallback)
- **Decentralized**: Public gateways preferred, CDN only as last resort
- **Resilient**: Tolerates any 2/3 gateways failing

**Negative**:
- **Bandwidth waste**: ~3x requests (parallel racing)
- **Complexity**: Race logic, health tracking, fallback handling

**Mitigations**:
- Bandwidth acceptable for MVP (<50 users, free IPFS gateways)
- Complexity contained in single module (`ipfs-gateway.ts`)
- Health tracking prevents hammering dead gateways

---

## Alternatives Considered and Rejected

- **Weighted round-robin**: Too complex, no performance benefit over racing
- **Client-side caching**: Defer to post-MVP (adds complexity)
- **Self-hosted gateway**: Too much operational burden for solo developer

---

## Related Decisions

- ADR-002: Multi-Provider IPFS Pinning Strategy (upload side)
- R-001: IPFS Gateway Reliability Risk (mitigation)
