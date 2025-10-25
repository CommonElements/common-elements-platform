import { createServerSupabaseClient } from '@repo/database'
import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

/**
 * Require authentication for a route
 * Redirects to login if user is not authenticated
 * Returns the authenticated user
 */
export async function requireAuth(): Promise<User> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return user
}

/**
 * Get the current user's profile with account type
 * Returns null if user is not authenticated or profile doesn't exist
 */
export async function getUserProfile() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch user record with account type
  const { data: userRecord } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!userRecord) {
    return null
  }

  // Fetch profile based on account type
  if (userRecord.account_type === 'community_member') {
    const { data: profile } = await supabase
      .from('community_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return {
      ...userRecord,
      profile,
    }
  } else if (userRecord.account_type === 'vendor') {
    const { data: profile } = await supabase
      .from('vendor_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return {
      ...userRecord,
      profile,
    }
  }

  return userRecord
}

/**
 * Check if the current user has completed onboarding
 * Returns true if profile exists, false otherwise
 */
export async function hasCompletedOnboarding(): Promise<boolean> {
  const profile = await getUserProfile()
  return profile?.profile !== null && profile?.profile !== undefined
}

/**
 * Require that the user has completed onboarding
 * Redirects to onboarding if profile is incomplete
 */
export async function requireOnboarding() {
  const completed = await hasCompletedOnboarding()
  if (!completed) {
    redirect('/onboarding')
  }
}
