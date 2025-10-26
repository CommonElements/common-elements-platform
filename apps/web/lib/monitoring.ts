import * as Sentry from '@sentry/nextjs'

export const initSentry = () => {
  const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN
  const environment = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV

  if (!SENTRY_DSN) {
    console.log('Sentry DSN not found, skipping Sentry initialization')
    return
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment,

    // Performance Monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,

    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Release tracking
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

    // Integrations
    integrations: [
      Sentry.replayIntegration(),
      Sentry.browserTracingIntegration(),
    ],

    // Filtering
    beforeSend(event, hint) {
      // Filter out non-error events in development
      if (environment === 'development' && event.level !== 'error') {
        return null
      }

      // Filter out known third-party errors
      const error = hint.originalException
      if (error && error instanceof Error) {
        // Filter out network errors that aren't our fault
        if (error.message?.includes('Network request failed')) {
          return null
        }

        // Filter out browser extension errors
        if (error.message?.includes('extension://')) {
          return null
        }
      }

      return event
    },

    // Configure which errors to ignore
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',

      // Network errors
      'NetworkError',
      'Failed to fetch',

      // Supabase auth errors that are expected
      'User not authenticated',
      'Invalid refresh token',
    ],
  })
}

// Custom error boundary reporting
export const reportErrorBoundary = (error: Error, errorInfo: { componentStack: string }) => {
  if (typeof window !== 'undefined' && window.Sentry) {
    Sentry.withScope((scope) => {
      scope.setContext('errorBoundary', {
        componentStack: errorInfo.componentStack,
      })
      Sentry.captureException(error)
    })
  }
}

// User context
export const setUserContext = (user: { id: string; email?: string; role?: string }) => {
  if (typeof window !== 'undefined' && window.Sentry) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      role: user.role,
    })
  }
}

// Clear user context on logout
export const clearUserContext = () => {
  if (typeof window !== 'undefined' && window.Sentry) {
    Sentry.setUser(null)
  }
}

// Custom breadcrumb for important user actions
export const addBreadcrumb = (message: string, category: string, data?: any) => {
  if (typeof window !== 'undefined' && window.Sentry) {
    Sentry.addBreadcrumb({
      message,
      category,
      level: 'info',
      data,
      timestamp: Date.now() / 1000,
    })
  }
}

// Performance monitoring
export const startTransaction = (name: string, op: string) => {
  if (typeof window !== 'undefined' && window.Sentry) {
    return Sentry.startSpan({ name, op })
  }
  return null
}

// API monitoring
export const monitorApiCall = async <T>(
  apiCall: () => Promise<T>,
  endpoint: string
): Promise<T> => {
  const transaction = startTransaction(`API Call: ${endpoint}`, 'http.client')

  try {
    const result = await apiCall()
    transaction?.end()
    return result
  } catch (error) {
    transaction?.end()

    // Log to Sentry with additional context
    if (typeof window !== 'undefined' && window.Sentry) {
      Sentry.withScope((scope) => {
        scope.setTag('api.endpoint', endpoint)
        scope.setLevel('error')
        Sentry.captureException(error)
      })
    }

    throw error
  }
}