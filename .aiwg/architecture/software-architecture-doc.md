# Zero Noise - Software Architecture Document (SAD)

**Project**: Zero Noise  
**Version**: 1.0 (Elaboration Baseline)  
**Date**: 2025-10-21  
**Status**: BASELINED  
**Owner**: chronode

---

## 1. Executive Summary

Zero Noise is a decentralized P2P file sharing platform built on IPFS with a hybrid architecture combining browser-based interactions, serverless edge functions, and distributed storage providers. This document establishes the architecture baseline for Construction phase implementation.

**Key Architectural Decisions**:
- **Frontend**: React/Next.js 14 with TypeScript (ADR-001)
- **Storage**: Multi-provider IPFS pinning (Filebase + Storacha) (ADR-002)
- **Reliability**: Filebase dedicated gateway + public gateway fallback (ADR-003)
- **Deployment**: Serverless edge (Vercel/Netlify) + decentralized IPFS + Filecoin storage

**Architecture Goals**:
- "Zero noise" UX: <5 UI elements, <2s page load
- Reliability: >95% upload success, >99% retrieval success
- Performance: p95 <5s file retrieval, <30s upload for 50MB
- Decentralization: No single point of failure, vendor-portable

---

## 2. Architectural Drivers

### 2.1 Quality Attributes (Ranked)

| Priority | Attribute | Target | Rationale |
|----------|-----------|--------|-----------|
| 1 | **Usability** | <60s time-to-first-share, <5 UI elements | Core "zero noise" brand promise |
| 2 | **Reliability** | >95% upload success, >99% retrieval | Trust critical for adoption |
| 3 | **Performance** | p95 <5s retrieval, <30s upload | User tolerance threshold |
| 4 | **Security** | Zero malware in production uploads | User safety, legal protection |
| 5 | **Portability** | Switch IPFS providers <2 days | Avoid vendor lock-in |
| 6 | **Scalability** | Handle 500 users / 1TB storage | 12-month growth target |

### 2.2 Architectural Constraints

**Technical Constraints**:
- Browser IPFS limitations (Safari, mobile compatibility issues)
- IPFS gateway reliability (10-20% failure rate)
- Free tier storage limits (Filebase 5GB, need multi-provider)
- File size limits (<100MB for MVP due to pinning costs)

**Business Constraints**:
- Budget: <$50/mo MVP, <$200/mo at 500 users
- Timeline: 8-10 weeks to MVP (solo developer, part-time)
- Team: Solo developer (no dedicated DevOps, security team)

**Regulatory Constraints**:
- DMCA compliance required (takedown process)
- GDPR/CCPA minimal (no PII collection, anonymous uploads)
- Content moderation: User responsibility model (no proactive scanning)

---

## 3. Architectural Patterns

### 3.1 Overall Style: **Hybrid Decentralized + Edge Serverless**

**Rationale**: Balance decentralization ideals with pragmatic reliability and developer velocity.

**Components**:
1. **Frontend** (React SPA): Client-side rendering, Helia IPFS client (optional)
2. **Edge Functions** (Vercel/Netlify): Server-side validation, scraping, pinning orchestration
3. **IPFS Storage** (Filebase/Web3.Storage): Content-addressed decentralized storage
4. **Gateway Layer** (Public + CDN): Multi-gateway fallback for retrieval

### 3.2 Key Patterns

**Pattern 1: Multi-Provider Redundancy** (ADR-002)
- **Filebase (primary)**: S3-compatible API, automatic IPFS pinning, dedicated gateways, 5GB free
- **Storacha (secondary)**: Filecoin-backed, IPFS + Filecoin dual storage, 99.9% uptime, free tier
- Async secondary pinning (no upload latency impact)
- Benefit: No single point of failure, combined free tier ~10GB+, Filecoin provable storage

**Pattern 2: Gateway Fallback** (ADR-003)
- Primary: Filebase dedicated gateway (fastest - peers directly with Filebase IPFS nodes)
- Fallback: Public gateways (ipfs.io, dweb.link, cloudflare) if Filebase unavailable
- Benefit: Optimal performance for our content, public gateway fallback for resilience

