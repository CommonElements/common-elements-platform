'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'

export default function PlatformError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Platform error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mx-auto">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          
          <h2 className="mt-4 text-center text-2xl font-bold text-gray-900">
            Oops! Something went wrong
          </h2>
          
          <p className="mt-2 text-center text-sm text-gray-600">
            We encountered an error while loading this page. This has been logged and we'll look into it.
          </p>

          {error.digest && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-500 text-center">
                Error ID: <code className="font-mono">{error.digest}</code>
              </p>
            </div>
          )}

          <div className="mt-6 space-y-3">
            <button
              onClick={reset}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>

            <button
              onClick={() => router.back()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Go back
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Return to dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
