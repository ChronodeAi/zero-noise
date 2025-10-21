# Zero Noise - Vision Document

**Project**: Zero Noise  
**Owner**: chronode  
**Date**: 2025-10-21  
**Version**: 1.0 (Inception Baseline)  
**Status**: APPROVED

---

## Executive Summary

Zero Noise is a decentralized peer-to-peer file sharing platform that enables knowledge workers and researchers to create collaborative resource collections without platform lock-in or centralized control. Built on IPFS, Filebase, and other decentralized storage protocols, it provides a minimalist "zero noise" interface for sharing research papers, videos, links, and documents in a unified, friction-free experience.

---

## Problem Statement

Researchers and knowledge workers need a frictionless way to share diverse content types (research papers, videos, links, documents) without platform lock-in, centralized control, or interface clutter. Current solutions either lack P2P capabilities, have poor UX, or don't support mixed media types in a unified interface.

**Current Pain Points**:
- Centralized platforms create vendor lock-in and single points of failure
- Existing decentralized solutions have steep learning curves and poor UX
- No unified interface for mixed media (PDFs + videos + links)
- Privacy concerns with centralized file hosting
- Platform control over content availability and access

**Desired Future State**:
- Drag-and-drop simplicity for uploading any file type
- Decentralized storage ensures content permanence and availability
- Clean, minimal UI that "gets out of the way"
- P2P sharing links that work across networks
- No accounts, no tracking, no platform gatekeeping

---

## Target Personas

### Primary Persona: Academic Researcher (Dr. Sarah)
- **Role**: PhD candidate in computational biology
- **Context**: Collaborating with 5-10 researchers across institutions
- **Needs**: 
  - Share large datasets and research papers quickly
  - Avoid institutional email attachment limits
  - Ensure long-term availability of shared resources
  - Privacy-conscious, doesn't want centralized tracking
- **Pain Points**: Dropbox/Google Drive feel too corporate; WeTransfer links expire; email attachments bounce
- **Success Scenario**: "I can drag 20 PDFs + 3 datasets + YouTube lecture links into one collection and share a single P2P link with my research group"

### Secondary Persona: Study Group Coordinator (Marcus)
- **Role**: Graduate student organizing weekly study sessions
- **Context**: Curating resources for 15-20 students
- **Needs**:
  - Aggregate papers, videos, blog posts into single repository
  - No login barriers for students to access materials
  - Low/zero cost solution
- **Pain Points**: Canvas/LMS feels bloated; Google Drive requires sign-in; link rot for web resources
- **Success Scenario**: "I create a study pack with everything in one place, share one link, and students can browse all materials in a clean interface"

### Tertiary Persona: Privacy-Conscious Content Curator (Alex)
- **Role**: Independent researcher / knowledge worker
- **Context**: Sharing curated collections publicly
- **Needs**:
  - Decentralized hosting (no platform can take down content)
  - Anonymous sharing (no account required)
  - Clean aesthetic for shared collections
- **Pain Points**: Concerned about centralized platforms controlling access; wants content to outlive any single service
- **Success Scenario**: "I publish a curated collection on decentralized infrastructure that will remain accessible indefinitely"

---

## Success Metrics (KPIs)

### User Adoption (MVP Timeframe: 8-10 weeks)
- **Target**: 10-50 weekly active users within 3 months
- **Measurement**: Unique P2P link shares tracked via anonymized IPFS metrics

### Technical Performance
- **File upload success rate**: >95% (within 30 seconds for files <100MB)
- **P2P link sharing reliability**: >80% NAT traversal success across networks
- **IPFS retrieval latency**: p95 <5 seconds for file metadata, p95 <10 seconds for first byte
- **Page load time**: <2 seconds for web interface
- **Zero data loss**: 100% pinning success rate to multiple IPFS providers

### Feature Coverage
- **Supported file types**: 10+ types (PDF, DOCX, images, video, audio, text, links) by MVP
- **Link preview success**: >80% successful metadata scraping for web links
- **Malicious file detection**: 0 malware/exploits in production uploads

