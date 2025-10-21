# Zero Noise - Architecture Sketch

**Project**: Zero Noise  
**Date**: 2025-10-21  
**Version**: 1.0 (Inception Baseline)  
**Owner**: chronode

---

## Architecture Vision

Zero Noise is a **decentralized P2P file sharing platform** built on IPFS with a hybrid architecture combining browser-based interactions, serverless edge functions, and distributed storage providers.

**Core Principles**:
- **Decentralization**: IPFS for content-addressed storage, no centralized databases
- **Zero Noise UX**: Minimal interface, friction-free upload/share workflow
- **Resilience**: Multi-gateway fallback, multi-provider pinning
- **Privacy**: Anonymous uploads, no user tracking

---

## Component Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         User Browser                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │          Frontend (React/Next.js + TypeScript)        │  │
│  │  - Drag-drop UI                                       │  │
│  │  - File validation (client-side)                     │  │
│  │  - IPFS CID generation (optional Helia browser node) │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    Edge CDN (Vercel/Netlify)                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Serverless Functions (Edge/Lambda)                   │  │
│  │  - File validation (server-side)                      │  │
│  │  - Web scraping (OpenGraph, YouTube API)             │  │
│  │  - IPFS pinning orchestration                        │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    IPFS Storage Layer                         │
│  ┌────────────┐   ┌──────────────┐   ┌──────────────┐       │
│  │  Filebase  │   │ Web3.Storage │   │  Public IPFS │       │
│  │  (Primary) │   │ (Secondary)  │   │   Gateways   │       │
│  │  S3-compat │   │   Pinning    │   │   (Fallback) │       │
│  └────────────┘   └──────────────┘   └──────────────┘       │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    Optional: Metadata Index                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  OrbitDB (decentralized) OR PocketBase (lightweight)  │  │
│  │  - Collection metadata (CIDs, filenames)              │  │
│  │  - Search index (optional)                            │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## Component Descriptions

### 1. Frontend Web App

**Technology**: React/Next.js or SvelteKit (decision: ADR-001)  
**Deployment**: Vercel or Netlify (global CDN)  
**Responsibilities**:
- Drag-and-drop file upload interface
- Client-side file validation (MIME type, size limits, magic bytes)
- IPFS CID generation (via Helia browser IPFS node, optional)
- Collection browsing interface (file list, type filters, search)
- P2P link generation and sharing

**Key Libraries**:
- `helia` or `js-ipfs`: Browser IPFS client
- `file-type`: Magic bytes validation
- `tailwindcss`: Minimal styling
- `react-dropzone`: Drag-drop UI component

---

### 2. Edge Functions (Serverless)

**Technology**: Vercel Edge Functions or Netlify Functions  
**Responsibilities**:
- Server-side file validation (re-check MIME, magic bytes)
- IPFS pinning orchestration (Filebase API calls)
- Web link metadata scraping (OpenGraph, YouTube API)
- Optional: Virus scanning API integration (VirusTotal)

**Rationale**: Hybrid approach reduces client-side complexity, enables server-side security controls

---

### 3. IPFS Storage Layer

**Primary Provider**: **Filebase**
- S3-compatible IPFS pinning API
- 5GB free tier (sufficient for MVP <50 users)
- Automatic IPFS pinning + CDN delivery
- Why: Mature, stable, well-documented

**Secondary Provider**: **Web3.Storage** (optional)
- Redundant pinning for critical files
- Additional free storage quota
- Fallback if Filebase quota exceeded

**Public IPFS Gateways**:
- ipfs.io, dweb.link, cloudflare-ipfs.com
- Used as fallback for file retrieval
- Monitored for uptime, removed if consistently failing

**Decisionality**: ADR-002 (Multi-Provider Pinning Strategy)

---

### 4. Gateway Fallback Strategy

**Problem**: Public IPFS gateways unreliable (10-20% failure rate)

**Solution**: Multi-gateway fallback with parallel requests
1. Primary: ipfs.io (IPFS Foundation)
2. Secondary: dweb.link (Protocol Labs)
3. Tertiary: cloudflare-ipfs.com (Cloudflare)
4. Quaternary: Filebase CDN (S3-compatible URL, always works)

**Timeout**: 5 seconds per gateway, fail fast and move to next

**Decision**: ADR-003 (Gateway Fallback Architecture)

---

### 5. Optional Metadata Index

**Problem**: IPFS queries slow for listing many files in collection

**Options**:
1. **OrbitDB** (decentralized database on IPFS)
   - Pros: Fully decentralized, aligns with project ethos
   - Cons: Complex, overkill for MVP

2. **PocketBase** (lightweight SQLite with Go backend)
   - Pros: Simple, fast queries, easy deployment
   - Cons: Centralized (defeats decentralization goal)

3. **No index** (pure IPFS)
   - Pros: Simplest, no extra dependency
   - Cons: Slow browsing for large collections

**MVP Decision**: Pure IPFS initially, defer indexing to post-MVP (ADR-004)

---

## Data Flow

### Upload Flow
```
1. User drags 10 PDFs → Frontend
2. Frontend validates (MIME, size) → Pass
3. Frontend uploads to Filebase API via edge function
4. Filebase pins to IPFS → Returns CIDs
5. Frontend creates directory CID with all file CIDs
6. Frontend generates shareable link: zeronoise.app/share/{collection-CID}
7. User copies link, shares with collaborators
```

