# Phase 6: Admin Panel UI - User Management & Upload Filtering

**Status**: In Progress  
**Priority**: High  
**Dependencies**: Phase 5 (Invite System)  
**Estimated Duration**: 2-3 hours

## Context & Problem

Admins need visibility into registered users and ability to manage whitelist status. Users need ability to filter uploads to see only their contributions.

Currently:
- No way for admins to see list of users
- No manual whitelist management
- Users can't filter uploads to show only theirs

## Requirements

### Functional Requirements

**FR-6.1: Admin User List**
- View all registered users in admin panel
- Display for each user:
  - Email address
  - XP score
  - Whitelist status
  - Admin status
  - Last login timestamp
  - Created date
- Sort by registration date (newest first)

**FR-6.2: Manual Whitelist Management**
- Admins can toggle whitelist status for any user
- Changes take effect immediately
- Non-whitelisted users cannot sign in

**FR-6.3: Upload Attribution**
- Track which user uploaded each file/link
- Store user ID in `uploadedBy` field
- Associate uploads with user session

**FR-6.4: "My Uploads Only" Filter**
- Toggle on homepage to filter view
- When enabled:
  - Search shows only user's uploads
  - File list shows only user's files
  - Link list shows only user's links
- When disabled: shows all uploads (current behavior)

### Non-Functional Requirements

**NFR-6.1: Performance**
- User list loads in <500ms
- Whitelist toggle responds in <200ms
- Filter toggle is instant (client-side)

**NFR-6.2: Security**
- Only admins can access user management
- Users can only see their own uploads in filter
- No data leakage between users

**NFR-6.3: UX**
- Clear visual indicator when filter is active
- Whitelist toggle has loading state
- User list is paginated if >100 users

## Technical Design

### Admin User Management

**GET /api/admin/users**
- Auth: Admin only
- Response: List of all users with stats

**PATCH /api/admin/users/[id]**
- Auth: Admin only
- Body: `{ isWhitelisted: boolean }`
- Updates user whitelist status

### Upload Attribution

Update `/api/upload` to:
1. Get user ID from session
2. Set `uploadedBy` field when creating File/Link records

### My Uploads Filter

Client-side state:
- `showMyUploadsOnly` boolean
- Filter results by `uploadedBy === session.user.id`

## Acceptance Criteria

- [ ] Admin panel shows "Users" tab with user list
- [ ] User list displays email, XP, statuses, timestamps
- [ ] Admins can toggle whitelist status
- [ ] Homepage has "My Uploads" toggle
- [ ] Filter works for search results
- [ ] Filter works for file/link lists
- [ ] Upload attribution tracks who uploaded what
- [ ] Non-admin users cannot access user management

## Testing Strategy

### Manual Testing
1. As admin, view user list
2. Toggle whitelist for a user
3. Sign out and try to sign in as that user → should fail
4. Toggle whitelist back → user can sign in
5. As user, upload a file
6. Toggle "My uploads only" → should see file
7. Toggle off → should see all uploads

### Edge Cases
- User with no uploads (empty state)
- Admin viewing their own profile
- Multiple uploads by same user
- Filter with search query

## Related Documents

- [Phase 5: Invite System](./phase-05-invite-system.md)
- [ADR-006: Authentication Strategy](../architecture/adr-006-authentication-strategy.md)
- [Feature: Authentication & Gamification](./feature-auth-gamification.md)
