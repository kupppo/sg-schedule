import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  const { nextUrl } = request
  const { pathname, hostname } = nextUrl
  const isChoozo = hostname === 'choozo-schedule.vercel.app'
  const redirectBase = 'https://sg-schedule.vercel.app'
  if (isChoozo) {
    const redirectPath = (pathname === '/') ? '/choozo' : pathname
    const redirectURL = new URL(redirectPath, redirectBase)
    return NextResponse.redirect(redirectURL)
  }
  return NextResponse.next()
}
 
export const config = {
  matcher: '/:path*'
}
