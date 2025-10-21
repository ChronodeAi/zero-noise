# Zero Noise - Risk List

**Project**: Zero Noise  
**Date**: 2025-10-21  
**Version**: 1.0 (Inception Baseline)  
**Owner**: chronode

---

## Risk Summary

| ID | Risk | Likelihood | Impact | Score | Mitigation Status |
|----|------|------------|--------|-------|-------------------|
| R-001 | IPFS Gateway Reliability | High | High | **Critical** | Mitigated |
| R-002 | Malicious File Uploads | Medium | Show Stopper | **Critical** | Mitigated |
| R-003 | Legal Liability (Illegal Content) | Medium | High | **High** | Mitigated |
| R-004 | Free Tier Storage Limits | Medium | Medium | **Medium** | Mitigated |
| R-005 | IPFS Content Permanence | Medium | Medium | **Medium** | Accepted |
| R-006 | Browser IPFS Compatibility | High | Medium | **High** | Mitigated |
| R-007 | Solo Developer Capacity | High | Medium | **High** | Accepted |
| R-008 | User Adoption (Market Fit) | Medium | High | **High** | Monitoring |
| R-009 | NAT Traversal Failures | Medium | Low | **Low** | Accepted |
| R-010 | Filebase API Dependency | Low | High | **Medium** | Mitigated |

---

## Critical Risks (Top 3 with Detailed Mitigation)

### R-001: IPFS Gateway Reliability

**Category**: Technical  
**Description**: Public IPFS gateways (ipfs.io, dweb.link) are notoriously unreliable with frequent timeouts and downtime. Users may experience failed file retrievals.

**Likelihood**: High (gateways fail 10-20% of the time)  
**Impact**: High (broken user experience, lost trust)  
**Risk Score**: **Critical**

**Mitigation Strategy**:
1. **Multi-Gateway Fallback**: Implement 3+ gateway fallbacks in order:
   - Primary: ipfs.io
   - Secondary: dweb.link
   - Tertiary: cloudflare-ipfs.com
   - Quaternary: Filebase CDN (S3-compatible URL)
2. **Parallel Requests**: Query multiple gateways simultaneously, use fastest responder
3. **Health Monitoring**: Track gateway uptime, remove consistently failing gateways from rotation
4. **Timeout Tuning**: 5-second timeout per gateway, fail fast and move to next
5. **User Communication**: Show subtle loading indicator during fallback attempts

**Trigger**: Gateway response time >5s or HTTP 5xx errors  
**Owner**: chronode  
**Status**: Mitigated (architecture includes fallback strategy)  
**Validation**: Load testing with intentional gateway failures in Elaboration phase

---

### R-002: Malicious File Uploads

**Category**: Security  
**Description**: Users may upload malware, exploits, or XSS payloads disguised as PDFs/images. Decentralized model means no proactive content scanning.

**Likelihood**: Medium (internet + anonymous uploads = inevitable abuse)  
**Impact**: Show Stopper (malware distribution destroys trust, potential legal liability)  
**Risk Score**: **Critical**

**Mitigation Strategy**:
1. **Client-Side Validation**:
   - MIME type checking (reject mismatched types)
   - Magic bytes validation (first 4-8 bytes match declared type)
   - File size limits (<100MB prevents weaponized ZIP bombs)
2. **Server-Side Validation** (Edge Function):
   - Re-validate MIME type and magic bytes
   - File extension whitelist (PDF, PNG, JPG, MP4, etc.)
   - Virus scanning API integration (VirusTotal or similar) for flagged files
3. **Content Security Policy (CSP)**:
   - Strict CSP headers prevent XSS from uploaded HTML
   - Sandbox iframes for file previews
4. **User Disclaimers**:
   - Clear ToS: "Zero Noise does not scan files; download at your own risk"
   - Warning banner on collection pages: "Files are user-uploaded and unverified"
5. **Abuse Reporting** (Post-MVP):
   - Report mechanism to flag malicious CIDs
   - Community-driven blocklist (opt-in)

**Trigger**: Any file upload  
**Owner**: chronode  
**Status**: Mitigated (validation strategy defined, implementation in Elaboration)  
**Validation**: Penetration testing with malicious payloads before MVP launch

---

### R-003: Legal Liability for Illegal Content

**Category**: Legal / Compliance  
**Description**: Decentralized storage means Zero Noise has no direct control over content. Users may upload illegal material (pirated content, CSAM, etc.), exposing project to legal risk.

**Likelihood**: Medium (anonymous uploads attract abuse)  
**Impact**: High (legal action, platform takedown, reputational damage)  
**Risk Score**: **High**

**Mitigation Strategy**:
1. **Clear Terms of Service**:
   - Explicit prohibition of illegal content
   - Statement: "Zero Noise is a neutral infrastructure provider, not a content host"
   - Users agree they are solely responsible for uploaded content
2. **DMCA Safe Harbor Compliance**:
   - Designate DMCA agent
   - Implement takedown process: unpin reported CIDs from Filebase
   - Respond to legal requests within 24-48 hours
3. **Anonymous Deployment**:
   - No user accounts = no PII to subpoena
   - Minimal logging (error logs only, no IP tracking)
4. **Jurisdictional Strategy**:
   - Deploy on decentralized infrastructure (IPFS) + edge CDN (global)
   - No single-country hosting (harder to target legally)
5. **Content Hash Blocklist** (Optional):
   - Integrate NCMEC or IWF hash list for CSAM detection
   - Proactively reject known illegal content hashes

