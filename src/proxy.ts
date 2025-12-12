"use server";

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''
  
  const authToken = request.cookies.get('admin_auth_token')?.value
  
  const isAdminSubdomain = hostname.startsWith('admin.')
  
  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginRoute = pathname === '/login'
  
  if (isAdminSubdomain) {
    if (pathname === '/') {
      if (authToken) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    if (isAdminRoute && !authToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    if (isLoginRoute && authToken) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }
  
  if (!isAdminSubdomain && isAdminRoute) {
    const adminUrl = new URL(request.url)
    
    let baseHostname = hostname
    if (hostname.startsWith('www.')) {
      baseHostname = hostname.replace('www.', '')
    }
    
    adminUrl.hostname = `admin.${baseHostname}`
    adminUrl.pathname = pathname.replace('/admin', '/admin')
    return NextResponse.redirect(adminUrl)
  }
  
  if (isAdminRoute && !authToken && !isLoginRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
}

