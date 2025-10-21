# Feature Requirements: Authentication & Gamification System

**Project**: Zero Noise  
**Feature**: User Authentication, Whitelist Management, Invite Codes, XP System  
**Phase**: Post-MVP Evolution  
**Date**: 2025-10-21  
**Status**: APPROVED

---

## Executive Summary

This feature introduces authentication and gamification to Zero Noise to:
1. **Prevent spam** via whitelist-based access control
2. **Enable collaboration** among trusted friends sharing a filebase
3. **Track attribution** for audit and credit purposes
4. **Gamify contributions** with lightweight XP system (Tamagotchi/Flipper Zero inspired)

**Core Principle**: Maintain "zero noise" UX while adding necessary access controls.

---

## User Stories

### Epic 1: Authentication System

#### US-001: OAuth Sign-In (Google)
**As a** whitelisted user  
**I want to** sign in with my Google account  
**So that** I can quickly access the app without creating passwords

**Acceptance Criteria**:
- [ ] User can click "Sign in with Google" button
- [ ] OAuth redirects to Google consent screen
- [ ] After approval, user redirected back to app
- [ ] Session persists across page reloads
- [ ] Non-whitelisted Google users are rejected with clear error message

**Priority**: P0 (Must Have)  
**Story Points**: 13

---

#### US-002: Email/Password Sign-In (Credentials)
**As a** whitelisted user without Google account  
**I want to** sign in with email and password  
**So that** I can access the app with any email provider

**Acceptance Criteria**:
- [ ] User can enter email and password on sign-in page
- [ ] Password hashed with bcrypt before storage
- [ ] Non-whitelisted emails rejected
- [ ] Invalid credentials show clear error message
- [ ] "Forgot password" flow implemented (basic email reset)

**Priority**: P1 (Should Have)  
**Story Points**: 8

---

#### US-003: Session Management
**As a** signed-in user  
**I want** my session to persist  
**So that** I don't have to re-authenticate constantly

**Acceptance Criteria**:
- [ ] Session lasts 30 days by default
- [ ] User can sign out manually
- [ ] Session invalidated on sign-out
- [ ] Session refreshed on activity

**Priority**: P0 (Must Have)  
**Story Points**: 5

---

### Epic 2: Whitelist Management

#### US-004: Admin Whitelist Interface
**As an** admin  
**I want to** manually add emails to whitelist  
**So that** I can approve trusted users

**Acceptance Criteria**:
- [ ] Admin panel at `/admin/whitelist` accessible only to admins
- [ ] Form to add email addresses
- [ ] Table showing all whitelisted emails with metadata (added date, added by)
- [ ] Button to remove emails from whitelist
- [ ] Confirmation dialog before removal

**Priority**: P0 (Must Have)  
**Story Points**: 13

---

#### US-005: Whitelist Enforcement
**As a** system  
**I want to** block non-whitelisted users  
**So that** only approved users can upload files

**Acceptance Criteria**:
- [ ] Upload API returns 401 for non-authenticated users
- [ ] OAuth sign-in rejected if email not whitelisted
- [ ] Credentials sign-in rejected if email not whitelisted
- [ ] Clear error messages guide users to request access

**Priority**: P0 (Must Have)  
**Story Points**: 8

---

### Epic 3: Invite Code System

#### US-006: Generate Invite Codes
**As an** admin  
**I want to** generate invite codes  
**So that** I can easily onboard friends without manual whitelist entry

**Acceptance Criteria**:
- [ ] Admin panel at `/admin/invites` shows all invite codes
- [ ] "Generate Code" button creates 8-character alphanumeric code
- [ ] Code has expiry date (default 30 days, configurable)
- [ ] Table shows code status (Active, Claimed, Expired)
- [ ] Each code can only be claimed once

**Priority**: P0 (Must Have)  
**Story Points**: 13

---

#### US-007: Redeem Invite Codes
**As a** new user  
**I want to** redeem an invite code  
**So that** I can get whitelisted and access the app

