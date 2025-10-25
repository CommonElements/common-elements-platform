import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@repo/database/server'
import { getUserProfile } from '@repo/database'
import { CommunityMemberDashboard } from './community-member-dashboard'
import { VendorDashboard } from './vendor-dashboard'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile to determine account type
  const userProfile = await getUserProfile(user.id)

  if (!userProfile) {
    redirect('/onboarding')
  }

  // Render appropriate dashboard based on account type
  if (userProfile.account_type === 'community_member') {
    return <CommunityMemberDashboard userId={user.id} userProfile={userProfile} />
  } else if (userProfile.account_type === 'vendor') {
    return <VendorDashboard userId={user.id} userProfile={userProfile} />
  }

  // Fallback - should not reach here
  redirect('/onboarding')
}