### Retrieval Flow
```
1. Recipient clicks zeronoise.app/share/{CID}
2. Frontend queries IPFS gateway (ipfs.io) for {CID}
3. If timeout (>5s) → Fallback to dweb.link
4. If still timeout → Fallback to cloudflare-ipfs.com
5. If all fail → Fallback to Filebase CDN (S3 URL)
6. Frontend displays file list with icons, names, sizes
7. User clicks file → Download or inline preview
```

---

## Technology Stack

### Frontend
- **Framework**: React with Next.js 14 (App Router) OR SvelteKit (decision: ADR-001)
- **Language**: TypeScript (type safety)
- **Styling**: Tailwind CSS (minimal, utility-first)
- **IPFS Client**: Helia (modern IPFS for browser)
- **Build Tool**: Vite (fast) or Next.js built-in

### Backend/Edge
- **Runtime**: Vercel Edge Functions (V8 isolates) OR Netlify Functions (AWS Lambda)
- **IPFS API**: Filebase S3-compatible SDK
- **Scraping**: Cheerio (HTML parsing), axios (HTTP)

### Storage & Infrastructure
- **Primary Storage**: Filebase (IPFS pinning)
- **Secondary Storage**: Web3.Storage (optional redundancy)
- **CDN/Hosting**: Vercel or Netlify (global edge)
- **Monitoring**: Uptime Robot (gateway health), Sentry (error tracking)

### Optional (Post-MVP)
- **Metadata Index**: OrbitDB or PocketBase
- **Permanent Storage**: Arweave (truly immutable layer)
- **Encryption**: Lit Protocol (encrypted IPFS)

---

## Security Architecture

### File Validation Pipeline
```
Client-Side:
1. MIME type check (reject .exe, .sh, etc.)
2. Magic bytes validation (first 4-8 bytes match declared type)
3. File size limit (<100MB)

Server-Side (Edge Function):
4. Re-validate MIME and magic bytes (don't trust client)
5. File extension whitelist (PDF, PNG, JPG, MP4, etc.)
6. Optional: VirusTotal API scan for suspicious files
```

### Content Security Policy (CSP)
```
Content-Security-Policy:
  default-src 'self';
  img-src 'self' https://ipfs.io https://*.ipfs.dweb.link;
  media-src 'self' https://ipfs.io https://*.ipfs.dweb.link;
  script-src 'self' 'unsafe-inline' (minimize inline scripts);
  frame-src 'none' (no iframes except sandboxed previews);
```

### Authentication & Access Control
- **No user accounts**: Anonymous upload model
- **Admin access**: Filebase API key in environment variables (never in git)
- **Hosting dashboards**: Password + 2FA

---

## Scalability & Performance

### MVP Targets (<50 users, <100GB storage)
- **Upload latency**: <30s for 10 files (~50MB total)
- **Retrieval latency**: p95 <5s (via gateway fallback)
- **Page load**: <2s (frontend)
- **Storage**: 5GB Filebase free tier sufficient

### Future Scaling (500+ users, 1TB+ storage)
- **Storage**: Multi-provider pinning across Filebase, Web3.Storage, NFT.Storage
- **Performance**: Metadata index (OrbitDB or PocketBase) for fast browsing
- **Caching**: Cloudflare CDN for hot files
- **Cost**: ~$50-200/mo for paid pinning tiers

---

## Deployment Model

### MVP
- **Frontend**: Vercel free tier (hobby plan) → `zeronoise.vercel.app`
- **Custom Domain**: zeronoise.app (optional, $10/yr)
- **IPFS Pinning**: Filebase free tier (5GB)
- **Monitoring**: Uptime Robot free tier (50 monitors)

### Production (Post-MVP)
- **Frontend**: Vercel Pro ($20/mo) or Netlify Pro ($19/mo)
- **IPFS Pinning**: Filebase paid tier ($5/100GB) + Web3.Storage
- **Monitoring**: Sentry paid ($26/mo) for error tracking
- **CDN**: Cloudflare (free) in front of IPFS gateways

---

## Open Questions (to resolve in Elaboration)

1. **React/Next.js vs SvelteKit**: Which framework best fits "zero noise" UX philosophy? (ADR-001)
2. **Browser IPFS vs Server-Side**: Rely on Helia browser nodes or pure API approach? (ADR-005)
3. **Metadata Index**: OrbitDB (decentralized) vs PocketBase (centralized) vs no index? (ADR-004)
4. **Virus Scanning**: VirusTotal API (costs $$) vs ClamAV (self-hosted) vs client-side only?
5. **Arweave Integration**: MVP or post-MVP for permanent storage layer?

---

## Next Steps (Elaboration Phase)

1. **Resolve ADRs**: Make final decisions on React vs Svelte, metadata strategy
2. **Technical Spike**: Build IPFS upload PoC (validate Filebase API, gateway reliability)
3. **Detailed SAD**: Expand architecture with sequence diagrams, API specs, data models
4. **Performance Baseline**: Test IPFS upload/retrieval latency under realistic conditions
5. **Security Hardening**: Implement CSP, file validation, virus scanning strategy

---

## Approval

**Architecture Approved By**: chronode (Owner)  
**Date**: 2025-10-21  
**Review Date**: Elaboration phase exit (before Construction)  
**Status**: BASELINED (sketch level, details in Elaboration)
