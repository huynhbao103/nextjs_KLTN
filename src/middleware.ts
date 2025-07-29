import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true',
      },
    })
  }

  // Get the pathname of the request (e.g. /, /protected)
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const publicPaths = ['/login', '/register', '/api/auth', '/api/geocode', '/api/weather', '/api/health', '/api/debug', '/api/test']
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(publicPath => 
    path.startsWith(publicPath)
  )

  // If the path is public, allow access
  if (isPublicPath) {
    return NextResponse.next()
  }

  // For protected routes, let the page handle authentication
  // This avoids Edge Runtime issues with MongoDB
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 