import { createServerSupabaseClient } from '@repo/database'
import type { User } from '@supabase/supabase-js'

/**
 * Get the current authenticated user from the session
 * Returns null if no user is authenticated
 */
export async function getSession() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

/**
 * Get the current authenticated user
 * Returns null if no user is authenticated
 */
export async function getUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
}
