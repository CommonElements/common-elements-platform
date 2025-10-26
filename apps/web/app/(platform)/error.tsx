'use client'

import { useEffect } from 'react'
import { Button } from '@repo/ui/components/button'

export default function PlatformError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Platform error:', error)
  }, [error])

  return (
    <div className="container mx-auto flex h-[50vh] flex-col items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h2 className="mb-4 text-2xl font-bold">Oops! Something went wrong</h2>
        <p className="mb-6 text-gray-600">
          We're having trouble loading this page. Please try again.
        </p>
        {process.env.NODE_ENV === 'development' && error.message && (
          <p className="mb-4 rounded bg-red-50 p-2 text-sm text-red-600">
            {error.message}
          </p>
        )}
        <div className="space-x-4">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go back
          </Button>
        </div>
      </div>
    </div>
  )
}