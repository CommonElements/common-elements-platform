import Link from 'next/link'
import {
  getRFPs,
  getPendingVendorApprovals,
  getUnreadMessagesByRFP,
  type UserProfile,
} from '@repo/database'
import { UserBadge } from '@repo/ui'
import { Plus, MessageSquare, FileText, Users } from 'lucide-react'

interface CommunityMemberDashboardProps {
  userId: string
  userProfile: UserProfile
}

export async function CommunityMemberDashboard({
  userId,
  userProfile,
}: CommunityMemberDashboardProps) {
  // Fetch active RFPs created by this user
  const allRFPs = await getRFPs({ limit: 100 })
  const myRFPs = allRFPs.filter(
    (rfp) => rfp.creator.user_id === userId && rfp.status === 'open'
  )

  // Fetch pending vendor approval requests
  const pendingApprovals = await getPendingVendorApprovals(userId)

  // Fetch unread messages
  const unreadMessages = await getUnreadMessagesByRFP(userId)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Welcome Section */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {userProfile.full_name}
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          {userProfile.community_profile?.role} at{' '}
          {userProfile.community_profile?.property_name}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Link
          href="/rfps/new"
          className="flex items-center p-4 sm:p-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[80px]"
        >
          <Plus className="h-6 w-6 sm:h-8 sm:w-8 mr-3 sm:mr-4 flex-shrink-0" />
          <div>
            <h3 className="text-base sm:text-lg font-semibold">Create RFP</h3>
            <p className="text-blue-100 text-xs sm:text-sm">
              Post a new request for proposal
            </p>
          </div>
        </Link>

        <Link
          href="/forum"
          className="flex items-center p-4 sm:p-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors min-h-[80px]"
        >
          <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 mr-3 sm:mr-4 flex-shrink-0" />
          <div>
            <h3 className="text-base sm:text-lg font-semibold">View Forum</h3>
            <p className="text-green-100 text-xs sm:text-sm">
              Join community discussions
            </p>
          </div>
        </Link>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Active RFPs */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-500" />
                  Active RFPs
                </h2>
                <Link
                  href="/rfps"
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-700"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {myRFPs.length === 0 ? (
                <div className="px-4 sm:px-6 py-6 sm:py-8 text-center text-gray-500">
                  <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">No active RFPs</p>
                  <Link
                    href="/rfps/new"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block min-h-[44px] flex items-center justify-center"
                  >
                    Create your first RFP
                  </Link>
                </div>
              ) : (
                myRFPs.slice(0, 5).map((rfp) => (
                  <Link
                    key={rfp.id}
                    href={`/rfps/${rfp.id}`}
                    className="block px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 transition-colors min-h-[60px]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {rfp.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          {rfp.category}
                        </p>
                        {rfp.deadline && (
                          <p className="text-xs text-gray-400 mt-1">
                            Deadline:{' '}
                            {new Date(rfp.deadline).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {rfp.proposal_count}{' '}
                          <span className="hidden sm:inline">
                            {rfp.proposal_count === 1 ? 'proposal' : 'proposals'}
                          </span>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Pending Vendor Approvals */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-500" />
                Pending Approvals
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {pendingApprovals.length === 0 ? (
                <div className="px-6 py-6 text-center text-gray-500">
                  <p className="text-sm">No pending approvals</p>
                </div>
              ) : (
                pendingApprovals.slice(0, 3).map((approval) => (
                  <Link
                    key={approval.id}
                    href={`/rfps/${approval.rfp_id}/vendors`}
                    className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="mb-2">
                      <UserBadge
                        user={{
                          id: approval.vendor.user_id,
                          name: approval.vendor.user.full_name,
                          company: approval.vendor.company_name,
                          avatarUrl: approval.vendor.user.avatar_url || undefined,
                        }}
                        size="sm"
                        showLocation={false}
                      />
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {approval.rfp.title}
                    </p>
                  </Link>
                ))
              )}
              {pendingApprovals.length > 3 && (
                <div className="px-6 py-3 text-center">
                  <span className="text-xs text-gray-500">
                    +{pendingApprovals.length - 3} more
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Recent Messages */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-500" />
                Recent Messages
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {unreadMessages.length === 0 ? (
                <div className="px-6 py-6 text-center text-gray-500">
                  <p className="text-sm">No unread messages</p>
                </div>
              ) : (
                unreadMessages.slice(0, 3).map((msg, idx) => (
                  <Link
                    key={`${msg.rfpId}-${msg.senderId}-${idx}`}
                    href={`/rfps/${msg.rfpId}/messages`}
                    className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {msg.senderName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {msg.rfpTitle}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          {msg.count} unread
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
