# ADR-006: Authentication Strategy (NextAuth.js + Hybrid OAuth/Credentials)

**Date**: 2025-10-21  
**Status**: ACCEPTED  
**Deciders**: chronode  
**Context**: Post-MVP evolution requiring spam prevention and user attribution

---

## Context and Problem Statement

Zero Noise initially launched with anonymous, open access (no authentication). This created two problems:
1. **Spam risk**: Anyone can upload files to shared Filebase storage
2. **Attribution gap**: Cannot track who uploaded what for audit/credit purposes

We need authentication that:
- Prevents spam via whitelist
- Tracks uploader identity
- Maintains "zero noise" UX (quick sign-in)
- Enables friend group collaboration

**Key Question**: Which authentication approach balances security, UX, and implementation complexity?

---

## Decision Drivers

1. **Speed of implementation** (solo developer, part-time, want feature in 1-2 weeks)
2. **UX simplicity** (one-click Google sign-in preferred over password management)
3. **Whitelist enforcement** (only approved users can upload)
4. **Flexibility** (support both OAuth and email/password)
5. **Zero noise principle** (minimal UI friction)

---

## Considered Options

### Option 1: NextAuth.js (Hybrid: OAuth + Credentials)
**Pros**:
- ✅ Battle-tested library with Next.js 14 App Router support
- ✅ Supports multiple providers (Google OAuth + email/password)
- ✅ Built-in session management with JWT or database sessions
- ✅ Prisma adapter for seamless database integration
- ✅ Middleware support for route protection
- ✅ Active community and documentation

**Cons**:
- ❌ V5 (beta) has breaking changes from V4
- ❌ Learning curve for callbacks and adapters
- ❌ Slightly heavier bundle size (~50KB)

---

### Option 2: Custom JWT Auth (DIY)
**Pros**:
- ✅ Full control over auth flow
- ✅ Minimal dependencies
- ✅ Lightweight

**Cons**:
- ❌ Must implement OAuth flow manually (redirect, token exchange, PKCE)
- ❌ Session management complexity (refresh tokens, expiry)
- ❌ Security risks (CSRF, XSS, token leakage) if not done correctly
- ❌ 2-3 weeks development time (too slow for solo developer)

---

### Option 3: Clerk / Auth0 (Third-Party SaaS)
**Pros**:
- ✅ Drop-in solution with beautiful UI
- ✅ Built-in user management dashboard
- ✅ Advanced features (MFA, social logins, passwordless)

**Cons**:
- ❌ Monthly cost ($25-50+) at scale
- ❌ Vendor lock-in
- ❌ Less control over whitelist logic
- ❌ Conflicts with "decentralized" ethos of Zero Noise

---

### Option 4: Supabase Auth
**Pros**:
- ✅ Open-source, self-hostable
- ✅ Built-in OAuth providers
- ✅ PostgreSQL integration

**Cons**:
- ❌ Adds another dependency (Supabase client)
- ❌ Less Next.js-native than NextAuth
- ❌ Overkill for simple whitelist model

---

## Decision Outcome

**Chosen option: Option 1 (NextAuth.js with Hybrid OAuth + Credentials)**

### Rationale:
1. **Best balance** of speed, flexibility, and security
2. **Next.js native** - built specifically for App Router use case
3. **Prisma adapter** - seamless integration with existing database
4. **Hybrid auth** - supports Google OAuth (fast UX) + email/password (fallback)
5. **Whitelist enforcement** - custom callbacks allow pre-sign-in checks
6. **Community support** - widely adopted, active GitHub, good docs

### Implementation Plan:
```typescript
// /src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"

export const { handlers, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      // Email/password fallback for non-Google users
    })
  ],
  callbacks: {
    async signIn({ user }) {
      // Whitelist enforcement
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email! }
      })
      return dbUser?.isWhitelisted ?? false
    }
  }
})
```

---

## Consequences

### Positive:
- ✅ **Fast implementation** (~2-3 days for auth setup)
- ✅ **Familiar DX** for Next.js developers
- ✅ **Secure defaults** (CSRF tokens, secure cookies, HTTPS-only)
- ✅ **Extensible** - easy to add more OAuth providers (GitHub, Twitter) later

### Negative:
- ⚠️ **Beta dependency** - NextAuth v5 still in beta (stable release expected Q4 2024)
- ⚠️ **Bundle size** - adds ~50KB to client bundle (acceptable for auth features)
- ⚠️ **OAuth provider dependency** - if Google OAuth down, users need credentials fallback

