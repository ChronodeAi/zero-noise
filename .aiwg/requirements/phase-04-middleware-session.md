# Phase 4: Middleware Protection & Session Management

**Status**: In Progress  
**Priority**: High  
**Dependencies**: Phase 3 (NextAuth setup)  
**Estimated Duration**: 2-3 hours

## Context & Problem

With authentication implemented, we need to:
1. Protect routes that require authentication
2. Display user session information throughout the app
3. Provide a consistent user navigation experience
4. Enable sign-out functionality

Currently, authenticated users can access the homepage, but there's no visual indication of their session state, and routes are not protected.

## Requirements

### Functional Requirements

**FR-4.1: Route Protection**
- All routes except `/auth/*` require authentication
- Unauthenticated users redirect to `/auth/signin`
- Preserve intended destination in callback URL

**FR-4.2: Session Management**
- Display current user's email in navigation
- Show user's XP score in navigation
- Provide sign-out button
- Session persists across page refreshes

**FR-4.3: Navigation UI**
- Header visible on all authenticated pages
- User menu shows:
  - Email address
  - XP score
  - "Sign out" button
- Responsive design (mobile-friendly)

### Non-Functional Requirements

**NFR-4.1: Performance**
- Session check adds <50ms to page load
- Middleware evaluation is efficient

**NFR-4.2: Security**
- Session tokens stored securely (httpOnly cookies)
- Protected routes cannot be bypassed
- Sign-out clears all session data

**NFR-4.3: UX**
- Loading states during session checks
- Smooth redirects (no flash of unauthenticated content)
- Clear feedback when signing out

## Technical Design

### Middleware Implementation

```typescript
// src/middleware.ts
export { auth as middleware } from "@/auth"

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|auth).*)"],
}
```

### Session Provider

Wrap app with `SessionProvider` in root layout to enable `useSession()` hook.

### Navigation Component

Create `src/components/navigation.tsx` with:
- User email display
- XP badge
- Sign-out button
- Responsive hamburger menu for mobile

## Acceptance Criteria

- [ ] Unauthenticated users cannot access homepage
- [ ] Sign-in redirects back to intended page
- [ ] User email displays in navigation after sign-in
- [ ] XP score visible in navigation
- [ ] Sign-out button works and redirects to sign-in
- [ ] No flash of protected content before redirect
- [ ] Navigation responsive on mobile

## Testing Strategy

### Manual Testing
1. Sign out and attempt to access homepage → should redirect
2. Sign in and verify session persists after refresh
3. Check navigation shows correct user info
4. Test sign-out clears session
5. Verify mobile responsive layout

### Edge Cases
- Expired session handling
- Multiple tabs/windows
- Sign-out from one tab affects others
- Network errors during session check

## Open Questions

- Should admins see a special badge/indicator?
- Add profile page link to navigation?
- Show level/title (e.g., "Researcher") in addition to XP?

## Related Documents

- [ADR-006: Authentication Strategy](../architecture/adr-006-authentication-strategy.md)
- [Feature: Authentication & Gamification](./feature-auth-gamification.md)