**Pattern 3: Hybrid IPFS** (Browser + Server-Side)
- Optional browser IPFS node (Helia) for advanced users
- Primary path: Edge function → Filebase API (works everywhere)
- Benefit: Universal compatibility, progressive enhancement

---

## 4. Component Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER BROWSER                                │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Frontend App (React/Next.js 14)                             │  │
│  │  Components:                                                  │  │
│  │  - UploadZone (drag-drop, file validation)                   │  │
│  │  - FileList (collection browsing, filtering)                 │  │
│  │  - ShareButton (copy P2P link)                               │  │
│  │  - FilePreview (inline preview, download)                    │  │
│  │                                                               │  │
│  │  State Management: React Context + hooks                     │  │
│  │  IPFS Client: Helia (optional, browser node)                 │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTPS (TLS 1.3)
┌─────────────────────────────────────────────────────────────────────┐
│                     EDGE CDN (Vercel/Netlify)                        │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Edge Functions (Serverless)                                  │  │
│  │                                                               │  │
│  │  /api/upload                                                  │  │
│  │  - Validate file (MIME, magic bytes, size)                   │  │
│  │  - Pin to Filebase (primary)                                 │  │
│  │  - Pin to Web3.Storage (secondary, async)                    │  │
│  │  - Return CID + collection link                              │  │
│  │                                                               │  │
│  │  /api/scrape                                                  │  │
│  │  - Fetch URL (YouTube, OpenGraph)                            │  │
│  │  - Extract metadata (title, description, thumbnail)          │  │
│  │  - Return structured metadata                                │  │
│  │                                                               │  │
│  │  /api/retrieve                                                │  │
│  │  - Race gateways (ipfs.io, dweb.link, cloudflare)           │  │
│  │  - Return fastest response                                    │  │
│  │  - Fallback to Filebase CDN if all fail                      │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼ S3 API / IPFS API
┌─────────────────────────────────────────────────────────────────────┐
│                         IPFS STORAGE LAYER                           │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐           │
│  │  Filebase   │    │   Storacha   │    │Public IPFS   │           │
│  │  (Primary)  │    │ (Secondary)  │    │Gateways      │           │
│  │             │    │              │    │              │           │
│  │ S3-compat   │    │Filecoin-back │    │ ipfs.io      │           │
│  │ 5GB free    │    │IPFS + Filecoin│   │ dweb.link    │           │
│  │ Dedicated   │    │99.9% uptime  │    │ cloudflare   │           │
│  │ gateways    │    │Free tier     │    │ (Fallback)   │           │
│  └─────────────┘    └──────────────┘    └──────────────┘           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. Component Details

### 5.1 Frontend App

**Technology**: React 18 + Next.js 14 (App Router), TypeScript, Tailwind CSS

**Key Components**:

**UploadZone**:
```typescript
interface UploadZoneProps {
  onFilesSelected: (files: File[]) => Promise<void>;
  maxFileSize: number; // 100MB
  allowedTypes: string[]; // PDF, PNG, JPG, MP4, etc.
}

// Features:
// - Drag-and-drop with react-dropzone
// - Multi-file selection
// - Client-side validation (MIME, size)
// - Progress indicators
// - Error handling (file too large, invalid type)
```

**FileList**:
```typescript
interface FileListProps {
  files: FileMetadata[];
  onFilter: (type: FileType) => void;
  onSearch: (query: string) => void;
  onDownload: (cid: string) => void;
}

interface FileMetadata {
  cid: string;
  name: string;
  size: number;
  type: string; // MIME type
  uploadedAt: Date;
}

// Features:
// - List view with icons, names, sizes
// - Filter by file type (PDFs, images, videos, links)
// - Search by filename
// - Click to preview or download
```

**ShareButton**:
```typescript
interface ShareButtonProps {
  collectionCID: string;
  onCopy: () => void;
}

// Features:
// - Generate shareable link: zeronoise.app/share/{CID}
// - Copy to clipboard
// - Show "Copied!" feedback
// - QR code (optional)
```

**State Management**:
```typescript
interface AppState {
  files: FileMetadata[];
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error';
  collectionCID: string | null;
  error: string | null;
}

// React Context for global state
// Local hooks for component state
```

### 5.2 Edge Functions (API Routes)

