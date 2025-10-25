'use client'

import { useState } from 'react'
import { requestToBid } from '../actions'
import { useRouter } from 'next/navigation'

interface RequestToBidButtonProps {
  rfpId: string
}

export function RequestToBidButton({ rfpId }: RequestToBidButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleRequest = async () => {
    setIsLoading(true)
    setError(null)

    const result = await requestToBid(rfpId)

    if (result.success) {
      setSuccess(true)
      // Refresh the page to show updated status
      router.refresh()
    } else {
      setError(result.error?.message || 'Failed to submit request')
    }

    setIsLoading(false)
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          Request submitted successfully! The property owner will review your
          profile and respond soon.
        </p>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={handleRequest}
        disabled={isLoading}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Submitting...' : 'Request to Bid'}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
