# Project Intake Form

## Metadata

- Project name: `Zero Noise`
- Requestor/owner: `chronode`
- Date: `2025-10-20`
- Stakeholders: `chronode (creator/developer), research community (target users), content sharers/curators`

## Problem and Outcomes

- Problem statement: `Researchers and knowledge workers need a frictionless way to share diverse content types (research papers, videos, links, documents) without platform lock-in, centralized control, or interface clutter. Current solutions either lack P2P capabilities, have poor UX, or don't support mixed media types in a unified interface.`
- Target personas/scenarios:
  - Academic researchers sharing papers and datasets peer-to-peer
  - Study groups creating collaborative knowledge repositories
  - Content curators aggregating resources (PDFs, videos, links) for communities
  - Privacy-conscious users wanting decentralized file sharing without intermediaries
- Success metrics (KPIs):
  - File upload success rate >95%
  - P2P link sharing works across networks (NAT traversal success >80%)
  - Support 10+ file types (PDF, video, audio, images, text, links)
  - Page load time <2s, file retrieval p95 <5s
  - Zero data loss (IPFS pinning + replication successful)

## Scope and Constraints

- In-scope:
  - Drag-and-drop file upload interface (zero noise UI)
  - Support for documents (PDF, DOCX), media (video, audio, images), links (web scraping metadata)
  - P2P link sharing (shareable URLs that work across peers)
  - Decentralized storage via IPFS/Filebase/Arweave
  - Basic file type detection and malicious file filtering
  - Web scraping for link previews (YouTube, articles)
  - File browsing/search within shared collection
- Out-of-scope (for now):
  - Real-time collaboration/editing
  - User authentication/accounts (anonymous sharing initially)
  - Advanced permissions/access control
  - File versioning/history
  - Mobile apps (web-first)
  - Content moderation/reporting
- Timeframe: `MVP in 8-10 weeks (working prototype with basic file types)`
- Budget guardrails: `<$50/mo for decentralized storage APIs (Filebase free tier + IPFS pinning services)`
- Platforms and languages (preferences/constraints):
  - Web app (React/Next.js or Svelte for clean UI)
  - IPFS (js-ipfs or Helia for browser nodes)
  - Filebase API (S3-compatible IPFS pinning)
  - WebRTC for P2P connections (optional enhancement)
  - TypeScript for type safety
  - Vercel/Netlify for hosting (serverless edge functions)

## Non-Functional Preferences

- Security posture: `Baseline` (malicious file detection, XSS prevention, IPFS content validation)
- Privacy & compliance: `None initially` (anonymous sharing, no PII collection; GDPR considerations if adding user accounts)
- Reliability targets: `Availability 95% (best-effort for MVP), p95 file retrieval <5s, error budget 5% failed uploads acceptable`
- Scale expectations:
  - Initial: 10-50 users, <100GB storage
  - 6 months: 500 users, 1TB storage across pinning services
  - 2 years: 5k+ users, multi-TB federated storage
- Observability: `logs+metrics` (IPFS pin status, upload success rates, file retrieval times, error tracking)
- Maintainability: `high` (clean code, modular architecture, decentralized services replaceable)
- Portability: `portable` (decentralized by design, IPFS + multi-provider storage, avoid vendor lock-in)

## Data

- Classification: `Public` (user-uploaded files are publicly accessible via IPFS CIDs by design)
- PII/PHI present: `no` (anonymous sharing, no user accounts initially; files may contain PII uploaded by users - user responsibility)
- Retention/deletion constraints: `Permanent by default (IPFS immutable content-addressing); pinning services control availability. Unpinning = effective deletion from network over time. No GDPR right-to-deletion initially (decentralized challenge).`

## Integrations

- External systems/APIs:
  - IPFS (js-ipfs/Helia for browser nodes, public gateways for retrieval)
  - Filebase API (S3-compatible IPFS pinning service)
  - Arweave (optional: permanent storage for critical files)
  - Web3.Storage (optional: additional IPFS pinning)
  - Link scraping: YouTube API, Open Graph metadata, Readability
  - File type detection: file-type npm package, magic bytes validation
- Dependencies and contracts:
  - IPFS public gateway availability (fallback to multiple gateways)
  - Filebase free tier limits (5GB storage, evaluate paid plan if exceeded)
  - Browser IPFS node limitations (Safari, mobile support varies)
  - WebRTC for P2P (NAT traversal, STUN/TURN servers)

## Architecture Preferences (if any)

- Style: `Modular` (frontend + decentralized storage layer + optional indexing service; P2P/distributed by nature)
- Cloud/infra:
  - Frontend: Vercel/Netlify (edge CDN, serverless functions)
  - Storage: IPFS (decentralized), Filebase (global IPFS pinning), Arweave (permanent layer)
  - Database: Optional lightweight index (PocketBase, SQLite, or decentralized OrbitDB)
  - No specific region (decentralized storage, CDN edge deployment)
- Languages/frameworks:
  - TypeScript (type safety)
  - React/Next.js or SvelteKit (clean UI, zero noise design)
  - Helia or js-ipfs (browser IPFS client)
  - Tailwind CSS (minimal styling)
  - Optional: GunDB or OrbitDB (decentralized metadata storage)

## Risk and Trade-offs

- Risk tolerance: `Medium` (decentralized tech inherently experimental, acceptable for MVP; quality matters for UX)
- Priorities (weights sum 1.0):
  - Delivery speed: `0.35` (want working MVP to validate concept)
  - Cost efficiency: `0.25` (free tier + <$50/mo acceptable)
  - Quality/security: `0.40` (clean UX critical to "zero noise" vision, security important for trust)
- Known risks/unknowns:
  - IPFS gateway reliability (mitigation: multiple fallback gateways)
  - Browser IPFS node performance/compatibility (mitigation: hybrid approach with pinning services)
  - Malicious file uploads (mitigation: file type validation, virus scanning API)
  - IPFS content permanence (mitigation: active pinning strategy, replication)
  - NAT traversal for P2P links (mitigation: relay servers, public gateways)
  - Legal liability for uploaded content (mitigation: anonymous/decentralized, clear ToS)
  - Scalability of free tier pinning services (mitigation: multi-provider strategy)

## Team & Operations

- Team size/skills:
  - 1 developer (chronode): full-stack, TypeScript/React, learning IPFS/decentralized tech
  - Part-time/hobby project initially
  - Community contributors (potential open source)
- Operational support (on-call, SRE):
  - Best-effort monitoring (uptime tracking, IPFS pin health)
  - No formal on-call initially (MVP/prototype phase)
  - Community support via GitHub issues
  - Decentralized architecture = self-healing by design

## Decision Heuristics (quick reference)

- Prefer simplicity vs power: `S` (simple UI, straightforward upload/share flow)
- Prefer managed services vs control: `M` (use Filebase/Web3.Storage over self-hosted IPFS cluster)
- Prefer time-to-market vs robustness: `T` (MVP first, iterate on reliability and features)

## Attachments

- Solution profile: link to `solution-profile-template.md`
- Option matrix: link to `option-matrix-template.md`

## Kickoff Prompt (copy into orchestrator)

```text
Role: Executive Orchestrator
Goal: Initialize project from intake and start Concept → Inception flow
Inputs:
- Project Intake Form (this file)
- Solution Profile
- Option Matrix
Actions:
- Validate scope and NFRs; identify risks and needed spikes
- Select agents for Concept → Inception
- Produce phase plan and decision checkpoints
Output:
- phase-plan-inception.md
- risk-list.md
- initial ADRs for critical choices
```
