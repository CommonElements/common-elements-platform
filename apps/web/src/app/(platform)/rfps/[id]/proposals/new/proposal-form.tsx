'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProposal } from '../../../actions'
import { RichTextEditor } from '@repo/ui'
import { DollarSign, Calendar, FileText, CreditCard } from 'lucide-react'

interface ProposalFormProps {
  rfpId: string
}

export function ProposalForm({ rfpId }: ProposalFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    coverLetter: '',
    timeline: '',
    cost: '',
    paymentTerms: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (formData.coverLetter.length < 100) {
      newErrors.coverLetter = 'Cover letter must be at least 100 characters'
    }

    if (formData.timeline.length < 10) {
      newErrors.timeline = 'Timeline is required'
    }

    const costNum = parseFloat(formData.cost)
    if (isNaN(costNum) || costNum <= 0) {
      newErrors.cost = 'Cost must be a positive number'
    }

    if (formData.paymentTerms.length < 10) {
      newErrors.paymentTerms = 'Payment terms are required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    const result = await createProposal({
      rfpId,
      coverLetter: formData.coverLetter,
      timeline: formData.timeline,
      cost: parseFloat(formData.cost),
      paymentTerms: formData.paymentTerms,
    })

    if (result.success) {
      router.push(`/rfps/${rfpId}`)
    } else {
      setError(result.error?.message || 'Failed to submit proposal')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Cover Letter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cover Letter <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-600 mb-2">
          Introduce your company and explain why you're the best fit for this
          project. Minimum 100 characters.
        </p>
        <RichTextEditor
          value={formData.coverLetter}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, coverLetter: value }))
          }
          placeholder="Tell the property owner about your company, relevant experience, and approach to this project..."
          maxLength={10000}
        />
        {errors.coverLetter && (
          <p className="mt-1 text-sm text-red-600">{errors.coverLetter}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {formData.coverLetter.length} / 10,000 characters
        </p>
      </div>

      {/* Timeline */}
      <div>
        <label
          htmlFor="timeline"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          <Calendar className="inline h-4 w-4 mr-1" />
          Project Timeline <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-600 mb-2">
          Provide a detailed timeline for completing the project, including key
          milestones.
        </p>
        <textarea
          id="timeline"
          rows={4}
          value={formData.timeline}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, timeline: e.target.value }))
          }
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="e.g., Week 1-2: Site assessment and planning&#10;Week 3-4: Material procurement&#10;Week 5-8: Installation and completion"
        />
        {errors.timeline && (
          <p className="mt-1 text-sm text-red-600">{errors.timeline}</p>
        )}
      </div>

      {/* Cost */}
      <div>
        <label
          htmlFor="cost"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          <DollarSign className="inline h-4 w-4 mr-1" />
          Total Project Cost <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-600 mb-2">
          Enter the total cost for the project in USD.
        </p>
        <div className="relative rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            id="cost"
            step="0.01"
            min="0"
            value={formData.cost}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, cost: e.target.value }))
            }
            className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="0.00"
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-gray-500 sm:text-sm">USD</span>
          </div>
        </div>
        {errors.cost && (
          <p className="mt-1 text-sm text-red-600">{errors.cost}</p>
        )}
      </div>

      {/* Payment Terms */}
      <div>
        <label
          htmlFor="paymentTerms"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          <CreditCard className="inline h-4 w-4 mr-1" />
          Payment Terms <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-600 mb-2">
          Describe your payment schedule and terms (e.g., deposit, milestones,
          final payment).
        </p>
        <textarea
          id="paymentTerms"
          rows={4}
          value={formData.paymentTerms}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, paymentTerms: e.target.value }))
          }
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="e.g., 30% deposit upon contract signing&#10;40% upon completion of phase 1&#10;30% upon project completion"
        />
        {errors.paymentTerms && (
          <p className="mt-1 text-sm text-red-600">{errors.paymentTerms}</p>
        )}
      </div>

      {/* Attachments Note */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <FileText className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-700">
              Attachments (Coming Soon)
            </p>
            <p className="text-sm text-gray-600 mt-1">
              File upload functionality will be available in the next step after
              submitting your initial proposal.
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
        </button>
      </div>
    </form>
  )
}
