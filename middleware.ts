import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  
  // Check if user is trying to access admin routes
  const isAdminRoute = request.nextUrl.pathname.startsWith('/dashboard') || 
                      request.nextUrl.pathname.startsWith('/users') ||
                      request.nextUrl.pathname.startsWith('/billing') ||
                      request.nextUrl.pathname.startsWith('/settings')
  
  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If trying to access admin routes but not an admin
  if (isAdminRoute && token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }
  
  return NextResponse.next()
}

// Specify which routes should be protected
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/users/:path*',
    '/settings/:path*',
    '/billing/:path*',
  ]
} 