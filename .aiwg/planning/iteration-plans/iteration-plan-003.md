# Iteration Plan 003 - Sprint 3

**Project**: Zero Noise  
**Sprint**: 3 (Week 5-6)  
**Duration**: 2 weeks  
**Start Date**: 2025-11-11  
**End Date**: 2025-11-22  
**Sprint Goal**: Enable URL link saving and semantic search across all files

---

## Sprint Goal

Add URL scraping capabilities to save web links alongside files, and implement AI-powered semantic search to find files across all Filebase storage by content meaning, not just filename.

---

## Sprint Backlog

### Story 1: URL Scraping Infrastructure (13 points)
**Priority**: P0 (Must Have)  
**Description**: Scrape metadata from URLs (YouTube, articles, social media) and save as collection items

**Acceptance Criteria**:
- [ ] API endpoint accepts URLs as upload input
- [ ] Fetch OpenGraph metadata (title, description, image)
- [ ] Extract YouTube video metadata (title, thumbnail, duration)
- [ ] Store URL metadata in database alongside files
- [ ] Display URL cards in collection page
- [ ] Support multiple URL formats (YouTube, Twitter, articles)

**Technical Tasks**:
- Install metadata scraping libraries (`oembed`, `open-graph-scraper`)
- Create `/api/scrape-url` endpoint
- Extract OG tags, Twitter cards, oEmbed data
- Store URL metadata in new `Link` model (Prisma schema)
- Associate links with collections
- Render URL preview cards in UI

**Dependencies**: None  
**Estimate**: 13 points

---

### Story 2: URL Upload UI (8 points)
**Priority**: P0 (Must Have)  
**Description**: Add URL input to upload page for mixed file + link collections

**Acceptance Criteria**:
- [ ] URL input field on homepage
- [ ] Paste multiple URLs (line-separated)
- [ ] Preview URL metadata before adding to collection
- [ ] Mix files and URLs in same collection
- [ ] Visual distinction between file vs. link items

**Technical Tasks**:
- Add URL input component
- Call `/api/scrape-url` for preview
- Update upload handler to accept URLs
- Modify UploadZone to show mixed items
- Add URL icon/badge for link items

**Dependencies**: Story 1 (URL Scraping)  
**Estimate**: 8 points

---

### Story 3: Semantic Search Infrastructure (21 points)
**Priority**: P0 (Must Have)  
**Description**: Index file content and enable semantic search across all files in Filebase

**Acceptance Criteria**:
- [ ] Extract text from PDFs, images (OCR), videos (transcription)
- [ ] Generate embeddings for file content
- [ ] Store embeddings in vector database (pgvector)
- [ ] Search API accepts natural language queries
- [ ] Return relevant files ranked by similarity
- [ ] Support multi-file format search (PDF, text, images)

**Technical Tasks**:
- Install pgvector extension in Postgres
- Add `embedding` column to File model (vector type)
- Install text extraction libraries:
  - `pdf-parse` for PDFs
  - `tesseract.js` for OCR (images)
  - OpenAI Whisper API for video transcription (optional)
- Generate embeddings using OpenAI API (`text-embedding-3-small`)
- Create background job to process existing files
- Build `/api/search` endpoint with vector similarity

**Dependencies**: None (parallel to Story 1-2)  
**Estimate**: 21 points

---

### Story 4: Search UI (13 points)
**Priority**: P0 (Must Have)  
**Description**: Add search interface to find files by semantic meaning

**Acceptance Criteria**:
- [ ] Search bar on homepage
- [ ] Natural language queries (e.g., "contracts from Q4")
- [ ] Display search results with relevance score
- [ ] Click result to jump to collection page
- [ ] Show file preview/snippet in results
- [ ] Handle no results gracefully

**Technical Tasks**:
- Create search input component
- Call `/api/search` with query
- Display results list with metadata
- Add loading/empty states
- Highlight matching text snippets

**Dependencies**: Story 3 (Search Infrastructure)  
**Estimate**: 13 points

---

### Story 5: Background Processing (13 points)
**Priority**: P1 (Nice to Have)  
**Description**: Process existing files for search indexing

**Acceptance Criteria**:
- [ ] Background job processes all files on upload
- [ ] Extract text from new files automatically
- [ ] Generate embeddings asynchronously
- [ ] Update existing files (backfill)
- [ ] Show indexing status in admin view
- [ ] Error handling for unsupported formats

**Technical Tasks**:
- Set up job queue (BullMQ or Vercel Cron)
- Create text extraction worker
- Create embedding generation worker
- Add retry logic for failures
- Build admin status page

**Dependencies**: Story 3 (Search Infrastructure)  
**Estimate**: 13 points (can be deferred if time constrained)

---

## Sprint Capacity

**Developer**: chronode (solo developer)  
**Availability**: ~15 hours/week × 2 weeks = 30 hours  
**Estimated Velocity**: 50-60 story points/sprint (baseline from Sprint 1-2)

**Total Story Points**: 68 points (Stories 1-4 = 55 points, Story 5 optional)  
**Risk**: Over capacity