**Trigger**: Legal notice or abuse report  
**Owner**: chronode  
**Status**: Mitigated (ToS + DMCA process defined)  
**Validation**: Legal review by attorney before public launch (if funded)  
**Acceptance Criteria**: Clear process documented in `.aiwg/security/abuse-handling.md`

---

## High Priority Risks

### R-004: Free Tier Storage Limits Exceeded

**Category**: Resource  
**Description**: Filebase free tier is 5GB. If MVP attracts >50 users uploading 100MB each, storage limit exceeded.

**Likelihood**: Medium (depends on adoption rate)  
**Impact**: Medium (service degradation, need funding)  
**Risk Score**: **Medium**

**Mitigation**:
- Multi-provider strategy: Filebase (5GB) + Web3.Storage (free tier) + NFT.Storage
- Monitoring: Alert at 80% capacity (4GB)
- Funding plan: Seek grants or donations if approaching limit
- Graceful degradation: Warn users "approaching capacity" before hard stop

**Status**: Mitigated (multi-provider architecture)

---

### R-006: Browser IPFS Compatibility Issues

**Category**: Technical  
**Description**: js-ipfs/Helia support varies across browsers. Safari and mobile browsers have limitations (ServiceWorker, WebRTC restrictions).

**Likelihood**: High (known issue in IPFS ecosystem)  
**Impact**: Medium (degraded UX for some users)  
**Risk Score**: **High**

**Mitigation**:
- **Hybrid Architecture**: Don't rely solely on browser IPFS nodes
- Use Filebase API (server-side pinning) as primary path
- Browser IPFS as optional enhancement for advanced users
- Gateway fallback ensures compatibility even if browser node fails
- Feature detection: Gracefully disable browser IPFS on unsupported platforms

**Status**: Mitigated (hybrid architecture)

---

### R-007: Solo Developer Capacity Constraints

**Category**: Resource  
**Description**: Part-time solo developer (~15hrs/week) may struggle to deliver MVP in 8-10 weeks, especially learning IPFS/decentralized tech.

**Likelihood**: High (realistic assessment of hobbyist pace)  
**Impact**: Medium (timeline slip, scope reduction)  
**Risk Score**: **High**

**Mitigation**:
- **Scope Discipline**: Ruthlessly prioritize MVP features, defer nice-to-haves
- **Technical Spikes Early**: Validate IPFS in week 1-2 (reduce unknowns)
- **Reuse Existing Libraries**: Don't build from scratch (Helia, React, Tailwind)
- **Community Support**: Post questions on IPFS forums, Discord
- **Accept Timeline Flexibility**: 10-12 weeks acceptable vs. 8-10 target

**Status**: Accepted (scope management + realistic timeline)

---

### R-008: User Adoption Risk (Product-Market Fit)

**Category**: Business  
**Description**: Target users (researchers, students) may not find MVP compelling enough to switch from Dropbox/Google Drive.

**Likelihood**: Medium (MVP validation risk)  
**Impact**: High (no users = wasted effort)  
**Risk Score**: **High**

**Mitigation**:
- **Early User Interviews**: Talk to 5-10 researchers before coding
- **Differentiation Focus**: Emphasize decentralization, permanence, privacy (not "yet another file sharing app")
- **Niche Targeting**: Start with privacy-conscious early adopters, not mass market
- **Iterative Validation**: Launch MVP quickly, gather feedback, pivot if needed
- **Open Source Strategy**: Build community even if commercial success elusive

**Status**: Monitoring (validate in Elaboration via user interviews)

---

## Medium Priority Risks

### R-005: IPFS Content Permanence Uncertainty

**Category**: Technical  
**Description**: IPFS content-addressing is immutable, but unpinning = eventual garbage collection. Users may expect "permanent" storage.

**Likelihood**: Medium  
**Impact**: Medium (user confusion, content loss)  
**Mitigation**: Clear user communication: "Files persist while pinned. Consider Arweave for truly permanent storage."  
**Status**: Accepted (user education strategy)

---

### R-010: Filebase API Dependency (Single Provider)

**Category**: Vendor  
**Description**: Relying heavily on Filebase API. If they change pricing, shut down, or have outage, MVP impacted.

**Likelihood**: Low (Filebase stable, backed by funding)  
**Impact**: High (service disruption)  
**Mitigation**: Multi-provider pinning (Web3.Storage fallback), Filebase contract monitoring  
**Status**: Mitigated (multi-provider architecture)

---

## Low Priority Risks

### R-009: NAT Traversal Failures for P2P Links

**Category**: Technical  
**Description**: Direct peer-to-peer connections may fail due to NAT/firewall restrictions.

**Likelihood**: Medium  
**Impact**: Low (fallback to IPFS gateways works)  
**Mitigation**: Use IPFS DHT and relay servers; gateways provide fallback path  
**Status**: Accepted (gateway fallback sufficient for MVP)

---

## Risk Management Process

**Risk Review Cadence**: Weekly during Construction, monthly during Production  
**Owner**: chronode  
**Escalation**: N/A (solo project, no escalation path)  
**New Risk Identification**: Add to this list with unique R-XXX ID  
**Retired Risks**: Move to separate `risks-retired.md` file when no longer applicable

---

## Next Steps

1. **Elaboration Phase**: Validate mitigations via technical spikes (IPFS PoC, gateway testing)
2. **Security Review**: Deep-dive threat model for R-002 (malicious files)
3. **Legal Review**: Consult attorney on R-003 (content liability) before public launch
4. **Monitoring Setup**: Implement alerts for R-001 (gateway health), R-004 (storage capacity)