### Neutral:
- 🔄 **Middleware complexity** - requires understanding NextAuth middleware patterns
- 🔄 **Session storage choice** - JWT (stateless) vs. database sessions (stateful)

---

## Whitelist Enforcement Strategy

### Approach:
1. **Invite-first model**: Users must be pre-whitelisted (admin panel) or redeem invite code
2. **Sign-in callback check**: Before allowing OAuth/credentials sign-in, verify `isWhitelisted` flag
3. **Upload API middleware**: Reject requests without valid session

### Database Schema:
```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  isWhitelisted Boolean  @default(false)
  isAdmin       Boolean  @default(false)
  // ... other fields
}
```

### Enforcement Points:
- **Sign-in page**: Redirect non-whitelisted users to `/auth/access-denied`
- **Upload API**: `auth()` middleware returns 401 if no session
- **Admin panel**: Only `isAdmin = true` users access `/admin/*`

---

## Alternative Whitelist Approaches (Rejected)

### Rejected: IP Whitelist
- ❌ Users on dynamic IPs (home internet, mobile) would be blocked
- ❌ Shared networks (office, coffee shop) expose whitelist

### Rejected: Domain-Based (@example.com)
- ❌ Too coarse-grained (entire domain vs. specific users)
- ❌ Doesn't work for personal emails (Gmail, Yahoo)

### Rejected: Time-Limited Tokens (No Accounts)
- ❌ Cannot track attribution without persistent user IDs
- ❌ Token management complexity (generation, expiry, rotation)

---

## Security Considerations

### Threats Mitigated:
- ✅ **Spam uploads**: Only whitelisted users can POST to `/api/upload`
- ✅ **Session hijacking**: Secure cookies, HTTP-only, SameSite=Lax
- ✅ **CSRF attacks**: NextAuth includes CSRF tokens automatically
- ✅ **OAuth token leakage**: Tokens encrypted at rest via Prisma adapter

### Remaining Risks:
- ⚠️ **Social engineering**: Attacker tricks admin into whitelisting malicious email
  - **Mitigation**: Admin verification process, revoke access quickly
- ⚠️ **Invite code leakage**: Codes shared publicly (Twitter, forum)
  - **Mitigation**: Short expiry (7-30 days), one-time use, admin monitoring
- ⚠️ **XSS via XP system**: Malicious filenames could inject scripts
  - **Mitigation**: Sanitize all user input, React auto-escapes JSX

---

## Performance Impact

### Expected Latency:
- **Sign-in page load**: <2s (including OAuth provider redirect)
- **Upload API auth check**: <50ms (session validation via JWT or cached DB lookup)
- **Admin panel load**: <1s (query whitelisted users + invite codes)

### Optimization Strategy:
- **JWT sessions** (stateless) for read-heavy operations (upload API)
- **Database sessions** for admin panel (need fresh whitelist data)
- **Redis caching** (future) for session lookups if latency increases

---

## Rollback Plan

If NextAuth.js causes issues (bugs, performance, breaking changes):

1. **Immediate**: Feature flag to disable auth enforcement (allow anonymous uploads temporarily)
2. **Short-term** (1 week): Implement basic JWT auth with Google OAuth only
3. **Long-term** (2 weeks): Migrate to Supabase Auth or custom solution

### Feature Flag:
```typescript
// .env.local
AUTH_ENABLED=true

// /src/middleware.ts
if (process.env.AUTH_ENABLED !== "true") {
  return NextResponse.next() // Skip auth check
}
```

---

## Open Questions

1. **Session duration**: 30 days default, or shorter (7 days) for security?
   - **Decision**: 30 days (friend group use case, low risk)

2. **Password reset flow**: Email-based reset or admin-only password change?
   - **Decision**: Deferred to P1 (low priority, admin can whitelist new email if needed)

3. **Multi-device sign-in**: Allow concurrent sessions or force single session?
   - **Decision**: Allow concurrent (no UX friction)

4. **OAuth scope**: Minimal (email only) or extended (profile, avatar)?
   - **Decision**: Email + name + avatar (for XP badge display)

---

## Related ADRs

- ADR-001: Next.js 14 Framework Choice
- ADR-002: Multi-Provider IPFS Pinning
- ADR-005: Database Choice (PostgreSQL + Prisma)

---

## References

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [NextAuth v5 Migration Guide](https://authjs.dev/guides/upgrade-to-v5)
- [Prisma Adapter for NextAuth](https://authjs.dev/reference/adapter/prisma)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)

---

## Approval

**Approved By**: chronode  
**Date**: 2025-10-21  
**Status**: ACCEPTED - Proceed with NextAuth.js implementation
