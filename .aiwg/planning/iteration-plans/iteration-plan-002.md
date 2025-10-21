# Iteration Plan 002 - Sprint 2

**Project**: Zero Noise  
**Sprint**: 2 (Week 3-4)  
**Duration**: 2 weeks  
**Start Date**: 2025-10-28  
**End Date**: 2025-11-08  
**Sprint Goal**: Enable collection sharing with metadata persistence and gateway fallback

---

## Sprint Goal

Implement metadata tracking with database persistence, shareable collection URLs, gateway fallback mechanism, and file browsing UI to enable users to share collections of files via IPFS with high retrieval reliability.

---

## Sprint Backlog

### Story 1: Database Schema Setup (8 points)
**Priority**: P0 (Must Have)  
**Description**: Set up Prisma ORM with PostgreSQL schema for file metadata persistence

**Acceptance Criteria**:
- [ ] Prisma installed and configured
- [ ] Database schema defined (File, Collection models)
- [ ] Database migrations created
- [ ] Connection to database established
- [ ] Seed data for development

**Technical Tasks**:
- Install Prisma and PostgreSQL client
- Define Prisma schema (`schema.prisma`)
- Create File model (CID, filename, size, MIME, uploadedAt)
- Create Collection model (ID, createdAt, files relation)
- Run initial migration
- Configure database URL in environment variables
- Create seed script

**Dependencies**: None  
**Estimate**: 8 points

---

### Story 2: File Metadata Persistence (13 points)
**Priority**: P0 (Must Have)  
**Description**: Store file metadata in database after successful IPFS upload

**Acceptance Criteria**:
- [ ] File metadata saved to database on upload success
- [ ] CID, filename, size, MIME type, upload timestamp stored
- [ ] Collection ID generated for upload session
- [ ] API returns collection ID with file metadata
- [ ] Error handling for database write failures

**Technical Tasks**:
- Create Prisma client singleton
- Update `/api/upload` to save metadata after Filebase upload
- Generate unique collection ID (UUID or nanoid)
- Associate uploaded files with collection
- Return collection metadata in API response
- Add database error handling

**Dependencies**: Story 1 (Database Schema)  
**Estimate**: 13 points

---

### Story 3: Shareable Collection URL Generation (8 points)
**Priority**: P0 (Must Have)  
**Description**: Generate shareable URLs for collections with copy-to-clipboard functionality

**Acceptance Criteria**:
- [ ] Collection URL format: `/c/{collectionId}`
- [ ] Copy-to-clipboard button on upload success
- [ ] URL displayed prominently after upload
- [ ] Visual feedback on successful copy
- [ ] QR code generation for URL (optional bonus)

**Technical Tasks**:
- Create collection URL format
- Add clipboard API integration
- Design URL display component
- Add copy button with icon
- Show success toast/notification
- (Optional) Integrate QR code library

**Dependencies**: Story 2 (Metadata Persistence)  
**Estimate**: 8 points

---

### Story 4: Collection Page (21 points)
**Priority**: P0 (Must Have)  
**Description**: Display all files in a collection with metadata and download links

**Acceptance Criteria**:
- [ ] Collection page route `/c/[id]` created
- [ ] Fetch collection metadata from database by ID
- [ ] Display all files in collection with name, size, type
- [ ] Show IPFS gateway link for each file
- [ ] Handle collection not found (404)
- [ ] Responsive design (mobile + desktop)
- [ ] Loading state while fetching

**Technical Tasks**:
- Create Next.js dynamic route `/app/c/[id]/page.tsx`
- Create API endpoint `/api/collection/[id]` to fetch collection
- Query database for collection + files
- Design collection page UI
- Display file list with metadata
- Add gateway links for each file
- Implement error states (not found, server error)
- Add loading skeleton

**Dependencies**: Story 2 (Metadata Persistence)  
**Estimate**: 21 points

---

### Story 5: Gateway Fallback Mechanism (13 points)
**Priority**: P0 (Must Have)  
**Description**: Implement multi-gateway fallback for IPFS file retrieval

**Acceptance Criteria**:
- [ ] Multiple IPFS gateways configured (Filebase, ipfs.io, dweb.link)
- [ ] Automatic fallback on gateway failure
- [ ] Gateway health check before redirect
- [ ] Primary gateway preference (Filebase)
- [ ] Fallback to secondary/tertiary gateways
- [ ] Client-side retry logic

**Technical Tasks**:
- Define gateway priority list (Filebase → ipfs.io → dweb.link)
- Create gateway health check utility
- Implement fallback logic in collection page
- Test gateway failure scenarios
- Add timeout handling (5s per gateway)
- Log gateway performance metrics

