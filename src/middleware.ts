import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''
  
  // Obtener token de autenticación de las cookies
  const authToken = request.cookies.get('admin_auth_token')?.value
  
  // Verificar si estamos en el subdominio admin
  const isAdminSubdomain = hostname.startsWith('admin.')
  
  // Rutas que requieren autenticación
  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginRoute = pathname === '/login'
  
  // Si estamos en admin.uni-cel.com
  if (isAdminSubdomain) {
    // Si intenta acceder a la raíz del subdominio admin
    if (pathname === '/') {
      // Si está autenticado, ir al admin
      if (authToken) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      // Si no está autenticado, ir al login
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Si intenta acceder a una ruta de admin sin autenticación
    if (isAdminRoute && !authToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Si está autenticado e intenta ir al login, redirigir al admin
    if (isLoginRoute && authToken) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }
  
  // Si estamos en el dominio principal y intenta acceder a /admin
  if (!isAdminSubdomain && isAdminRoute) {
    // Redirigir al subdominio admin
    const adminUrl = new URL(request.url)
    adminUrl.hostname = `admin.${hostname}`
    adminUrl.pathname = pathname.replace('/admin', '/admin')
    return NextResponse.redirect(adminUrl)
  }
  
  // Proteger rutas de admin en cualquier dominio
  if (isAdminRoute && !authToken && !isLoginRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
}

