export const runtime = 'nodejs'

import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth')
  const isWhitelisted = req.auth?.user?.isWhitelisted ?? false
  const isClaimPage = req.nextUrl.pathname === '/auth/claim'
  const isVerifyClaimPage = req.nextUrl.pathname === '/auth/verify-claim'

  // Not logged in - redirect to sign in (except claim pages)
  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }

  // Logged in but not whitelisted - allow auth pages (signin, claim, error, verify-claim)
  if (isLoggedIn && !isWhitelisted && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth/error?error=NotWhitelisted', req.url))
  }

  // Logged in and whitelisted - don't allow most auth pages
  if (isLoggedIn && isWhitelisted && isAuthPage && !req.nextUrl.pathname.startsWith('/auth/error')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