**Acceptance Criteria**:
- [ ] Public page at `/auth/redeem` accepts invite code + email
- [ ] Valid code whitelists the email immediately
- [ ] Code marked as claimed with timestamp
- [ ] User redirected to sign-in page after redemption
- [ ] Expired or invalid codes show clear error messages

**Priority**: P0 (Must Have)  
**Story Points**: 13

---

#### US-008: Invite Code Tracking
**As an** admin  
**I want to** see who claimed each invite code  
**So that** I can audit user onboarding

**Acceptance Criteria**:
- [ ] Admin panel shows "Claimed By" column with email
- [ ] "Claimed At" timestamp displayed
- [ ] Filter to show only active/claimed/expired codes

**Priority**: P1 (Should Have)  
**Story Points**: 5

---

### Epic 4: Attribution & Audit

#### US-009: Track File Uploader
**As a** user  
**I want to** see who uploaded each file  
**So that** I can give credit and audit contributions

**Acceptance Criteria**:
- [ ] Every file upload records uploader user ID
- [ ] File list shows uploader name next to each file
- [ ] Search results display uploader name
- [ ] Legacy files (no uploader) display gracefully as "Anonymous"

**Priority**: P0 (Must Have)  
**Story Points**: 8

---

#### US-010: Track Link/URL Uploader
**As a** user  
**I want to** see who added each link  
**So that** I can audit URL contributions

**Acceptance Criteria**:
- [ ] Every link upload records uploader user ID
- [ ] Link list shows uploader name
- [ ] Search results display uploader for links

**Priority**: P0 (Must Have)  
**Story Points**: 5

---

### Epic 5: XP & Gamification

#### US-011: Award XP for Uploads
**As a** user  
**I want to** earn XP for uploading files and links  
**So that** I feel rewarded for contributing

**Acceptance Criteria**:
- [ ] File upload awards 10 XP
- [ ] Link upload awards 5 XP
- [ ] Collection creation awards 15 XP
- [ ] XP toast notification shows after each upload
- [ ] XP total updates in real-time

**Priority**: P1 (Should Have)  
**Story Points**: 8

---

#### US-012: Level System
**As a** user  
**I want to** see my level and title  
**So that** I can track progression

**Acceptance Criteria**:
- [ ] 5 levels defined:
  - Level 1: 🔬 Researcher (0-99 XP)
  - Level 2: 📚 Contributor (100-299 XP)
  - Level 3: 🎓 Scholar (300-599 XP)
  - Level 4: 🗂️ Curator (600-999 XP)
  - Level 5: 🏛️ Archivist (1000+ XP)
- [ ] Level badge displayed in top-right corner
- [ ] Level shown on uploader attribution

**Priority**: P1 (Should Have)  
**Story Points**: 8

---

#### US-013: Level-Up Notification
**As a** user  
**I want to** be notified when I level up  
**So that** I feel accomplished

**Acceptance Criteria**:
- [ ] Level-up triggers confetti animation
- [ ] Toast notification shows new level and title
- [ ] Notification auto-dismisses after 3 seconds

**Priority**: P2 (Nice to Have)  
**Story Points**: 5

---

### Epic 6: Search Filtering

#### US-014: "My Uploads Only" Toggle
**As a** user  
**I want to** filter search results to only my uploads  
**So that** I can quickly find my contributions

**Acceptance Criteria**:
- [ ] Checkbox toggle "My uploads only" next to search bar
- [ ] When checked, search results filtered to current user's uploads
- [ ] Toggle persists during search session
- [ ] Toggle only visible when user is signed in

**Priority**: P1 (Should Have)  
**Story Points**: 8

---

## Non-Functional Requirements

### NFR-001: Performance
- [ ] Authentication adds <100ms latency to upload API
- [ ] Session validation cached (no DB hit per request)
- [ ] XP calculation does not block upload response

**Priority**: P0

---

### NFR-002: Security
- [ ] Passwords hashed with bcrypt (cost factor 10)
- [ ] OAuth tokens encrypted at rest
- [ ] Admin routes protected by middleware
- [ ] CSRF protection enabled for all forms
- [ ] Rate limiting on sign-in endpoint (10 attempts/hour)

