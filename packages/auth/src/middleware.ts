import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Auth middleware for Next.js
 * Handles session refresh and route protection
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
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
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes that require authentication
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/forum') ||
    request.nextUrl.pathname.startsWith('/rfps') ||
    request.nextUrl.pathname.startsWith('/profile')

  // Auth routes that should redirect if already logged in
  const isAuthRoute =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/signup')

  // Onboarding route
  const isOnboardingRoute = request.nextUrl.pathname.startsWith('/onboarding')

  if (isProtectedRoute && !user) {
    // Redirect to login if accessing protected route without auth
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && user) {
    // Redirect to dashboard if already logged in
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Check if user needs to complete onboarding
  if (user && !isOnboardingRoute && !isAuthRoute) {
    // Fetch user record to check account type and profile
    const { data: userRecord } = await supabase
      .from('users')
      .select('account_type')
      .eq('id', user.id)
      .single()

    if (userRecord) {
      // Check if profile exists based on account type
      let hasProfile = false

      if (userRecord.account_type === 'community_member') {
        const { data: profile } = await supabase
          .from('community_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single()
        hasProfile = !!profile
      } else if (userRecord.account_type === 'vendor') {
        const { data: profile } = await supabase
          .from('vendor_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single()
        hasProfile = !!profile
      }

      // Redirect to onboarding if profile is incomplete
      if (!hasProfile) {
        const url = request.nextUrl.clone()
        url.pathname = '/onboarding'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
