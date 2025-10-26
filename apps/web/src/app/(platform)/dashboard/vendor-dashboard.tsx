import Link from 'next/link'
import {
  getRFPs,
  getUnreadMessagesByRFP,
  type UserProfile,
} from '@repo/database'
import { createServerSupabaseClient } from '@repo/database/server'
import { MessageSquare, FileText, Search, Send } from 'lucide-react'

interface VendorDashboardProps {
  userId: string
  userProfile: UserProfile
}

export async function VendorDashboard({
  userId,
  userProfile,
}: VendorDashboardProps) {
  const supabase = await createServerSupabaseClient()

  // Get vendor profile ID
  const vendorProfileId = userProfile.vendor_profile?.id

  if (!vendorProfileId) {
    return <div>Error: Vendor profile not found</div>
  }

  // Fetch available RFPs (public + approved private)
  const allRFPs = await getRFPs({ limit: 100 })

  // Get approved private RFPs for this vendor
  const { data: approvedRFPs } = await supabase
    .from('rfp_approved_vendors')
    .select('rfp_id')
    .eq('vendor_id', vendorProfileId)
    .eq('status', 'approved')

  const approvedRFPIds = new Set(approvedRFPs?.map((a) => a.rfp_id) || [])

  // Filter RFPs: public or approved private, and status is open
  const availableRFPs = allRFPs.rfps.filter(
    (rfp) =>
      rfp.status === 'open' &&
      (rfp.visibility === 'public' || approvedRFPIds.has(rfp.id))
  )

  // Fetch submitted proposals
  const { data: proposals } = await supabase
    .from('proposals')
    .select(
      `
      id,
      status,
      created_at,
      rfp:rfps!proposals_rfp_id_fkey (
        id,
        title,
        category,
        status
      )
    `
    )
    .eq('vendor_id', vendorProfileId)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch unread messages
  const unreadMessages = await getUnreadMessagesByRFP(userId)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800'
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Welcome Section */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {userProfile.full_name}
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          {userProfile.vendor_profile?.company_name}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link
          href="/rfps"
          className="flex items-center p-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Search className="h-8 w-8 mr-4" />
          <div>
            <h3 className="text-lg font-semibold">Browse RFPs</h3>
            <p className="text-blue-100 text-sm">
              Find new opportunities to bid on
            </p>
          </div>
        </Link>

        <Link
          href="/forum"
          className="flex items-center p-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <MessageSquare className="h-8 w-8 mr-4" />
          <div>
            <h3 className="text-lg font-semibold">View Forum</h3>
            <p className="text-green-100 text-sm">
              Join community discussions
            </p>
          </div>
        </Link>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available RFPs */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-gray-500" />
                  Available RFPs
                </h2>
                <Link
                  href="/rfps"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {availableRFPs.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">No available RFPs at the moment</p>
                  <Link
                    href="/rfps"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
                  >
                    Browse all RFPs
                  </Link>
                </div>
              ) : (
                availableRFPs.slice(0, 5).map((rfp) => (
                  <Link
                    key={rfp.id}
                    href={`/rfps/${rfp.id}`}
                    className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {rfp.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {rfp.category}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          {rfp.deadline && (
                            <p className="text-xs text-gray-400">
                              Deadline:{' '}
                              {new Date(rfp.deadline).toLocaleDateString()}
                            </p>
                          )}
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {rfp.visibility}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {rfp.proposal_count}{' '}
                          {rfp.proposal_count === 1 ? 'bid' : 'bids'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Submitted Proposals */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Send className="h-5 w-5 mr-2 text-gray-500" />
                My Proposals
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {!proposals || proposals.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  <Send className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">No proposals submitted yet</p>
                  <Link
                    href="/rfps"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
                  >
                    Browse RFPs to submit proposals
                  </Link>
                </div>
              ) : (
                proposals.map((proposal: any) => (
                  <Link
                    key={proposal.id}
                    href={`/rfps/${proposal.rfp.id}/proposals/${proposal.id}`}
                    className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {proposal.rfp.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {proposal.rfp.category}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Submitted:{' '}
                          {new Date(proposal.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            proposal.status
                          )}`}
                        >
                          {getStatusLabel(proposal.status)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Recent Messages */}
        <div>
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-gray-500" />
                Recent Messages
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {unreadMessages.length === 0 ? (
                <div className="px-6 py-6 text-center text-gray-500">
                  <p className="text-sm">No unread messages</p>
                </div>
              ) : (
                unreadMessages.slice(0, 5).map((msg, idx) => (
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
