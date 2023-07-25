import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  const isChoozo = request.nextUrl.hostname === 'choozo-schedule.vercel.app'
  if (isChoozo) {
    const redirectBase = 'https://sg-schedule.vercel.app'
    return NextResponse.redirect(new URL('/choozo', redirectBase))
  }
  return NextResponse.next()
}
 
export const config = {
  matcher: '/',
}
