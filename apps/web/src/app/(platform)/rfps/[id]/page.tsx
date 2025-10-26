import { notFound } from 'next/navigation'
import { getRFP, getRFPPrivateDetails } from '@repo/database'
import { requireAuth, getUserProfile } from '@repo/auth'
import { UserBadge } from '@repo/ui'
import {
  Calendar,
  MapPin,
  DollarSign,
  FileText,
  Lock,
  Mail,
  Phone,
  Download,
} from 'lucide-react'
import Link from 'next/link'
import { RequestToBidButton } from './request-to-bid-button'

interface RFPDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function RFPDetailPage({ params }: RFPDetailPageProps) {
  // Require authentication
  await requireAuth()
  const userProfile = await getUserProfile()

  const { id } = await params

  // Fetch RFP
  let rfp
  try {
    rfp = await getRFP(id)
  } catch (error) {
    notFound()
  }

  // Try to fetch private details (RLS will handle authorization)
  const privateDetails = await getRFPPrivateDetails(id)
  const hasAccess = privateDetails !== null

  // Check if user is the creator
  const isCreator =
    userProfile?.account_type === 'community_member' &&
    rfp.creator.user_id === userProfile.profile?.user_id

  // Check if user is a vendor
  const isVendor = userProfile?.account_type === 'vendor'

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800'
      case 'reviewing':
        return 'bg-yellow-100 text-yellow-800'
      case 'awarded':
        return 'bg-blue-100 text-blue-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return 'No deadline'

    const date = new Date(deadline)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Budget not specified'
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
    if (min) return `From $${min.toLocaleString()}`
    if (max) return `Up to $${max.toLocaleString()}`
    return 'Budget not specified'
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">{rfp.title}</h1>
              {rfp.visibility === 'private' && (
                <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800">
                {rfp.category}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(rfp.status)}`}
              >
                {rfp.status.charAt(0).toUpperCase() + rfp.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Creator Info */}
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-2">Posted by</p>
          <UserBadge
            user={{
              id: rfp.creator.user.id,
              name: rfp.creator.user.full_name,
              role: rfp.creator.role
                .split('_')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' '),
              location: rfp.creator.property_location,
              avatarUrl: rfp.creator.user.avatar_url || undefined,
            }}
            size="md"
            showLocation={true}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-2 lg:order-1">
          {/* Description */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Description
            </h2>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: rfp.description }}
            />
          </div>

          {/* Private Details */}
          {hasAccess && privateDetails && (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="h-5 w-5 text-gray-500" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Private Details
                  </h2>
                </div>

                {/* Contact Information */}
                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Contact Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{privateDetails.contact_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <a
                          href={`mailto:${privateDetails.contact_email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {privateDetails.contact_email}
                        </a>
                      </div>
                      {privateDetails.contact_phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          <a
                            href={`tel:${privateDetails.contact_phone}`}
                            className="text-blue-600 hover:underline"
                          >
                            {privateDetails.contact_phone}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{privateDetails.property_address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Scope */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Detailed Scope
                    </h3>
                    <div
                      className="prose prose-sm max-w-none text-gray-600"
                      dangerouslySetInnerHTML={{
                        __html: privateDetails.detailed_scope,
                      }}
                    />
                  </div>

                  {/* Special Requirements */}
                  {privateDetails.special_requirements && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Special Requirements
                      </h3>
                      <p className="text-sm text-gray-600">
                        {privateDetails.special_requirements}
                      </p>
                    </div>
                  )}
                </div>

                {/* Attachments */}
                {privateDetails.attachments &&
                  Array.isArray(privateDetails.attachments) &&
                  privateDetails.attachments.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Attachments
                      </h3>
                      <div className="space-y-2">
                        {privateDetails.attachments.map(
                          (file: any, index: number) => (
                            <a
                              key={index}
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                            >
                              <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                              <Download className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            </a>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </>
          )}

          {/* Private RFP - No Access */}
          {!hasAccess && rfp.visibility === 'private' && isVendor && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Lock className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                    Private RFP
                  </h3>
                  <p className="text-sm text-yellow-800 mb-4">
                    This is a private RFP. You need to request access to view
                    full details and submit a proposal.
                  </p>
                  <RequestToBidButton rfpId={rfp.id} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6 order-1 lg:order-2">
          {/* Key Information */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Key Information
            </h2>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Deadline</p>
                  <p className="text-sm text-gray-600">
                    {formatDeadline(rfp.deadline)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Budget</p>
                  <p className="text-sm text-gray-600">
                    {formatBudget(rfp.budget_min, rfp.budget_max)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Proposals</p>
                  <p className="text-sm text-gray-600">
                    {rfp.proposal_count} submitted
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Location</p>
                  <p className="text-sm text-gray-600">
                    {rfp.creator.property_location}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {isVendor && hasAccess && (
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Actions
              </h2>
              <div className="space-y-2">
                {rfp.status === 'open' && (
                  <Link
                    href={`/rfps/${rfp.id}/proposals/new`}
                    className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-h-[44px] flex items-center justify-center"
                  >
                    Submit Proposal
                  </Link>
                )}
                <Link
                  href={`/rfps/${rfp.id}/messages`}
                  className="block w-full text-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-h-[44px] flex items-center justify-center"
                >
                  Message Creator
                </Link>
              </div>
            </div>
          )}

          {isCreator && (
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Manage RFP
              </h2>
              <div className="space-y-2">
                <Link
                  href={`/rfps/${rfp.id}/proposals`}
                  className="block w-full text-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-h-[44px] flex items-center justify-center"
                >
                  View Proposals ({rfp.proposal_count})
                </Link>
                {rfp.visibility === 'private' && (
                  <Link
                    href={`/rfps/${rfp.id}/vendors`}
                    className="block w-full text-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-h-[44px] flex items-center justify-center"
                  >
                    Manage Vendor Access
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
