import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@repo/database/server'
import { getUserProfile } from '@repo/database'
import { CommunityMemberEditForm } from './community-member-edit-form'
import { VendorEditForm } from './vendor-edit-form'
import { AvatarUpload } from './avatar-upload'

export default async function EditProfilePage() {
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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
        <p className="mt-2 text-sm text-gray-600">
          Update your profile information. Your account type cannot be changed.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        {/* Avatar Upload Section */}
        <div className="pb-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
          <AvatarUpload
            userId={user.id}
            currentAvatarUrl={userProfile.avatar_url}
            userName={userProfile.full_name}
          />
        </div>

        {/* Account Type Display */}
        <div className="pb-6 border-b border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Type
          </label>
          <div className="inline-flex items-center px-3 py-2 rounded-md bg-gray-100 text-gray-700">
            {userProfile.account_type === 'community_member'
              ? 'Community Member'
              : 'Vendor'}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Account type cannot be changed after registration
          </p>
        </div>

        {/* Profile Information Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
          
          {/* Render appropriate form based on account type */}
          {userProfile.account_type === 'community_member' &&
            userProfile.community_profile && (
              <CommunityMemberEditForm
                userId={user.id}
                profile={userProfile.community_profile}
              />
            )}

          {userProfile.account_type === 'vendor' && userProfile.vendor_profile && (
            <VendorEditForm userId={user.id} profile={userProfile.vendor_profile} />
          )}
        </div>
      </div>
    </div>
  )
}
