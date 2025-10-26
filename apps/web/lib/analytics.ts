// Google Analytics configuration
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

// Helper to check if analytics should be enabled
export const isAnalyticsEnabled = Boolean(
  typeof window !== 'undefined' &&
  GA_TRACKING_ID &&
  process.env.NODE_ENV === 'production'
)

// Log page views
export const pageview = (url: string) => {
  if (!isAnalyticsEnabled || !window.gtag) return

  window.gtag('config', GA_TRACKING_ID!, {
    page_path: url,
  })
}

// Log specific events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (!isAnalyticsEnabled || !window.gtag) return

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}

// Common events
export const trackSignUp = (method: string) => {
  event({
    action: 'sign_up',
    category: 'engagement',
    label: method,
  })
}

export const trackLogin = (method: string) => {
  event({
    action: 'login',
    category: 'engagement',
    label: method,
  })
}

export const trackRFPCreated = () => {
  event({
    action: 'rfp_created',
    category: 'rfp',
  })
}

export const trackProposalSubmitted = () => {
  event({
    action: 'proposal_submitted',
    category: 'proposal',
  })
}

export const trackForumPost = () => {
  event({
    action: 'post_created',
    category: 'forum',
  })
}

export const trackSearch = (searchTerm: string, resultCount: number) => {
  event({
    action: 'search',
    category: 'engagement',
    label: searchTerm,
    value: resultCount,
  })
}