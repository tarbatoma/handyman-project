import { NextResponse } from 'next/server'

export async function middleware(request) {
  // Verificăm dacă există cookie-ul de sesiune setat de actions/auth.js
  const sessionCookie = request.cookies.get('session')?.value

  const { pathname } = request.nextUrl

  // Rute protejate - necesită autentificare
  const protectedRoutes = ['/dashboard', '/onboarding']
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Rute auth - redirecționează spre dashboard dacă ești deja logat
  const authRoutes = ['/login', '/register', '/reset-password']
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  if (!sessionCookie && isProtected) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (sessionCookie && isAuthRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
