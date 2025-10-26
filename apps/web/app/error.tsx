'use client'

import { useEffect } from 'react'
import { Button } from '@repo/ui/components/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error)

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
      // This would be your Sentry or error tracking integration
      // window.Sentry?.captureException(error)
    }
  }, [error])

  return (
    <html>
      <body>
        <div className="flex h-screen flex-col items-center justify-center p-4">
          <div className="max-w-md text-center">
            <h1 className="mb-4 text-4xl font-bold">Something went wrong!</h1>
            <p className="mb-6 text-gray-600">
              We apologize for the inconvenience. An unexpected error has occurred.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <details className="mb-6 rounded-lg bg-red-50 p-4 text-left">
                <summary className="cursor-pointer font-semibold">Error Details</summary>
                <pre className="mt-2 whitespace-pre-wrap text-sm text-red-600">
                  {error.message}
                  {error.stack}
                </pre>
              </details>
            )}
            <div className="space-x-4">
              <Button onClick={reset}>Try again</Button>
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                Go to homepage
              </Button>
            </div>
            {error.digest && (
              <p className="mt-4 text-sm text-gray-500">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}