### Quality & UX
- **User feedback sentiment**: >70% "easy to use" in user interviews
- **Zero noise compliance**: <5 UI elements on upload screen (drag-drop zone, file list, share button)
- **Time to first share**: <60 seconds from landing page to shareable P2P link

---

## Constraints

### Technical Constraints
- **Browser IPFS limitations**: Safari and mobile browser support for IPFS varies; must use hybrid approach (browser nodes + pinning services)
- **IPFS gateway reliability**: Public gateways are unreliable; require fallback strategy across 3+ gateways
- **File size limits**: Free tier pinning services limit uploads; start with <100MB per file for MVP
- **NAT traversal**: Direct P2P connections challenging; rely on IPFS DHT and relay servers

### Budget Constraints
- **Infrastructure budget**: <$50/month for decentralized storage APIs (Filebase free tier + Web3.Storage)
- **No paid development**: Solo project, volunteer development time
- **Cost scaling**: Must remain <$200/mo even at 500 users (distributed costs across multiple free tiers)

### Timeline Constraints
- **MVP delivery**: 8-10 weeks from Inception to working prototype
- **Part-time development**: Evenings/weekends only; ~15-20 hours/week capacity
- **Flexible deadline**: No hard external deadline, but want validation within 3 months

### Regulatory Constraints
- **No GDPR compliance initially**: Anonymous sharing, no user accounts, public content model
- **Content liability**: Decentralized = no content control; clear disclaimers about user responsibility
- **Right-to-deletion challenge**: IPFS content-addressing is immutable; unpinning ≠ guaranteed deletion

---

## Assumptions and Dependencies

### Assumptions
1. **Target users are technical early adopters** comfortable with P2P concepts (not mass market)
2. **Anonymous sharing model is acceptable** for MVP (no accounts, no auth)
3. **IPFS ecosystem is stable enough** for production use with proper redundancy
4. **Filebase free tier (5GB) sufficient** for initial user base (<50 users)
5. **Web-first deployment adequate**; mobile apps can wait for post-MVP
6. **Open source model attracts contributors** after MVP validation

### Dependencies
- **IPFS public gateway availability**: Fallback to ipfs.io, dweb.link, cloudflare-ipfs.com
- **Filebase API uptime**: Primary pinning service must maintain >95% availability
- **Browser IPFS support**: Helia or js-ipfs must remain actively maintained
- **Web scraping APIs**: OpenGraph metadata, YouTube API for link previews
- **CDN availability**: Vercel/Netlify free tier for frontend hosting

### Risks to Assumptions
- **IPFS gateway centralization risk**: If all major gateways go down, fallback to Filebase S3-compatible URLs
- **Free tier limits**: If storage exceeds 5GB, need funding plan or multi-provider strategy
- **Browser IPFS deprecation**: If js-ipfs/Helia abandoned, pivot to server-side IPFS nodes

---

## In-Scope Features (MVP)

### Core Features
- **Drag-and-drop file upload**: Multi-file upload with progress indicators
- **Multi-format support**: PDFs, images (PNG, JPG), video (MP4, WebM), audio (MP3, WAV), documents (DOCX, TXT), links (URLs)
- **IPFS content addressing**: Files stored with CID-based addressing
- **P2P link sharing**: Shareable URLs resolving to IPFS content via multiple gateways
- **Link metadata scraping**: Web link previews (YouTube videos, articles, OpenGraph data)
- **File browsing interface**: List view with file type icons, names, sizes
- **Basic search/filter**: Filter by file type, search by filename
- **Malicious file detection**: MIME type validation, magic bytes checking, file size limits

### Technical Features
- **Multi-provider pinning**: Filebase + optional Web3.Storage for redundancy
- **Gateway fallback**: 3+ IPFS gateways with automatic failover
- **Browser IPFS node**: Helia/js-ipfs for client-side operations (optional enhancement)
- **Edge deployment**: Serverless functions on Vercel/Netlify for scraping, validation

