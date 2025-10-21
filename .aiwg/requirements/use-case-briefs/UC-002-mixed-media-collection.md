# UC-002: Curate Mixed Media Study Pack

**ID**: UC-002  
**Priority**: High (MVP Core)  
**Status**: Baselined  
**Created**: 2025-10-21

---

## Actor

**Study Group Coordinator** (Secondary Persona: Marcus)

---

## Goal

Aggregate diverse content types (PDFs, videos, web links, images) into a single collection and share with study group members via one link.

---

## Preconditions

- User has mixed content: papers (PDFs), lecture recordings (MP4), YouTube links, reference images
- User has web browser access
- Content individually <100MB per file

---

## Main Flow

1. User visits Zero Noise
2. User drags and drops: 5 PDFs + 2 MP4 videos + adds 3 YouTube URLs + 10 PNG images
3. System uploads files to IPFS, scrapes metadata for URLs (OpenGraph, YouTube API)
4. System displays collection preview with file type icons, thumbnails, link previews
5. System generates collection CID and shareable link
6. User copies link and posts to study group Slack/Discord
7. Students browse collection in clean interface, filter by type (PDFs/videos/links)
8. Students download files or watch videos inline

---

## Alternative Flows

### A1: Web Link Scraping Fails
- System shows generic link icon with URL text
- User can still share; recipients click through to original URL

### A2: Mixed File Size (some >100MB)
- System accepts files <100MB, rejects larger ones with clear error
- User proceeds with accepted files

---

## Success Criteria

- Mixed content types display correctly in unified interface
- Link preview metadata scraped successfully >80% of time
- Collection loads in <2 seconds
- Filtering by file type works instantly

---

## Non-Functional Requirements

- **UX**: "Zero noise" interface shows only essential elements
- **Performance**: Link scraping completes in <3 seconds per URL
- **Accessibility**: File type filters keyboard-navigable

---

## Dependencies

- OpenGraph metadata support on target sites
- YouTube API quota availability
- IPFS pinning for mixed media types