**Dependencies**: Story 4 (Collection Page)  
**Estimate**: 13 points

---

## Sprint Capacity

**Developer**: chronode (solo developer)  
**Availability**: ~15 hours/week × 2 weeks = 30 hours  
**Estimated Velocity**: 50-60 story points/sprint (baseline from Sprint 1)

**Total Story Points**: 63 points  
**Risk**: Slightly over capacity (30 hours, 63 points)

**Mitigation**:
- Story 5 (Gateway Fallback) can be simplified to basic fallback without health checks if time is tight
- QR code feature in Story 3 is optional
- Focus on core P0 features first

---

## Definition of Done

**Per Story**:
- [ ] Code implemented and committed
- [ ] Unit tests written (>80% coverage for new code)
- [ ] Integration tests for API endpoints
- [ ] Code reviewed (self-review for solo dev)
- [ ] Deployed to Vercel staging
- [ ] Manual testing completed
- [ ] Documentation updated (README, API docs)

**Per Sprint**:
- [ ] All P0 stories complete
- [ ] CI/CD pipeline passing
- [ ] No P0 bugs in staging
- [ ] Sprint demo recorded
- [ ] Retrospective completed

---

## Technical Risks

### R-015: Database Performance (Low)
**Description**: Database queries may slow down collection page load  
**Mitigation**: Use connection pooling, add indexes on CID and collectionId fields  
**Owner**: chronode

### R-016: Gateway Reliability (Medium)
**Description**: All gateways may fail simultaneously  
**Mitigation**: Monitor gateway uptime, consider Storacha backup pinning  
**Owner**: chronode

### R-017: Database Hosting Cost (Low)
**Description**: PostgreSQL hosting may add recurring cost  
**Mitigation**: Use free tier (Vercel Postgres, Supabase, or Neon), scale later  
**Owner**: chronode

---

## Dependencies

**External**:
- Prisma ORM
- PostgreSQL database (Vercel Postgres or Supabase)
- Clipboard API (browser native)

**Internal**:
- Sprint 1 upload infrastructure (complete)
- Filebase API integration (complete)

---

## Sprint Schedule

### Week 3 (Oct 28 - Nov 1)
**Day 1-2**: Story 1 (Database Schema Setup)  
**Day 3-4**: Story 2 (File Metadata Persistence)  
**Day 5**: Story 3 (Shareable URL Generation)

### Week 4 (Nov 4 - Nov 8)
**Day 1-3**: Story 4 (Collection Page)  
**Day 4-5**: Story 5 (Gateway Fallback Mechanism)

**Buffer**: 2-3 hours for bug fixes and testing

---

## Success Criteria

**Functional**:
- [ ] Users can upload files and receive a shareable collection URL
- [ ] Collection URLs persist in database
- [ ] Collection page displays all files with gateway links
- [ ] Gateway fallback works automatically on failure
- [ ] Copy-to-clipboard for collection URL works

**Quality**:
- [ ] >80% test coverage for new code
- [ ] All API endpoints have integration tests
- [ ] CI/CD pipeline passing
- [ ] Zero P0 bugs in staging

**Performance**:
- [ ] Collection page loads in <2s
- [ ] Database queries <500ms p95
- [ ] Gateway fallback <10s total (2 gateways × 5s timeout)

---

## Sprint Review

**Demo Scope**:
1. Upload 3-5 files (PDF, images, video)
2. Show generated collection URL
3. Share collection URL in new browser tab
4. View collection page with all files
5. Click gateway links to verify file retrieval
6. Demonstrate gateway fallback (simulate failure)

**Demo Date**: 2025-11-08  
**Attendees**: chronode (solo developer)

---

## Retrospective

**Date**: 2025-11-08  
**Focus**: 
- What worked well in Sprint 2?
- What slowed us down?
- Database setup challenges?
- Gateway fallback reliability?

---

## Next Sprint Preview (Sprint 3)

**Potential Stories**:
- File preview (inline PDF, images, video)
- URL scraping (YouTube, OpenGraph metadata)
- Batch file deletion
- Collection expiration (auto-delete after N days)
- Analytics tracking (upload/view counts)

---

## Appendix: Database Schema

```prisma
// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Collection {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  files     File[]
}

model File {
  id           String     @id @default(uuid())
  cid          String     @unique
  filename     String
  size         Int
  mimeType     String
  uploadedAt   DateTime   @default(now())
  collectionId String
  collection   Collection @relation(fields: [collectionId], references: [id])
  
  @@index([collectionId])
  @@index([cid])
}
```

---

**Sprint Owner**: chronode  
**Last Updated**: 2025-10-21