**Deployment**: Vercel Edge Functions (V8 isolates, global CDN)

**/api/upload**:
```typescript
export async function POST(request: Request) {
  // 1. Parse multipart/form-data
  const formData = await request.formData();
  const files = formData.getAll('files') as File[];
  
  // 2. Server-side validation
  for (const file of files) {
    await validateFile(file); // MIME, magic bytes, size, virus scan
  }
  
  // 3. Pin to Filebase (primary, synchronous)
  const cids = await Promise.all(
    files.map(file => pinToFilebase(file))
  );
  
  // 4. Pin to Storacha (secondary, async for redundancy)
  // Storacha stores to IPFS + Filecoin (double redundancy)
  pinToStoracha(files, cids).catch(err => 
    log.warn('Secondary pin to Storacha failed', err)
  );
  
  // Files are now pinned to:
  // - IPFS network (via Filebase)
  // - Filecoin + IPFS (via Storacha, async)
  // - Accessible via any IPFS gateway
  
  // 5. Create directory CID (collection)
  const collectionCID = await createDirectoryCID(cids);
  
  // 6. Return response
  return Response.json({
    success: true,
    collectionCID,
    files: cids.map((cid, i) => ({
      cid,
      name: files[i].name,
      size: files[i].size
    }))
  });
}
```

**/api/scrape**:
```typescript
export async function POST(request: Request) {
  const { url } = await request.json();
  
  // Scrape metadata (YouTube API, OpenGraph, Readability)
  const metadata = await scrapeURL(url);
  
  return Response.json({
    url,
    title: metadata.title,
    description: metadata.description,
    thumbnail: metadata.thumbnail,
    type: metadata.type // video, article, etc.
  });
}
```

**/api/retrieve**:
```typescript
export async function GET(request: Request) {
  const url = new URL(request.url);
  const cid = url.searchParams.get('cid');
  
  // Try Filebase dedicated gateway first (fastest for our content)
  try {
    return await fetch(`https://ipfs.filebase.io/ipfs/${cid}`, {
      signal: AbortSignal.timeout(5000)
    });
  } catch (error) {
    // Fallback: Race public gateways
    const publicGateways = [
      `https://ipfs.io/ipfs/${cid}`,
      `https://dweb.link/ipfs/${cid}`,
      `https://cloudflare-ipfs.com/ipfs/${cid}`
    ];
    
    const response = await Promise.race(
      publicGateways.map(url => fetch(url, { signal: AbortSignal.timeout(5000) }))
    );
    return response;
  }
}
```

### 5.3 IPFS Storage Integration

**Filebase Integration** (Primary):
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  endpoint: 'https://s3.filebase.com',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.FILEBASE_ACCESS_KEY,
    secretAccessKey: process.env.FILEBASE_SECRET_KEY
  }
});

async function pinToFilebase(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  
  const command = new PutObjectCommand({
    Bucket: 'zero-noise',
    Key: file.name,
    Body: buffer,
    ContentType: file.type
  });
  
  const response = await s3.send(command);
  
  // Filebase returns IPFS CID in response metadata
  return response.Metadata['ipfs-cid'];
}
```

**Storacha Integration** (Secondary):
```typescript
import * as Client from '@storacha/client';

const storacha = await Client.create();

async function pinToStoracha(files: File[], cids: string[]): Promise<void> {
  // Storacha stores to IPFS + backs up to Filecoin
  // UCAN-based authentication (user-controlled authorization)
  
  // Convert files to CAR format (Content Addressable aRchive)
  const carFiles = await Promise.all(
    files.map(file => Client.uploadFile({ client: storacha, file }))
  );
  
  // Storacha automatically:
  // 1. Pins to IPFS network (hot storage)
  // 2. Backs up to Filecoin (cold storage with cryptographic proofs)
  // 3. Returns CID
  
  log.info('Secondary pinning to Storacha complete', { cids, carFiles });
}
```

**Multi-Provider Benefits**:
- **True redundancy**: Different infrastructure (Filebase IPFS + Storacha Filecoin)
- **Filecoin provable storage**: Cryptographic proofs of storage via Storacha
- **99.9% uptime**: Storacha SLA commitment
- **Combined free tier**: ~10GB+ (Filebase 5GB + Storacha free)
- **No vendor lock-in**: Content accessible via any IPFS gateway
- **Async secondary**: No upload latency impact (fire-and-forget)

