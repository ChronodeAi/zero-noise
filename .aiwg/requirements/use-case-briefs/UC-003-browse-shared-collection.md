# UC-003: Browse and Download from Shared Collection

**ID**: UC-003  
**Priority**: Critical (MVP Core)  
**Status**: Baselined  
**Created**: 2025-10-21

---

## Actor

**Collection Recipient** (Any user with P2P link)

---

## Goal

Access shared collection via P2P link, browse contents, and download needed files without authentication or account creation.

---

## Preconditions

- User receives P2P link (`zeronoise.app/share/{CID}`)
- User has web browser
- IPFS gateways operational

---

## Main Flow

1. User clicks P2P link in email/Slack/message
2. Browser loads Zero Noise with collection CID
3. System queries IPFS for collection metadata via gateway fallback
4. System displays file list with icons, names, sizes
5. User browses files, filters by type (optional)
6. User clicks file → preview loads (if supported) or download initiates
7. User downloads selected files to local machine

---

## Alternative Flows

### A1: Gateway Timeout
- System tries primary gateway (ipfs.io) → timeout after 5s
- System falls back to secondary gateway (dweb.link) → success
- User sees brief loading indicator but retrieval succeeds

### A2: Collection Not Found
- CID not pinned or propagation incomplete
- System shows error: "Collection not found. Link may be invalid or still propagating."
- Suggest user wait 1-2 minutes and refresh

### A3: Mobile Browser
- User accesses on mobile (iOS Safari, Android Chrome)
- Responsive design displays correctly
- Downloads work with browser's native download manager

---

## Success Criteria

- Collection loads in <2 seconds on desktop, <3 seconds on mobile
- Gateway fallback recovers from primary failure within 10 seconds
- Files preview correctly (images, PDFs inline; videos play)
- Downloads complete successfully >95% of time

---

## Non-Functional Requirements

- **Zero friction**: No login, no account creation, no email verification
- **Performance**: IPFS gateway fallback transparent to user
- **Accessibility**: Keyboard navigation, screen reader compatible
- **Privacy**: No tracking of who accesses collection

---

## Dependencies

- IPFS gateway availability (3+ fallback gateways)
- Browser download API support
- IPFS DHT propagation (<30 seconds for new CIDs)
