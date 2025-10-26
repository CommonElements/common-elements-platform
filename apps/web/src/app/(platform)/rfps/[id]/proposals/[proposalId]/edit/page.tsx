import { notFound, redirect } from 'next/navigation'
import { getProposal } from '@repo/database'
import { requireAuth, getUserProfile } from '@repo/auth'
import { EditProposalForm } from './edit-proposal-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface EditProposalPageProps {
  params: Promise<{
    id: string
    proposalId: string
  }>
}

export default async function EditProposalPage({
  params,
}: EditProposalPageProps) {
  // Require authentication
  await requireAuth()
  const userProfile = await getUserProfile()

  // Check if user is a vendor
  if (userProfile?.account_type !== 'vendor') {
    redirect('/rfps')
  }

  const { id, proposalId } = await params

  // Fetch proposal
  let proposal
  try {
    proposal = await getProposal(proposalId)
  } catch (error) {
    notFound()
  }

  // Check if user owns this proposal
  if (proposal.vendor.user_id !== userProfile.profile?.user_id) {
    redirect(`/rfps/${id}`)
  }

  // Check if proposal can be edited
  if (proposal.status !== 'submitted') {
    redirect(`/rfps/${id}`)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/rfps/${id}`}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to RFP
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Edit Proposal
        </h1>
        <p className="text-gray-600">{proposal.rfp.title}</p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <p className="text-sm text-blue-800">
          You can edit your proposal while it has "submitted" status. Once the
          property owner changes the status, editing will be disabled.
        </p>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <EditProposalForm
          proposalId={proposalId}
          rfpId={id}
          initialData={{
            coverLetter: proposal.cover_letter,
            timeline: proposal.timeline,
            cost: proposal.cost.toString(),
            paymentTerms: proposal.payment_terms,
          }}
        />
      </div>
    </div>
  )
}
