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

  // Logged in but not whitelisted - allow only /auth/error for claiming invite
  if (isLoggedIn && !isWhitelisted && !req.nextUrl.pathname.startsWith('/auth/error')) {
    return NextResponse.redirect(new URL('/auth/error?error=NotWhitelisted', req.url))
  }

  // Logged in and whitelisted - don't allow auth pages except error
  if (isLoggedIn && isWhitelisted && isAuthPage && !req.nextUrl.pathname.startsWith('/auth/error')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
