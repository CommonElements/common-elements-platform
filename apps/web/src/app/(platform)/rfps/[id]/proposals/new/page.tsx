import { notFound, redirect } from 'next/navigation'
import { getRFP, getRFPPrivateDetails } from '@repo/database'
import { requireAuth, getUserProfile } from '@repo/auth'
import { ProposalForm } from './proposal-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface NewProposalPageProps {
  params: {
    id: string
  }
}

export default async function NewProposalPage({
  params,
}: NewProposalPageProps) {
  // Require authentication
  await requireAuth()
  const userProfile = await getUserProfile()

  // Check if user is a vendor
  if (userProfile?.account_type !== 'vendor') {
    redirect('/rfps')
  }

  // Fetch RFP
  let rfp
  try {
    rfp = await getRFP(params.id)
  } catch (error) {
    notFound()
  }

  // Check if RFP is open
  if (rfp.status !== 'open') {
    redirect(`/rfps/${params.id}`)
  }

  // Try to fetch private details (RLS will handle authorization)
  const privateDetails = await getRFPPrivateDetails(params.id)
  const hasAccess = privateDetails !== null

  // If private RFP and no access, redirect
  if (rfp.visibility === 'private' && !hasAccess) {
    redirect(`/rfps/${params.id}`)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/rfps/${params.id}`}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to RFP
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Submit Proposal
        </h1>
        <p className="text-gray-600">{rfp.title}</p>
      </div>

      {/* RFP Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">
          RFP Details
        </h2>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            <span className="font-medium">Category:</span> {rfp.category}
          </p>
          {rfp.deadline && (
            <p>
              <span className="font-medium">Deadline:</span>{' '}
              {new Date(rfp.deadline).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          )}
          {(rfp.budget_min || rfp.budget_max) && (
            <p>
              <span className="font-medium">Budget:</span>{' '}
              {rfp.budget_min && rfp.budget_max
                ? `$${rfp.budget_min.toLocaleString()} - $${rfp.budget_max.toLocaleString()}`
                : rfp.budget_min
                  ? `From $${rfp.budget_min.toLocaleString()}`
                  : `Up to $${rfp.budget_max?.toLocaleString()}`}
            </p>
          )}
        </div>
      </div>

      {/* Proposal Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <ProposalForm rfpId={params.id} />
      </div>
    </div>
  )
}
