import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV,

    // Adjust this value in production
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Release tracking
    release: process.env.VERCEL_GIT_COMMIT_SHA,

    // Debug mode
    debug: false,

    beforeSend(event, hint) {
      // Don't send events in development
      if (process.env.NODE_ENV === 'development') {
        console.error('[Sentry Edge]', hint.originalException || event)
        return null
      }

      // Filter out expected edge runtime errors
      const error = hint.originalException
      if (error && error instanceof Error) {
        // Skip expected auth middleware errors
        if (error.message?.includes('Unauthorized')) {
          return null
        }

        // Skip CORS errors
        if (error.message?.includes('CORS')) {
          return null
        }
      }

      return event
    },

    // Edge-specific ignore patterns
    ignoreErrors: [
      // Edge runtime specific
      'Edge Runtime',
      'Worker',

      // Auth errors
      'Unauthorized',
      'Forbidden',

      // CORS
      'CORS',
      'Cross-Origin',
    ],
  })
}