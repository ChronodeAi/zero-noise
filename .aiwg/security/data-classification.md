# Zero Noise - Data Classification

**Project**: Zero Noise  
**Date**: 2025-10-21  
**Version**: 1.0 (Inception Baseline)  
**Owner**: chronode

---

## Classification Summary

Zero Noise operates an **anonymous, public content model** with decentralized storage. All user-uploaded files are **publicly accessible via IPFS CIDs** by design.

| Data Type | Classification | Encryption | Access Control | Retention |
|-----------|---------------|------------|----------------|-----------|
| User-uploaded files | **Public** | None (IPFS clear) | Public read | Permanent (pinned) |
| File metadata (CID, name, size, type) | **Public** | None | Public read | Permanent |
| IPFS CIDs | **Public** | None | Public knowledge | Permanent |
| Web link URLs | **Public** | None | Public read | Permanent |
| Error logs | **Internal** | TLS in transit | Admin only | 30 days |
| System metrics (IPFS pins, gateway health) | **Internal** | None | Admin only | 90 days |
| User IP addresses | **Not collected** | N/A | N/A | N/A |
| User accounts/auth | **Not collected** | N/A | N/A | N/A |

---

## Data Types

### Public Data (User-Generated Content)

**Files Uploaded by Users**:
- **Classification**: Public
- **Description**: PDFs, images, videos, audio, documents uploaded via drag-drop interface
- **Storage**: IPFS (content-addressed), Filebase pinning, optional Web3.Storage
- **Encryption**: None (IPFS stores in clear; encryption optional user responsibility)
- **Access**: Publicly accessible via IPFS CID to anyone with link
- **Retention**: Permanent while pinned to pinning services; unpinning = eventual garbage collection
- **Sensitivity**: Varies by user upload; Zero Noise does not control content
- **Risks**: Users may upload sensitive/illegal content (see Risk R-002, R-003)
- **Security Controls**:
  - File type validation (MIME, magic bytes)
  - File size limits (<100MB)
  - Malware scanning (optional, VirusTotal API)
  - Content Security Policy (CSP) for XSS prevention

**File Metadata**:
- **Classification**: Public
- **Description**: CID, filename, file size, MIME type, upload timestamp
- **Storage**: IPFS (embedded in directory CID), optional index (OrbitDB or PocketBase)
- **Access**: Public read via IPFS gateways
- **Retention**: Permanent (linked to file CID)
- **Security Controls**: None required (public by design)

**Web Links and Scraped Metadata**:
- **Classification**: Public
- **Description**: URLs added by users, OpenGraph metadata (title, description, thumbnail)
- **Storage**: IPFS or lightweight index
- **Access**: Public read
- **Retention**: Permanent (linked to collection CID)
- **Security Controls**: URL validation (prevent XSS), rate limiting for scraping APIs

---

### Internal Data (Operational)

**Error Logs**:
- **Classification**: Internal
- **Description**: Application errors, IPFS upload failures, gateway timeouts
- **Storage**: Vercel/Netlify log aggregation (server-side)
- **Encryption**: TLS in transit, at-rest encryption via hosting provider
- **Access**: Admin only (chronode)
- **Retention**: 30 days (then deleted)
- **Sensitivity**: Low (no PII, technical errors only)
- **Security Controls**: Access restricted to project owner, no public exposure

**System Metrics**:
- **Classification**: Internal
- **Description**: IPFS pin counts, gateway response times, upload success rates, storage capacity
- **Storage**: Monitoring service (e.g., Uptime Robot, Datadog free tier)
- **Encryption**: TLS in transit
- **Access**: Admin only
- **Retention**: 90 days rolling window
- **Security Controls**: Dashboard access restricted, no sensitive user data

---

### Data NOT Collected (by Design)

**User Personally Identifiable Information (PII)**:
- **No user accounts**: Anonymous upload model, no registration
- **No IP logging**: Only transient IP addresses for TLS handshake (not persisted)
- **No cookies**: Minimal session state, no tracking cookies
- **No analytics**: No Google Analytics, no user behavior tracking
- **No email addresses**: No email-based sharing, no newsletters

**Rationale**: Privacy-first design, aligns with decentralized ethos, reduces GDPR/CCPA compliance burden.

---

## Security Requirements by Classification

### Public Data (User-Uploaded Content)

**Confidentiality**: Not required (public by design)  
**Integrity**: Critical (prevent malicious file injection, XSS)  
**Availability**: High (IPFS gateway redundancy, multi-provider pinning)

**Controls**:
1. **File Validation**:
   - MIME type checking (client + server)
   - Magic bytes validation
   - File extension whitelist
   - Size limits (<100MB)
