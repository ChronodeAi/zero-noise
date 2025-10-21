# OrbitDB Migration Plan

**Status**: Planned for Post-MVP  
**Priority**: P2 (Nice to Have)  
**Owner**: chronode

---

## Current Architecture (MVP)

```
┌─────────────┐
│   Next.js   │
│   Frontend  │
└──────┬──────┘
       │
┌──────▼──────────────┐
│  PostgreSQL (Neon)  │ ◄── Centralized metadata index
│  - Collections      │
│  - Files (CID, etc) │
└─────────────────────┘
       ▲
       │
┌──────┴──────────────┐
│  Filebase (IPFS)    │ ◄── Decentralized file storage
│  - Actual files     │
└─────────────────────┘
```

**Why this approach:**
- Fast MVP development (Prisma + Neon = proven stack)
- Free tier for initial scale
- SQL for complex queries (AI retrieval, search, analytics)
- Easy local development

---

## Target Architecture (Post-MVP with OrbitDB)

```
┌─────────────┐
│   Next.js   │
│   Frontend  │
└──────┬──────┘
       │
┌──────▼──────────────┐
│   PostgreSQL        │ ◄── Cache layer (optional)
│   (Read replicas)   │     Fast queries
└─────────────────────┘
       ▲
       │ sync
┌──────▼──────────────┐
│    OrbitDB          │ ◄── P2P decentralized database
│  - Collections      │     (IPFS-based)
│  - Files metadata   │
└─────────────────────┘
       ▲
       │
┌──────┴──────────────┐
│  Filebase (IPFS)    │ ◄── Decentralized file storage
│  - Actual files     │
└─────────────────────┘
```

**Benefits of OrbitDB:**
- Truly decentralized metadata (no central DB dependency)
- P2P replication (users can host their own indexes)
- Database address is a CID (shareable on IPFS)
- Censorship-resistant
- No hosting costs for database

---

## Migration Strategy

### Phase 1: Dual Write (2-3 sprints)
1. Add OrbitDB alongside Postgres
2. Write to both databases on upload
3. Read from Postgres (fast)
4. Validate OrbitDB writes in background

**Implementation:**
```typescript
// src/lib/database.ts
export async function saveCollection(data: CollectionData) {
  // Primary: Write to Postgres
  const pgResult = await prisma.collection.create({ data })
  
  // Secondary: Write to OrbitDB (non-blocking)
  orbitDB.collections.put(data).catch(err => {
    console.error('OrbitDB sync failed:', err)
    // Log for retry queue
  })
  
  return pgResult
}
```

### Phase 2: Read Migration (1-2 sprints)
1. Add feature flag for OrbitDB reads
2. Gradually shift traffic to OrbitDB
3. Keep Postgres as fallback
4. Monitor performance and consistency

**Implementation:**
```typescript
export async function getCollection(id: string) {
  if (FEATURE_FLAGS.useOrbitDB) {
    try {
      return await orbitDB.collections.get(id)
    } catch (err) {
      // Fallback to Postgres
      return await prisma.collection.findUnique({ where: { id } })
    }
  }
  return await prisma.collection.findUnique({ where: { id } })
}
```

### Phase 3: Postgres as Cache (1 sprint)
1. OrbitDB is primary source of truth
2. Postgres becomes read-only cache
3. Background sync from OrbitDB → Postgres
4. Use Postgres for complex queries only

### Phase 4: Full Decentralization (Optional)
1. Remove Postgres entirely
2. Use OrbitDB indexes for queries
3. Client-side OrbitDB instances
4. Users can run their own nodes

---

## Technical Considerations

### OrbitDB Setup
```bash
npm install @orbitdb/core helia @helia/unixfs
```

### Database Types
- **documents**: For collections (key-value with indexing)
- **keyvalue**: Simple CID lookups
- **events**: For activity logs

### Schema Design
```typescript
// OrbitDB collection document
{
  _id: "collection-uuid",
  createdAt: timestamp,
  orbitAddress: "/orbitdb/...", // Self-referencing
  files: [
    {
      cid: "bafybeig...",
      filename: "example.pdf",
      size: 1048576,
      mimeType: "application/pdf",
      uploadedAt: timestamp
    }
  ]
}
```

### IPFS Node Requirements
- **Development**: Local Helia node
- **Production**: 
  - Option 1: Filebase IPFS RPC (reuse existing)
  - Option 2: Dedicated Helia node on VPS
  - Option 3: Browser-embedded Helia (client-side)

---

## Performance Comparison

| Feature | PostgreSQL (Current) | OrbitDB (Future) |
|---------|---------------------|------------------|
| Write latency | ~50ms | ~500ms (IPFS pin) |
| Read latency | ~20ms | ~100-500ms (IPFS fetch) |
| Query complexity | SQL (full power) | Limited indexing |
| Decentralization | ❌ Central | ✅ P2P |
| Hosting cost | $0-20/mo | $0 (self-hosted) |
| Censorship resistance | ❌ Low | ✅ High |

---

## Migration Triggers

**When to start migration:**
1. MVP validated with users (>100 collections)
2. Demand for decentralization features
3. Hosting costs exceed comfort zone
4. Community wants to run own nodes

**Estimated timeline:** 6-8 weeks for full migration

---

## Rollback Plan

If OrbitDB migration fails:
1. Disable feature flag → revert to Postgres
2. Database dump from OrbitDB → Postgres import
3. No data loss (dual-write during Phase 1)

---

## Resources

- [OrbitDB Documentation](https://github.com/orbitdb/orbitdb)
- [Helia (IPFS) Documentation](https://helia.io/)
- [OrbitDB + Next.js Examples](https://github.com/orbitdb/orbit-db-examples)

---

**Next Actions** (Post-MVP):
1. Create OrbitDB proof-of-concept
2. Benchmark OrbitDB vs Postgres performance
3. Design sync strategy
4. Implement dual-write pattern

---

**Last Updated**: 2025-10-21  
**Phase**: Planning (Pre-Migration)
