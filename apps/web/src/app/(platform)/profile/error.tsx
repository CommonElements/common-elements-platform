'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, RefreshCw, User } from 'lucide-react'

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Profile error:', error)
  }, [error])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow rounded-lg p-8">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mx-auto">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        
        <h2 className="mt-4 text-center text-xl font-bold text-gray-900">
          Failed to load profile
        </h2>
        
        <p className="mt-2 text-center text-sm text-gray-600">
          We couldn't load the profile you requested. This might be because it doesn't exist or you don't have permission to view it.
        </p>

        {error.message && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-xs text-gray-600 text-center">
              {error.message}
            </p>
          </div>
        )}

        {error.digest && (
          <div className="mt-2 p-3 bg-gray-50 rounded-md">
            <p className="text-xs text-gray-500 text-center">
              Error ID: <code className="font-mono">{error.digest}</code>
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <User className="h-4 w-4" />
            Back to dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