---

## 6. Data Models

### 6.1 IPFS Data Structures

**File Object** (IPFS DAG):
```json
{
  "cid": "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
  "name": "research-paper.pdf",
  "size": 2457600,
  "type": "application/pdf",
  "links": []
}
```

**Directory Object** (Collection):
```json
{
  "cid": "bafybeie5gq4jqytubpj5jjhqxxyjrcazqy3i4aq3pjx7q4cqyfm",
  "name": "collection",
  "type": "directory",
  "links": [
    { "cid": "bafybei...", "name": "file1.pdf", "size": 2457600 },
    { "cid": "bafybei...", "name": "file2.png", "size": 524288 },
    { "cid": "bafybei...", "name": "video.mp4", "size": 52428800 }
  ]
}
```

### 6.2 Optional Metadata Index (OrbitDB Schema)

**Collection Metadata** (if OrbitDB used):
```typescript
interface Collection {
  cid: string; // Directory CID
  createdAt: Date;
  updatedAt: Date;
  files: FileMetadata[];
  tags?: string[];
}

interface FileMetadata {
  cid: string;
  name: string;
  size: number;
  type: string; // MIME type
  uploadedAt: Date;
}
```

**Note**: Metadata index deferred to post-MVP. MVP uses pure IPFS (query directory CID for file list).

---

## 7. API Specifications

### 7.1 Upload API

**Endpoint**: `POST /api/upload`

**Request**:
```http
POST /api/upload HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="files"; filename="paper.pdf"
Content-Type: application/pdf

<binary data>
------WebKitFormBoundary--
```

**Response** (Success):
```json
{
  "success": true,
  "collectionCID": "bafybeie5gq4jqytubpj5jjhqxxyjrca",
  "shareLink": "https://zeronoise.app/share/bafybeie5gq4jqytubpj5jjhqxxyjrca",
  "files": [
    {
      "cid": "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
      "name": "paper.pdf",
      "size": 2457600,
      "type": "application/pdf"
    }
  ]
}
```

**Response** (Error):
```json
{
  "success": false,
  "error": "File validation failed: file too large (max 100MB)",
  "code": "FILE_TOO_LARGE"
}
```

### 7.2 Retrieve API

**Endpoint**: `GET /api/retrieve?cid={CID}`

**Response**: Binary file data with appropriate Content-Type header

---

## 8. Security Architecture

### 8.1 Threat Model Summary

| Threat | Likelihood | Impact | Mitigation |
|--------|------------|--------|------------|
| **Malicious File Upload** | Medium | High | Multi-layer validation (client + server), virus scanning API |
| **XSS via Uploaded HTML** | Low | Medium | CSP headers, sandbox iframes, no inline HTML rendering |
| **DDoS on Upload Endpoint** | Low | Medium | Rate limiting (Vercel/Netlify built-in), file size limits |
| **Legal Liability (Illegal Content)** | Medium | High | ToS disclaimers, DMCA process, content hash blocklist (optional) |
| **IPFS Gateway Poisoning** | Low | Medium | Multiple gateways, CDN fallback, content validation |

### 8.2 Security Controls

**File Validation Pipeline**:
```typescript
async function validateFile(file: File): Promise<void> {
  // 1. MIME type check
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type');
  }
  
  // 2. Magic bytes validation
  const buffer = await file.arrayBuffer();
  const magicBytes = new Uint8Array(buffer, 0, 8);
  if (!matchesMIME(magicBytes, file.type)) {
    throw new Error('MIME type mismatch');
  }
  
  // 3. File size limit
  if (file.size > 100 * 1024 * 1024) { // 100MB
    throw new Error('File too large');
  }
  
  // 4. Virus scanning (optional, VirusTotal API)
  if (process.env.VIRUSTOTAL_API_KEY) {
    const scanResult = await scanWithVirusTotal(buffer);
    if (scanResult.malicious > 0) {
      throw new Error('Malware detected');
    }
  }
}
```

