import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

/**
 * Create a Supabase client for use in browser/client components
 * This client uses cookies for session management
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
