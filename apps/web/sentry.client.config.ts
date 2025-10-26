import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,

    // Adjust this value in production
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Capture Replay for 10% of all sessions,
    // and for 100% of sessions with an error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Release tracking
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

    // This sets the sample rate to be 10%. You may want to change it to 100% in development
    // and sample at a lower rate in production
    debug: false,

    integrations: [
      Sentry.replayIntegration({
        // Additional Replay configuration
        maskAllText: false,
        blockAllMedia: false,
      }),
      Sentry.browserTracingIntegration(),
    ],

    // Filter out non-actionable errors
    beforeSend(event, hint) {
      // Filter development errors
      if (process.env.NODE_ENV === 'development') {
        console.error('[Sentry]', hint.originalException || event)
        return null
      }

      // Filter known issues
      const error = hint.originalException
      if (error && error instanceof Error) {
        // Skip network errors
        if (error.message?.match(/fetch|network|Failed to fetch/i)) {
          return null
        }

        // Skip browser extension errors
        if (error.message?.match(/extension:|chrome-extension:|moz-extension:/)) {
          return null
        }

        // Skip ResizeObserver errors (common and usually harmless)
        if (error.message?.includes('ResizeObserver')) {
          return null
        }
      }

      return event
    },

    ignoreErrors: [
      // Browser extensions
      /extension\//,
      /^chrome:\/\//,
      /^moz-extension:\/\//,

      // Network errors
      'NetworkError',
      'Failed to fetch',
      'Load failed',

      // Common harmless errors
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Non-Error promise rejection captured',

      // Third party errors
      'top.GLOBALS',
      '__gCrWeb',

      // Expected auth errors
      'User not authenticated',
      'Invalid refresh token',
      'JWT expired',
    ],
  })
}