**Priority**: P0

---

### NFR-003: Usability
- [ ] Sign-in page loads <2 seconds
- [ ] XP badge does not clutter UI (small, top-right corner)
- [ ] Level-up animation does not block user actions
- [ ] Admin panel has clear navigation

**Priority**: P1

---

### NFR-004: Data Integrity
- [ ] User-file relationship uses foreign keys
- [ ] Soft delete for users (preserve attribution on account deletion)
- [ ] Invite codes cannot be reused after claiming

**Priority**: P0

---

## Acceptance Criteria (Feature-Level)

### Feature Complete When:
- [ ] Admin can whitelist emails via admin panel
- [ ] Admin can generate invite codes with expiry
- [ ] Users can redeem invite codes to get whitelisted
- [ ] Users can sign in with Google OAuth or email/password
- [ ] Non-whitelisted users blocked from uploads
- [ ] All uploads track uploader (user ID + name)
- [ ] XP awarded and displayed after each upload
- [ ] Level system functional with 5 levels
- [ ] Search has "My uploads only" toggle
- [ ] All tests pass (unit, integration, E2E)

---

## Out of Scope (Deferred)

### Not Included in This Feature:
- Multi-role permissions (everyone is equal, only admin vs. user)
- User profiles or bio pages
- Social features (following, notifications)
- Leaderboards or competitive XP ranking
- Advanced XP mechanics (streaks, bonuses, achievements)
- Email verification (trust whitelist/invite code model)
- Two-factor authentication (low risk for MVP)

---

## Dependencies

### Technical Dependencies:
- NextAuth.js v5 (beta) for authentication
- Prisma for database schema
- PostgreSQL for user data storage
- bcryptjs for password hashing

### External Dependencies:
- Google OAuth credentials (client ID + secret)
- Email provider (for password reset, deferred to P1)

---

## Risk Analysis

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| OAuth provider downtime | High | Low | Allow credentials fallback |
| Invite code abuse (mass generation) | Medium | Medium | Admin-only access, rate limiting |
| XP inflation (users spam uploads) | Low | Medium | Implement daily XP cap (deferred) |
| Session hijacking | High | Low | HTTPS only, secure cookies, short expiry |
| Whitelist bypass | High | Low | Server-side enforcement, thorough testing |

---

## Testing Strategy

### Unit Tests:
- XP calculation logic (`xp.ts`)
- Invite code generation uniqueness
- Level calculation edge cases

### Integration Tests:
- OAuth flow end-to-end
- Credentials sign-in flow
- Invite code redemption workflow
- XP award on upload

### E2E Tests:
- Admin whitelists email → User signs in → Uploads file → XP awarded
- Admin generates invite → User redeems → Signs in → Uploads file
- Non-whitelisted user blocked from upload API

### Security Tests:
- Attempt admin panel access without auth
- Attempt upload without auth
- Attempt to reuse claimed invite code
- SQL injection on whitelist input

---

## Traceability Matrix

| Requirement | Implementation | Test | Documentation |
|-------------|----------------|------|---------------|
| US-001 | `/src/app/api/auth/[...nextauth]/route.ts` | `auth.test.ts` | `README.md` |
| US-004 | `/src/app/admin/whitelist/page.tsx` | `admin.e2e.test.ts` | `admin-guide.md` |
| US-006 | `/src/app/api/admin/invites/generate/route.ts` | `invites.test.ts` | `invite-workflow.md` |
| US-011 | XP award in `/src/app/api/upload/route.ts` | `xp.test.ts` | `xp-system.md` |
| US-014 | Search filter in `/src/app/page.tsx` | `search.e2e.test.ts` | `search-guide.md` |

---

## Approval

**Requirements Approved By**: chronode  
**Date**: 2025-10-21  
**Status**: READY FOR IMPLEMENTATION

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-10-21 | Initial requirements document created | chronode |