---

## Out-of-Scope (Deferred)

### Deferred to Post-MVP
- **User accounts/authentication**: Anonymous sharing only for MVP
- **Access control/permissions**: Public sharing model; no private collections
- **Real-time collaboration**: Async sharing only; no live editing
- **File versioning/history**: Immutable CIDs; new upload = new link
- **Advanced search**: No AI-powered discovery, semantic search, or faceted filtering
- **Mobile apps**: Web-first; native iOS/Android deferred
- **Content moderation**: User responsibility model; no proactive moderation
- **Monetization**: Free service for MVP; monetization strategy TBD

### Explicitly NOT in Scope
- **Centralized storage**: No AWS S3, Google Cloud Storage (decentralized only)
- **File editing**: View/download only; no in-app editing
- **User profiles**: No identity, reputation, or social features
- **Analytics/tracking**: Minimal error logging only; no user behavior tracking
- **Enterprise features**: No SSO, SAML, audit logs, compliance reporting

---

## High-Level Architecture

### Components
1. **Frontend Web App**: React/Next.js or SvelteKit, deployed on Vercel/Netlify
2. **IPFS Storage Layer**: Helia browser nodes + Filebase pinning API
3. **Gateway Layer**: Multiple IPFS gateways (ipfs.io, dweb.link, Filebase CDN)
4. **Metadata Service**: Optional lightweight index (OrbitDB or PocketBase) for collections
5. **Scraping Service**: Edge functions for web link metadata extraction

### Data Flow
1. User uploads file → Browser validates → IPFS CID generated
2. File pinned to Filebase API (primary) + optional Web3.Storage (secondary)
3. Shareable link created: `zeronoise.app/share/{CID}` → resolves via gateway fallbacks
4. Recipient clicks link → Frontend fetches from fastest available gateway

### Technology Stack
- **Frontend**: TypeScript, React/Next.js or Svelte, Tailwind CSS
- **IPFS**: Helia (browser) or Kubo (server-side), Filebase S3-compatible API
- **Storage**: IPFS (primary), Filebase pinning, optional Arweave (permanent layer)
- **Hosting**: Vercel/Netlify (CDN + edge functions)
- **Optional Database**: OrbitDB (decentralized) or PocketBase (lightweight SQLite)

---

## Stakeholders

### Primary Stakeholder
- **chronode** (Developer/Owner): Solo developer, decision-maker, technical implementer

### Target User Community
- **Academic researchers**: Early adopters, feedback providers
- **Study groups**: Use case validation
- **Privacy advocates**: Alignment validation, evangelism

### Potential Future Stakeholders
- **Open source contributors**: Post-MVP code contributions
- **Decentralized tech community**: Evangelism, ecosystem integration
- **Funding sources**: If project scales, grants or sponsorship

---

## Open Questions

1. **IPFS implementation**: Helia (browser) vs Kubo (server-side)? Hybrid approach?
2. **Pinning strategy**: Single provider (Filebase) vs multi-provider redundancy?
3. **Metadata storage**: Pure IPFS (OrbitDB) vs lightweight centralized (PocketBase)?
4. **File permanence**: Filebase pinning sufficient, or add Arweave for critical files?
5. **Legal liability**: ToS disclaimers sufficient for decentralized content, or need proactive scanning?

---

## Next Steps (Inception → Elaboration)

1. **Architecture baseline**: Detailed SAD, ADRs for IPFS/pinning/metadata decisions
2. **Detailed requirements**: User stories, NFRs, edge cases
3. **Security threat model**: Malicious files, XSS, legal exposure analysis
4. **Technical spikes**: PoC for IPFS reliability, pinning service comparison
5. **Test strategy**: Automated tests for IPFS integration, file validation
6. **Deployment plan**: CI/CD setup, IPFS gateway monitoring, runbook

---

## Approval

**Vision Approved By**: chronode (Owner)  
**Date**: 2025-10-21  
**Status**: BASELINED for Elaboration Phase
