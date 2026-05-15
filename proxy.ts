import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { CONFIG } from './lib/config'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isMaintenanceMode = CONFIG.IS_MAINTENANCE_MODE

  // 1. Maintenance Mode Logic (Highest Priority)
  if (
    isMaintenanceMode &&
    !pathname.startsWith('/maintenance') &&
    !pathname.startsWith('/_next') &&
    !pathname.startsWith('/api') &&
    !pathname.includes('.')
  ) {
    return NextResponse.redirect(new URL('/maintenance', request.url))
  }

  if (!isMaintenanceMode && pathname.startsWith('/maintenance')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 2. Supabase Auth Logic
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes: everything except login, signup, and api
  if (!user && 
      !pathname.startsWith('/login') && 
      !pathname.startsWith('/signup') && 
      !pathname.startsWith('/auth') &&
      pathname !== '/favicon.ico' &&
      pathname !== '/maintenance') { // Allow maintenance page for unauthenticated users if needed
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // If user is already logged in and tries to access login/signup, redirect to home
  if (user && (pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - svg, png, jpg, jpeg, gif, webp (images)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
