import { notFound, redirect } from 'next/navigation'
import { getRFP } from '@repo/database'
import { requireAuth, getUserProfile } from '@repo/auth'
import { createServerSupabaseClient } from '@repo/database'
import { VendorApprovalsList } from '../vendor-approvals-list'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface VendorApproval {
  id: string
  rfp_id: string
  status: string
  requested_at: string
  vendor: {
    id: string
    user_id: string
    company_name: string
    service_categories: string[]
    service_areas: string[]
    business_description: string | null
    user: {
      id: string
      full_name: string
      avatar_url: string | null
    }
  }
}

interface VendorManagementPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function VendorManagementPage({
  params,
}: VendorManagementPageProps) {
  // Require authentication
  await requireAuth()
  const userProfile = await getUserProfile()

  // Check if user is a community member
  if (userProfile?.account_type !== 'community_member') {
    redirect('/rfps')
  }

  const { id } = await params

  // Fetch RFP
  let rfp
  try {
    rfp = await getRFP(id)
  } catch (error) {
    notFound()
  }

  // Check if user is the creator
  if (rfp.creator.user_id !== userProfile.profile?.user_id) {
    redirect(`/rfps/${id}`)
  }

  // Check if RFP is private
  if (rfp.visibility !== 'private') {
    redirect(`/rfps/${id}`)
  }

  // Fetch pending vendor approvals
  const supabase = await createServerSupabaseClient()
  const { data: approvals } = await supabase
    .from('rfp_approved_vendors')
    .select(
      `
      id,
      rfp_id,
      status,
      requested_at,
      vendor:vendor_profiles!rfp_approved_vendors_vendor_id_fkey (
        id,
        user_id,
        company_name,
        service_categories,
        service_areas,
        business_description,
        user:users!vendor_profiles_user_id_fkey (
          id,
          full_name,
          avatar_url
        )
      )
    `
    )
    .eq('rfp_id', id)
    .eq('status', 'pending')
    .order('requested_at', { ascending: false })

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
          Manage Vendor Access
        </h1>
        <p className="text-gray-600">{rfp.title}</p>
      </div>

      {/* Pending Approvals */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Pending Requests
        </h2>
        <VendorApprovalsList approvals={(approvals || []) as unknown as VendorApproval[]} />
      </div>

      {/* Approved Vendors Section */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Approved Vendors
        </h2>
        <ApprovedVendorsList rfpId={id} />
      </div>
    </div>
  )
}

async function ApprovedVendorsList({ rfpId }: { rfpId: string }) {
  const supabase = await createServerSupabaseClient()
  const { data: approvedVendors } = await supabase
    .from('rfp_approved_vendors')
    .select(
      `
      id,
      approved_at,
      vendor:vendor_profiles!rfp_approved_vendors_vendor_id_fkey (
        id,
        company_name,
        service_categories,
        user:users!vendor_profiles_user_id_fkey (
          id,
          full_name,
          avatar_url
        )
      )
    `
    )
    .eq('rfp_id', rfpId)
    .eq('status', 'approved')
    .order('approved_at', { ascending: false })

  if (!approvedVendors || approvedVendors.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No approved vendors yet
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {approvedVendors.map((approval: any) => (
        <div
          key={approval.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
        >
          <div>
            <p className="font-medium text-gray-900">
              {approval.vendor.company_name}
            </p>
            <p className="text-sm text-gray-600">
              {approval.vendor.user.full_name}
            </p>
            <div className="flex flex-wrap gap-1 mt-1">
              {approval.vendor.service_categories.slice(0, 3).map((cat: string) => (
                <span
                  key={cat}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">
              Approved{' '}
              {new Date(approval.approved_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