**Content Security Policy**:
```http
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://vercel.live;
  style-src 'self' 'unsafe-inline';
  img-src 'self' https://*.ipfs.dweb.link https://ipfs.io data:;
  media-src 'self' https://*.ipfs.dweb.link https://ipfs.io;
  connect-src 'self' https://*.ipfs.dweb.link https://ipfs.io https://filebase.com;
  frame-src 'none';
  object-src 'none';
```

---

## 9. Deployment Architecture

### 9.1 Production Deployment

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare CDN (DNS)                      │
│                  zeronoise.app → Vercel                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Vercel Edge Network                         │
│  Region: Global (300+ edge locations)                        │
│  - Frontend: Static assets (Next.js build)                   │
│  - Edge Functions: /api/* routes                             │
│  - Auto-scaling, 0→∞ concurrent requests                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────┬────────────────────┬───────────────────┐
│   Filebase (US)    │Web3.Storage (IPFS) │  Public Gateways  │
│   IPFS Pinning     │  Secondary Pinning  │  Fallback Layer   │
│   S3-compatible    │  Protocol Labs      │  ipfs.io, etc.    │
└────────────────────┴────────────────────┴───────────────────┘
```

### 9.2 CI/CD Pipeline

**GitHub Actions Workflow**:
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 10. Non-Functional Requirements

### 10.1 Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Page Load** | <2s (p95) | Lighthouse, WebPageTest |
| **Upload Time** | <30s for 50MB | Edge function logs |
| **Retrieval Time** | <5s (p95) | Gateway racing metrics |
| **Time to First Share** | <60s from landing | User analytics |

### 10.2 Scalability

| Dimension | MVP | 6 Months | 12 Months |
|-----------|-----|----------|-----------|
| **Users** | 10-50 | 500 | 2000 |
| **Storage** | 100GB | 1TB | 5TB |
| **Requests/min** | <10 | <100 | <500 |
| **Cost** | $0-50/mo | $120/mo | $250/mo |

---

## 11. Technology Stack

### 11.1 Frontend
- **Framework**: React 18 + Next.js 14 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **IPFS Client**: Helia 4.x (optional browser node)
- **Build**: Next.js built-in (Turbopack)
- **Testing**: Jest, React Testing Library, Playwright

### 11.2 Backend / Edge
- **Runtime**: Vercel Edge Functions (V8 isolates)
- **IPFS SDK**: Filebase S3 SDK, Web3.Storage client
- **Validation**: file-type, magic-bytes libraries
- **Scraping**: Cheerio, Axios

### 11.3 Infrastructure
- **Hosting**: Vercel (frontend + edge functions)
- **Storage**: Filebase (primary), Web3.Storage (secondary)
- **CDN**: Vercel Edge Network (global)
- **Monitoring**: Uptime Robot, Sentry
- **CI/CD**: GitHub Actions

---

## 12. Open Issues and Risks

### 12.1 Architectural Decisions Pending

1. **ADR-004**: Metadata Index Strategy (OrbitDB vs PocketBase vs no index)
   - Status: Deferred to post-MVP
   - Decision: Pure IPFS initially, revisit if browsing performance poor

2. **ADR-005**: Browser IPFS vs Server-Side Only
   - Status: Deferred to Elaboration spikes
   - Decision: Validate Helia browser node compatibility before committing

### 12.2 Technical Risks

| Risk | Mitigation | Validation |
|------|------------|------------|
| **IPFS gateway latency** | Multi-gateway racing | Technical spike: measure p95 latency |
| **Browser IPFS flakiness** | Hybrid approach (optional browser node) | Spike: test Helia on Safari, mobile |
| **Free tier exhaustion** | Multi-provider pinning | Monitor storage usage, alert at 80% |

---

## 13. Approval

**Architecture Baseline Approved By**: chronode (Owner)  
**Date**: 2025-10-21  
**Review Date**: Construction phase exit (after MVP implementation)  
**Status**: **BASELINED for Construction Phase**

**Next Steps**:
1. Technical spikes (IPFS PoC, gateway testing)
2. Master Test Plan
3. Detailed user stories
4. Construction phase kickoff

---

**END OF SOFTWARE ARCHITECTURE DOCUMENT**