**Mitigation**:
- Story 5 (Background Processing) can be deferred to Sprint 4
- Use OpenAI API for embeddings (no local model setup)
- Limit initial text extraction to PDFs and text files only
- Add OCR/transcription later

---

## Definition of Done

**Per Story**:
- [ ] Code implemented and committed
- [ ] API endpoints tested manually
- [ ] Frontend UI functional
- [ ] Deployed to Vercel staging
- [ ] Manual testing completed
- [ ] Documentation updated

**Per Sprint**:
- [ ] All P0 stories complete (Stories 1-4)
- [ ] URL scraping working for YouTube + articles
- [ ] Semantic search returns relevant results
- [ ] CI/CD pipeline passing
- [ ] No P0 bugs in staging

---

## Technical Architecture

### Database Schema Updates

```prisma
// Add to schema.prisma

model Link {
  id           String     @id @default(uuid())
  url          String
  title        String?
  description  String?
  imageUrl     String?
  siteName     String?
  linkType     String     // "article", "video", "social", "generic"
  createdAt    DateTime   @default(now())
  collectionId String
  collection   Collection @relation(fields: [collectionId], references: [id])
  
  @@index([collectionId])
}

model File {
  // ... existing fields ...
  
  // Add for semantic search
  textContent  String?    @db.Text  // Extracted text
  embedding    Unsupported("vector(1536)")? // OpenAI embedding
  indexed      Boolean    @default(false)
  indexedAt    DateTime?
  
  // ... rest of schema
}
```

### URL Scraping Stack

- **oembed**: YouTube, Vimeo, SoundCloud metadata
- **open-graph-scraper**: Article metadata (OG tags)
- **cheerio**: Fallback HTML scraping

### Semantic Search Stack

- **pgvector**: PostgreSQL vector extension
- **OpenAI API**: `text-embedding-3-small` (1536 dimensions)
- **pdf-parse**: PDF text extraction
- **tesseract.js**: OCR for images (optional)

### Search Flow

```
User Query → Generate Embedding → Vector Similarity Search → Rank Results → Return Files
```

---

## Technical Risks

### R-018: OpenAI API Cost (Medium)
**Description**: Embedding generation may add recurring cost  
**Mitigation**: Use smaller model (`text-embedding-3-small`), cache embeddings, rate limit  
**Owner**: chronode

### R-019: Text Extraction Accuracy (Low)
**Description**: OCR/PDF parsing may be unreliable for some files  
**Mitigation**: Focus on high-quality PDFs first, add manual fallback  
**Owner**: chronode

### R-020: Search Latency (Low)
**Description**: Vector search may be slow for large datasets  
**Mitigation**: Add indexes, use connection pooling, consider caching  
**Owner**: chronode

---

## Dependencies

**External**:
- OpenAI API (embeddings, optional transcription)
- pgvector PostgreSQL extension
- Text extraction libraries

**Internal**:
- Sprint 1-2 infrastructure (database, Filebase, collections)
- Neon database with pgvector support

---

## Sprint Schedule

### Week 5 (Nov 11 - Nov 15)
**Day 1-2**: Story 1 (URL Scraping Infrastructure)  
**Day 3**: Story 2 (URL Upload UI)  
**Day 4-5**: Story 3 (Semantic Search Infrastructure - Part 1)

### Week 6 (Nov 18 - Nov 22)
**Day 1-2**: Story 3 (Semantic Search Infrastructure - Part 2)  
**Day 3-4**: Story 4 (Search UI)  
**Day 5**: Testing, bug fixes, documentation

**Buffer**: Story 5 (Background Processing) deferred if needed

---

## Success Criteria

**Functional**:
- [ ] Users can paste YouTube URLs and add to collections
- [ ] URL metadata displays with preview cards
- [ ] Semantic search finds files by meaning ("show me contracts")
- [ ] Search works across all file types (PDFs, images, text)
- [ ] Mixed collections (files + URLs) display correctly

**Quality**:
- [ ] URL scraping success rate >90%
- [ ] Search results relevant (top 3 results contain target)
- [ ] Search latency <2s
- [ ] No regressions in upload/collection features

**Performance**:
- [ ] URL scraping <5s per link
- [ ] Embedding generation <10s per file
- [ ] Search query <2s response time

---

## Sprint Review

**Demo Scope**:
1. Upload files + paste YouTube URLs → mixed collection
2. Show URL preview cards in collection page
3. Search "find presentations about AI" → relevant files appear
4. Search "videos about blockchain" → YouTube links appear
5. Test cross-format search (PDF + images)

**Demo Date**: 2025-11-22  
**Attendees**: chronode (solo developer)

---

## Retrospective

**Date**: 2025-11-22  
**Focus**:
- Did URL scraping meet expectations?
- Is semantic search accurate enough?
- Should we add more file formats?
- Performance bottlenecks?

---

## Next Sprint Preview (Sprint 4)

**Potential Stories**:
- Background processing for existing files (Story 5 carried over)
- File preview (inline PDF, images, video player)
- QR code generation for collections
- Collection expiration/deletion
- Advanced search filters (date, file type, size)

---

**Sprint Owner**: chronode  
**Last Updated**: 2025-10-21