2. **Malware Prevention**:
   - Virus scanning API integration (VirusTotal or ClamAV)
   - Content Security Policy (CSP) headers
   - Sandbox iframes for file previews
3. **Availability**:
   - Multi-gateway fallback (3+ IPFS gateways)
   - Multi-provider pinning (Filebase + Web3.Storage)
   - Health monitoring and alerting
4. **Legal Protection**:
   - Terms of Service (user responsibility for content)
   - DMCA takedown process (unpin reported CIDs)
   - Clear disclaimers ("unverified user content")

### Internal Data (Logs, Metrics)

**Confidentiality**: Medium (no PII, but operational intelligence)  
**Integrity**: Medium (detect tampering with logs)  
**Availability**: Low (non-critical for user-facing service)

**Controls**:
1. **Access Control**:
   - Dashboard login restricted to project owner
   - 2FA on hosting accounts (Vercel, Filebase)
2. **Encryption**:
   - TLS for log transmission
   - At-rest encryption via hosting provider defaults
3. **Retention**:
   - Auto-delete logs after 30 days (minimize data exposure)
   - No long-term log archiving

---

## Encryption Strategy

### Data at Rest
- **User files**: Not encrypted by Zero Noise (IPFS stores in clear)
- **User responsibility**: Encrypt locally before upload if sensitivity required
- **Alternative**: Integrate Lit Protocol or similar for encrypted IPFS (post-MVP)

### Data in Transit
- **TLS 1.3**: All HTTPS connections (frontend, API calls, IPFS gateways)
- **IPFS Protocol**: Libp2p uses encrypted transports (Noise, TLS)

---

## Access Control

**Public Content**:
- Anyone with CID can access via IPFS gateways
- No authentication required (by design)

**Admin Operations**:
- Filebase API key: Environment variable, never committed to git
- Vercel/Netlify dashboard: Password + 2FA
- GitHub repo: Private initially (open source at MVP launch)

---

## Compliance Considerations

### GDPR (EU General Data Protection Regulation)
- **Applicability**: Low (no user accounts, no PII collection)
- **Right to Access**: N/A (no user data stored)
- **Right to Deletion**: Not supported (IPFS immutable; unpinning ≠ guaranteed deletion)
- **Data Processing**: Zero Noise is infrastructure provider, not data controller
- **Mitigation**: Clear ToS disclaiming GDPR applicability for anonymous uploads

### CCPA (California Consumer Privacy Act)
- **Applicability**: Low (no personal information collected)
- **Mitigation**: Privacy policy stating no PI collection

### DMCA (Digital Millennium Copyright Act)
- **Applicability**: High (user-uploaded content may be copyrighted)
- **Safe Harbor**: Designate DMCA agent, implement takedown process
- **Mitigation**: Unpin reported CIDs from Filebase within 24-48 hours

### Other Regulations
- **COPPA**: Not applicable (no services directed to children <13)
- **HIPAA**: Not applicable (no healthcare data storage)
- **PCI-DSS**: Not applicable (no payment processing)

---

## Data Retention Policy

**User-Uploaded Files**:
- **Retention**: Permanent while pinned to Filebase/Web3.Storage
- **Deletion**: Unpinning removes from pinning service; IPFS garbage collection eventual
- **No automated deletion**: Files persist indefinitely by default

**Logs and Metrics**:
- **Error logs**: 30 days, then auto-deleted
- **System metrics**: 90 days rolling window
- **No archiving**: Minimize data footprint

---

## Privacy Impact Assessment

**Risk**: Users upload sensitive data (PII, trade secrets, etc.) without understanding public nature  
**Mitigation**: Clear warnings on upload page:
- "Files are publicly accessible via IPFS. Do not upload sensitive information."
- "Zero Noise does not control access to uploaded content."

**Risk**: Legal liability for user-uploaded illegal content  
**Mitigation**: See Risk R-003 mitigation (ToS, DMCA process, content hash blocklist)

---

## Next Steps (Elaboration Phase)

1. **Terms of Service**: Draft clear ToS with user content responsibility clause
2. **Privacy Policy**: Document no-PII-collection policy
3. **Threat Model**: Deep-dive security analysis (malicious files, XSS, DDoS)
4. **DMCA Agent**: Designate agent and document takedown process
5. **Content Hash Blocklist**: Evaluate NCMEC/IWF integration for CSAM prevention
6. **Encryption Options**: Research Lit Protocol or Fission for optional encrypted IPFS (post-MVP)

---

## Approval

**Classification Approved By**: chronode (Owner)  
**Date**: 2025-10-21  
**Review Cadence**: Quarterly or when major features added  
**Status**: BASELINED for Elaboration Phase
