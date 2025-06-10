import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Public paths that don't require authentication
  const publicPaths = ['/', '/login', '/register', '/terms', '/privacy']
  const isPublicPath = publicPaths.some((publicPath) => path === publicPath)

  // Skip middleware for API routes and static files
  if (path.startsWith('/api/') || path.startsWith('/_next/') || path.includes('.')) {
    return NextResponse.next()
  }

  try {
    // Only validate session if we have cookies
    const cookies = request.headers.get('cookie')
    if (!cookies || !cookies.includes('auth_token')) {
      // No auth token, user is not authenticated
      if (!isPublicPath) {
        const loginUrl = new URL('/login', request.url)
        // Only add 'from' parameter if it's not the home page
        if (path !== '/') {
          loginUrl.searchParams.set('from', path)
        }
        return NextResponse.redirect(loginUrl)
      }
      return NextResponse.next()
    }

    // Validate session by calling your API
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/validate`, {
      headers: {
        Cookie: cookies,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    const isAuthenticated = res.ok

    // Redirect authenticated users away from auth pages
    if (isAuthenticated && (path === '/login' || path === '/register')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }    // Redirect unauthenticated users to login page with the intended destination
    if (!isAuthenticated && !isPublicPath) {
      // Clear any stale auth cookies
      const loginUrl = new URL('/login', request.url)
      // Only add 'from' parameter if it's not the home page
      if (path !== '/') {
        loginUrl.searchParams.set('from', path)
      }
      const response = NextResponse.redirect(loginUrl)
      response.cookies.set('auth_token', '', {
        expires: new Date(0),
        path: '/',
      })
      return response
    }

    return NextResponse.next()  } catch (error) {
    console.error('Middleware validation error:', error)
    
    // If validation fails, assume user is not authenticated
    if (!isPublicPath) {
      const loginUrl = new URL('/login', request.url)
      if (path !== '/') {
        loginUrl.searchParams.set('from', path)
      }
      const response = NextResponse.redirect(loginUrl)
      // Clear any stale auth cookies
      response.cookies.set('auth_token', '', {
        expires: new Date(0),
        path: '/',
      })
      return response
    }

    return NextResponse.next()
  }
}

export const config = {
  // Matcher ignoring api routes, static files, and images
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}