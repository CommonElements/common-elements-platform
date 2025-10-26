'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { GA_TRACKING_ID, pageview } from '@/lib/analytics'

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    const handleRouteChange = () => {
      pageview(pathname)
    }

    handleRouteChange()
  }, [pathname])

  // Analytics temporarily disabled - TODO: Update to React 19 compatible implementation
  // if (!GA_TRACKING_ID) {
  return <>{children}</>
  // }
}