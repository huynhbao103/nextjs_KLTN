'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Define public paths that don't require authentication
    const publicPaths = ['/login', '/register', '/forgot-password', '/verify-otp', '/reset-password', '/api/auth', '/api/geocode', '/api/weather', '/api/health', '/api/debug']
    
    const isPublicPath = publicPaths.some(publicPath => 
      pathname.startsWith(publicPath)
    )

    // If loading, don't do anything yet
    if (status === 'loading') return

    // If user is not authenticated and trying to access protected route, redirect to login
    if (!session?.user && !isPublicPath) {
      router.push('/login')
      return
    }

    // If user is authenticated and trying to access login/register, redirect based on role
    if (session?.user && (pathname === '/login' || pathname === '/register')) {
      if (session.user.role === 'admin') {
        router.push('/admin/manage')
      } else {
        router.push('/profile')
      }
      return
    }

    // If admin user is authenticated, redirect to admin panel for any non-admin path
    if (session?.user?.role === 'admin') {
      const adminPaths = ['/admin']
      const isAdminPath = adminPaths.some(adminPath => pathname.startsWith(adminPath))
      
      if (!isAdminPath) {
        router.push('/admin/manage')
        return
      }
    }
  }, [session, status, pathname, router])

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-primary"></div>
      </div>
    )
  }

  return <>{children}</>
} 