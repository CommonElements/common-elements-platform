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

    // Server-specific configuration
    autoSessionTracking: true,

    integrations: [
      // Prisma integration if using Prisma
      // new Sentry.Integrations.Prisma({ client: prisma }),
    ],

    beforeSend(event, hint) {
      // Don't send events in development
      if (process.env.NODE_ENV === 'development') {
        console.error('[Sentry Server]', hint.originalException || event)
        return null
      }

      // Filter out expected errors
      const error = hint.originalException
      if (error && error instanceof Error) {
        // Skip expected database errors
        if (error.message?.includes('PGRST')) {
          return null
        }

        // Skip rate limit errors
        if (error.message?.includes('rate limit')) {
          console.warn('Rate limit hit:', error.message)
          return null
        }
      }

      return event
    },

    // Server-side specific ignore patterns
    ignoreErrors: [
      // Database connection errors that auto-retry
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',

      // Expected Supabase errors
      'invalid claim',
      'JWT',

      // Rate limiting
      'too many requests',
      'rate limit',
    ],
  })
}