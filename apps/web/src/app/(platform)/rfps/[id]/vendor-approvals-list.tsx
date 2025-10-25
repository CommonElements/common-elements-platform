'use client'

import { useState } from 'react'
import { UserBadge } from '@repo/ui'
import { updateVendorApproval } from '../actions'
import { useRouter } from 'next/navigation'
import { Check, X, Building2, MapPin, Briefcase } from 'lucide-react'

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

interface VendorApprovalsListProps {
  approvals: VendorApproval[]
}

export function VendorApprovalsList({ approvals }: VendorApprovalsListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleApproval = async (
    approvalId: string,
    status: 'approved' | 'rejected'
  ) => {
    setLoadingId(approvalId)
    setError(null)

    const result = await updateVendorApproval(approvalId, status)

    if (result.success) {
      router.refresh()
    } else {
      setError(result.error?.message || 'Failed to update approval')
    }

    setLoadingId(null)
  }

  if (approvals.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No pending vendor approval requests
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {approvals.map((approval) => (
        <div
          key={approval.id}
          className="bg-white rounded-lg shadow border border-gray-200 p-6"
        >
          {/* Vendor Info */}
          <div className="mb-4">
            <UserBadge
              user={{
                id: approval.vendor.user.id,
                name: approval.vendor.user.full_name,
                company: approval.vendor.company_name,
                avatarUrl: approval.vendor.user.avatar_url || undefined,
              }}
              size="md"
            />
          </div>

          {/* Company Details */}
          <div className="space-y-3 mb-4">
            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700">Company</p>
                <p className="text-sm text-gray-600">
                  {approval.vendor.company_name}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Briefcase className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700">Services</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {approval.vendor.service_categories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Service Areas
                </p>
                <p className="text-sm text-gray-600">
                  {approval.vendor.service_areas.join(', ')}
                </p>
              </div>
            </div>

            {approval.vendor.business_description && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  About
                </p>
                <p className="text-sm text-gray-600">
                  {approval.vendor.business_description}
                </p>
              </div>
            )}
          </div>

          {/* Request Date */}
          <p className="text-xs text-gray-500 mb-4">
            Requested{' '}
            {new Date(approval.requested_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => handleApproval(approval.id, 'approved')}
              disabled={loadingId === approval.id}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="h-4 w-4 mr-2" />
              {loadingId === approval.id ? 'Processing...' : 'Approve'}
            </button>
            <button
              onClick={() => handleApproval(approval.id, 'rejected')}
              disabled={loadingId === approval.id}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="h-4 w-4 mr-2" />
              {loadingId === approval.id ? 'Processing...' : 'Reject'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
