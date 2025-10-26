import { notFound } from 'next/navigation'
import { getUserProfile, getUserPosts, getUserComments } from '@repo/database'
import { createServerSupabaseClient } from '@repo/database/server'
import { UserBadge } from '@repo/ui'
import { MapPin, Briefcase, Calendar, FileText, MessageSquare } from 'lucide-react'
import Link from 'next/link'

interface ProfilePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params

  // Get current user
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch user profile
  const userProfile = await getUserProfile(id)

  if (!userProfile) {
    notFound()
  }

  // Fetch user's recent posts and comments
  const [posts, comments] = await Promise.all([
    getUserPosts(id, 5),
    getUserComments(id, 5),
  ])

  // Prepare user badge data
  const getUserBadgeData = () => {
    if (userProfile.account_type === 'community_member' && userProfile.community_profile) {
      const profile = userProfile.community_profile
      return {
        id: userProfile.id,
        name: userProfile.full_name,
        role: profile.role.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        location: profile.property_location,
        avatarUrl: userProfile.avatar_url || undefined,
      }
    } else if (userProfile.account_type === 'vendor' && userProfile.vendor_profile) {
      const profile = userProfile.vendor_profile
      return {
        id: userProfile.id,
        name: userProfile.full_name,
        company: profile.company_name,
        location: profile.service_areas[0] || 'Multiple Areas',
        avatarUrl: userProfile.avatar_url || undefined,
      }
    }
    return {
      id: userProfile.id,
      name: userProfile.full_name,
      avatarUrl: userProfile.avatar_url || undefined,
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
  }

  // Check if viewing own profile
  const isOwnProfile = user?.id === id

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <UserBadge user={getUserBadgeData()} size="lg" showLocation={true} />
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Joined {formatDate(userProfile.created_at)}</span>
            </div>
            
            {isOwnProfile && (
              <Link
                href="/profile/edit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Edit Profile
              </Link>
            )}
          </div>
        </div>

        {/* Community Member Details */}
        {userProfile.account_type === 'community_member' && userProfile.community_profile && (
          <div className="space-y-4 mt-6 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Community Member Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Role</div>
                  <div className="text-base text-gray-900">
                    {userProfile.community_profile.role
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </div>
                </div>
              </div>

              {!userProfile.community_profile.hide_property_name && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">Property</div>
                    <div className="text-base text-gray-900">
                      {userProfile.community_profile.property_name}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Location</div>
                  <div className="text-base text-gray-900">
                    {userProfile.community_profile.property_location}
                  </div>
                </div>
              </div>

              {userProfile.community_profile.license_type && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">License</div>
                    <div className="text-base text-gray-900">
                      {userProfile.community_profile.license_type}
                      {userProfile.community_profile.license_number &&
                        ` - ${userProfile.community_profile.license_number}`}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vendor Details */}
        {userProfile.account_type === 'vendor' && userProfile.vendor_profile && (
          <div className="space-y-4 mt-6 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Vendor Details</h2>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Company</div>
                  <div className="text-base text-gray-900">
                    {userProfile.vendor_profile.company_name}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Services</div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {userProfile.vendor_profile.service_categories.map((category) => (
                      <span
                        key={category}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Service Areas</div>
                  <div className="text-base text-gray-900">
                    {userProfile.vendor_profile.service_areas.join(', ')}
                  </div>
                </div>
              </div>

              {userProfile.vendor_profile.business_description && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">About</div>
                    <div className="text-base text-gray-900 mt-1">
                      {userProfile.vendor_profile.business_description}
                    </div>
                  </div>
                </div>
              )}

              {userProfile.vendor_profile.years_in_business && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">Experience</div>
                    <div className="text-base text-gray-900">
                      {userProfile.vendor_profile.years_in_business} years in business
                    </div>
                  </div>
                </div>
              )}

              {userProfile.vendor_profile.license_info && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">License Information</div>
                    <div className="text-base text-gray-900">
                      {userProfile.vendor_profile.license_info}
                    </div>
                  </div>
                </div>
              )}

              {userProfile.vendor_profile.insurance_info && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">Insurance Information</div>
                    <div className="text-base text-gray-900">
                      {userProfile.vendor_profile.insurance_info}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Posts
          </h2>
          
          {posts.length === 0 ? (
            <p className="text-gray-500 text-sm">No posts yet</p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/forum/${post.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-medium text-gray-900 line-clamp-2">{post.title}</h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(post.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100">
                      {post.category.name}
                    </span>
                    <span>{post.vote_count} votes</span>
                    <span>{post.comment_count} comments</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Comments */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Comments
          </h2>
          
          {comments.length === 0 ? (
            <p className="text-gray-500 text-sm">No comments yet</p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <Link
                  key={comment.id}
                  href={`/forum/${comment.post.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm text-gray-700 line-clamp-2">{comment.content}</p>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(comment.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>on: {comment.post.title}</span>
                    <span>{comment.vote_count} votes</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
