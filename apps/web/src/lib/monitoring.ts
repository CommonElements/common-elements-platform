// Monitoring functionality - currently disabled (Sentry not installed)
// TODO: Install and configure @sentry/nextjs for production monitoring

export const initSentry = () => {
  // Sentry not installed
  console.log('Monitoring not configured')
}

export const reportErrorBoundary = (error: Error, errorInfo: { componentStack: string }) => {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Boundary:', error, errorInfo)
  }
}

export const setUserContext = (user: { id: string; email?: string; role?: string }) => {
  // No-op
}

export const clearUserContext = () => {
  // No-op
}

export const addBreadcrumb = (message: string, category: string, data?: any) => {
  // No-op
}

export const startTransaction = (name: string, op: string) => {
  return null
}

export const monitorApiCall = async <T>(
  apiCall: () => Promise<T>,
  endpoint: string
): Promise<T> => {
  // Just execute the API call without monitoring
  return await apiCall()
}
