import { createServerSupabaseClient } from '@repo/database/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createServerSupabaseClient()
  
  await supabase.auth.signOut()
  
  return NextResponse.json({ success: true })
}
