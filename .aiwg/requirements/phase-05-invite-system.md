# Phase 5: Invite Code System

**Status**: In Progress  
**Priority**: High  
**Dependencies**: Phase 4 (Authentication + Middleware)  
**Estimated Duration**: 3-4 hours

## Context & Problem

Currently, all users who sign in are auto-whitelisted in the database. We need a controlled onboarding system where:
1. Only admins can generate invite codes
2. New users must have a valid invite code to sign up
3. Codes expire after a set time period
4. Codes are single-use only
5. We track who invited whom

This enables invite-only access while maintaining the magic link authentication flow.

## Requirements

### Functional Requirements

**FR-5.1: Invite Code Generation**
- Admins can generate invite codes through admin UI
- Each code has:
  - Unique random string (e.g., `WELCOME-2024-XK7N`)
  - Expiration date (default: 7 days)
  - Created by (admin user ID)
  - Single-use flag
- Code format: readable, shareable (e.g., `WORD-YEAR-XXXX`)

**FR-5.2: Invite Code Validation**
- New users must provide invite code at sign-up
- System validates code before creating user:
  - Code exists in database
  - Code has not expired
  - Code has not been claimed
- Invalid code → clear error message

**FR-5.3: Invite Tracking**
- Track which user used which invite code
- Store invite code ID in User table
- Show invite history in admin panel
- Display "invited by" on user profiles

**FR-5.4: Sign-Up Flow Update**
- Add invite code field to sign-in page
- Check code validity before sending magic link
- Auto-whitelist user if code is valid
- Mark code as claimed after successful sign-up

### Non-Functional Requirements

**NFR-5.1: Security**
- Invite codes are case-insensitive
- Codes are not guessable (crypto-random generation)
- Only admins can generate codes
- Expired/claimed codes cannot be reused

**NFR-5.2: UX**
- Clear error messages for invalid codes
- Code validation happens before email send
- Admin UI shows code status at-a-glance
- Copy-to-clipboard for sharing codes

**NFR-5.3: Performance**
- Code validation adds <100ms to sign-up flow
- Database query for code lookup is indexed

## Technical Design

### Database Schema

Already exists in `prisma/schema.prisma`:

```prisma
model InviteCode {
  id         String    @id @default(uuid())
  code       String    @unique
  createdBy  String
  expiresAt  DateTime
  claimedBy  String?
  claimedAt  DateTime?
  createdAt  DateTime  @default(now())
  users      User[]
}

model User {
  // ... existing fields
  inviteCodeId  String?
  inviteCode    InviteCode?  @relation(fields: [inviteCodeId], references: [id])
}
```

### API Endpoints

**POST /api/admin/invites**
- Auth: Admin only
- Body: `{ expiresInDays?: number }`
- Response: `{ code: string, expiresAt: Date }`

**GET /api/invites/[code]**
- Auth: None (public check)
- Response: `{ valid: boolean, message?: string }`

### Code Generation

```typescript
function generateInviteCode(): string {
  const words = ['WELCOME', 'JOIN', 'INVITE', 'ACCESS', 'HELLO']
  const word = words[Math.floor(Math.random() * words.length)]
  const year = new Date().getFullYear()
  const random = crypto.randomBytes(2).toString('hex').toUpperCase()
  return `${word}-${year}-${random}`
}
```

### Sign-Up Flow Update

1. User enters email + invite code
2. Validate invite code
3. If valid → send magic link
4. On magic link click → create user + mark code as claimed

## Acceptance Criteria

- [ ] Admins can generate invite codes from admin UI
- [ ] Generated codes have 7-day expiry by default
- [ ] New users cannot sign up without valid invite code
- [ ] Invalid/expired codes show clear error messages
- [ ] Successfully used codes are marked as claimed
- [ ] Admin panel shows all invite codes with status
- [ ] Copy-to-clipboard works for sharing codes
- [ ] User.inviteCodeId tracks who invited whom

## Testing Strategy

### Manual Testing
1. Generate invite code as admin
2. Try signing up without code → should fail
3. Sign up with invalid code → should show error
4. Sign up with valid code → should succeed
5. Try reusing same code → should fail
6. Check admin panel shows code as "Claimed"

### Edge Cases
- Expired code usage
- Concurrent code usage (race condition)
- Case sensitivity (INVITE-2024 vs invite-2024)
- Code with whitespace
- Very old codes (cleanup policy?)

## Open Questions

- Should codes be deletable by admins?
- Max codes per admin (rate limiting)?
- Email notification when someone uses your code?
- Show invite tree/graph in admin panel?

## Related Documents

- [ADR-006: Authentication Strategy](../architecture/adr-006-authentication-strategy.md)
- [Feature: Authentication & Gamification](./feature-auth-gamification.md)
- [Phase 4: Middleware Protection](./phase-04-middleware-session.md)
