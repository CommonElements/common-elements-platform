import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getRFP, getProposals } from '@repo/database'
import { createServerSupabaseClient } from '@repo/database/server'
import { UserBadge, ListSkeleton } from '@repo/ui'
import { FileText, DollarSign, Calendar } from 'lucide-react'
import Link from 'next/link'

interface ProposalsPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProposalsPage({ params }: ProposalsPageProps) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  // Fetch RFP
  let rfp
  try {
    rfp = await getRFP(id)
  } catch (error) {
    notFound()
  }

  // Check if user is the RFP creator
  const { data: communityProfile } = await supabase
    .from('community_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!communityProfile || rfp.creator.id !== communityProfile.id) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link */}
      <Link
        href={`/rfps/${id}`}
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        ← Back to RFP
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Proposals</h1>
        <p className="text-gray-600">{rfp.title}</p>
      </div>

      {/* Proposals List */}
      <Suspense fallback={<ListSkeleton count={3} />}>
        <ProposalsList rfpId={id} />
      </Suspense>
    </div>
  )
}

async function ProposalsList({ rfpId }: { rfpId: string }) {
  const proposals = await getProposals(rfpId)

  if (proposals.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No proposals submitted yet</p>
      </div>
    )
  }

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
    <div className="space-y-4">
      {proposals.map((proposal) => (
        <div
          key={proposal.id}
          className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <UserBadge
              user={{
                id: proposal.vendor.user.id,
                name: proposal.vendor.user.full_name,
                company: proposal.vendor.company_name,
                avatarUrl: proposal.vendor.user.avatar_url || undefined,
              }}
              size="md"
              showLocation={false}
            />
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                proposal.status
              )}`}
            >
              {getStatusLabel(proposal.status)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="h-4 w-4" />
              <span className="font-medium">${proposal.cost.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{proposal.timeline}</span>
            </div>
            <div className="text-sm text-gray-500">
              Submitted {new Date(proposal.created_at).toLocaleDateString()}
            </div>
          </div>

          <p className="text-gray-700 line-clamp-2 mb-4">{proposal.cover_letter}</p>

          <div className="flex justify-end">
            <Link
              href={`/rfps/${rfpId}/proposals/${proposal.id}`}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View Details →
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
