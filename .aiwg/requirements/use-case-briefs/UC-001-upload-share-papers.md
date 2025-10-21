# UC-001: Upload and Share Research Papers

**ID**: UC-001  
**Priority**: Critical (MVP Core)  
**Status**: Baselined  
**Created**: 2025-10-21

---

## Actor

**Academic Researcher** (Primary Persona: Dr. Sarah)

---

## Goal

Upload multiple research papers (PDFs) and datasets, then share a single P2P link with collaborators that provides permanent, decentralized access to all files.

---

## Preconditions

- User has web browser with modern JavaScript support
- User has research papers/datasets saved locally (<100MB per file for MVP)
- IPFS network and pinning services (Filebase) are operational

---

## Main Flow (High-Level)

1. User visits Zero Noise web app
2. User drags and drops 5-20 PDF files into upload zone
3. System validates files (MIME type, size limits, malicious content check)
4. System uploads files to IPFS and pins to Filebase
5. System generates IPFS CIDs for each file
6. System creates shareable P2P link: `zeronoise.app/share/{collection-CID}`
7. User copies link and sends to collaborators via email/Slack
8. Collaborators click link → browse files → download as needed

---

## Alternative Flows

### A1: Large File (>100MB)
- System shows error: "File exceeds 100MB limit for MVP. Please split or compress."
- User removes large file, proceeds with smaller files

### A2: Malicious File Detected
- System detects suspicious file type or magic bytes mismatch
- System rejects file with warning: "File type validation failed"
- User can proceed with remaining valid files

### A3: IPFS Upload Failure
- System retries upload 3 times
- If all retries fail, show error: "Upload failed. Check connection and try again."
- User can retry or remove problematic file

---

## Success Criteria

- **Functional**: All valid PDFs uploaded, pinned, and accessible via P2P link within 60 seconds
- **Performance**: Upload completes in <30 seconds for 10 files (~50MB total)
- **Reliability**: P2P link works across different networks (80%+ NAT traversal success)
- **Usability**: User completes entire flow in <60 seconds from landing page
- **Security**: No malicious files bypass validation

---

## Non-Functional Requirements

- **Availability**: IPFS pinning must succeed to Filebase (primary) with fallback to Web3.Storage
- **Data Permanence**: Files remain accessible indefinitely while pinned
- **Privacy**: No user tracking; files publicly accessible but anonymous upload
- **Accessibility**: Drag-drop must work with keyboard navigation alternative

---

## Dependencies

- Filebase API uptime (>95%)
- IPFS gateway availability (fallback to 3+ gateways)
- Browser file API support (Drag & Drop, File Reader)

---

## Notes

- This is the #1 critical use case for MVP validation
- File collection management (editing, versioning) deferred to post-MVP
- Email sharing is out of scope; users copy/paste link manually
