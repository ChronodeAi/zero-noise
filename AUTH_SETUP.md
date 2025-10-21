# Authentication Setup Guide - Magic Links

✅ **Phase 3 Complete** - Magic link authentication configured!

## What Changed

- ❌ **Removed**: Google OAuth (no Google Cloud Console needed!)
- ✅ **Added**: Email magic links (passwordless authentication)
- ✅ **Added**: Admin bootstrap script

## Quick Start

### 1. Create Your Admin Account

```bash
npx tsx scripts/create-admin.ts your@email.com
```

This creates/whitelists your admin user in the database.

### 2. Configure Email Sending

Choose one option in `.env`:

#### Option A: Resend (Recommended - Free, No Credit Card)
1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Update `.env`:
   ```bash
   EMAIL_SERVER_PASSWORD="re_..."  # Your Resend API key
   EMAIL_FROM="Zero Noise <noreply@yourdomain.com>"
   ```

#### Option B: Gmail SMTP (Quick for Personal Use)
1. Enable 2FA on your Gmail
2. Generate App Password: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Update `.env`:
   ```bash
   EMAIL_SERVER_HOST="smtp.gmail.com"
   EMAIL_SERVER_PORT="587"
   EMAIL_SERVER_USER="your_gmail@gmail.com"
   EMAIL_SERVER_PASSWORD="xxxx xxxx xxxx xxxx"  # App Password
   EMAIL_FROM="Zero Noise <your_gmail@gmail.com>"
   ```

#### Option C: Local Testing (Console Only)
For development without sending real emails:
```bash
# Install maildev for local SMTP server
npm install -g maildev
maildev

# Update .env
EMAIL_SERVER_HOST="localhost"
EMAIL_SERVER_PORT="1025"
```

### 3. Start the App

```bash
npm run dev
```

Visit: http://localhost:3000/auth/signin

## How It Works

1. **User enters email** → Magic link sent
2. **User clicks link** → Redirected to app
3. **Whitelist check** → Only whitelisted emails can sign in
4. **Session created** → User signed in for 30 days

## Whitelisting Users

### As Admin
You'll create an admin panel UI to whitelist emails (Phase 6).

### For Now (Manual)
```bash
npx tsx scripts/create-admin.ts friend@example.com
```

Or via Prisma Studio:
```bash
npx prisma studio
```

## Testing

1. Create your admin account:
   ```bash
   npx tsx scripts/create-admin.ts chronode@example.com
   ```

2. Configure email (Resend or Gmail)

3. Visit http://localhost:3000/auth/signin

4. Enter your email

5. Check your inbox for magic link

6. Click link → You're signed in!

## Next Steps

- ✅ Phase 3 complete
- ⏳ Phase 4: Add middleware to protect upload routes
- ⏳ Phase 5: Invite code system
- ⏳ Phase 6: Admin panel UI
- ⏳ Phase 7: XP system

## Troubleshooting

**"Email not sent"**
- Check `.env` email configuration
- For Gmail: Make sure you use App Password, not regular password
- For Resend: Verify API key is correct

**"Access Denied" on sign-in**
- Run: `npx tsx scripts/create-admin.ts your@email.com`
- Verify user is whitelisted in database

**Magic link expired**
- Links expire in 24 hours
- Request a new one from sign-in page

## Database Schema

```prisma
model User {
  email         String  @unique
  isWhitelisted Boolean @default(false)  // Must be true to sign in
  isAdmin       Boolean @default(false)  // Can access /admin routes
  xp            Int     @default(0)      // Gamification points
  provider      String  @default("email") // "email" for magic links
}
```

## Files Created

- ✅ `/src/app/api/auth/[...nextauth]/route.ts` - NextAuth config
- ✅ `/src/app/auth/signin/page.tsx` - Sign-in page
- ✅ `/src/app/auth/error/page.tsx` - Error page
- ✅ `/src/types/next-auth.d.ts` - TypeScript types
- ✅ `/scripts/create-admin.ts` - Bootstrap script
- ✅ `.env` - Environment variables (update with your email config)

## Security Notes

- Magic links expire in 24 hours
- Sessions last 30 days (configurable)
- Only whitelisted emails can sign in
- Email must be verified (user clicks link)
- No passwords to manage or leak
