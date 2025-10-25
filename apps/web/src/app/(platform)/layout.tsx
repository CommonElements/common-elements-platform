import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@repo/database/server'
import { getUnreadMessageCount, getUserProfile } from '@repo/database'
import { PlatformNav } from './components/platform-nav'

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const userProfile = await getUserProfile(user.id)

  if (!userProfile) {
    redirect('/onboarding')
  }

  // Get unread message count
  const unreadCount = await getUnreadMessageCount(user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>
      <PlatformNav userProfile={userProfile} unreadCount={unreadCount} />
      <main id="main-content" role="main">{children}</main>
    </div>
  )
}
