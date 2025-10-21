export const runtime = 'nodejs'

import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth')
  const isWhitelisted = req.auth?.user?.isWhitelisted ?? false

  // Not logged in - redirect to sign in
  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }

  // Logged in but not whitelisted - show error
  if (isLoggedIn && !isWhitelisted && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth/error?error=AccessDenied', req.url))
  }

  // Logged in and whitelisted - don't allow auth pages
  if (isLoggedIn && isWhitelisted && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
