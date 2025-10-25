'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserBadge, NotificationBadge } from '@repo/ui'
import { Menu, X, LogOut } from 'lucide-react'
import { cn } from '@repo/ui'
import type { UserProfile } from '@repo/database'

interface PlatformNavProps {
  userProfile: UserProfile
  unreadCount: number
}

export function PlatformNav({ userProfile, unreadCount }: PlatformNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  const isActive = (path: string) => {
    return pathname?.startsWith(path)
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', badge: unreadCount },
    { href: '/forum', label: 'Forum' },
    { href: '/rfps', label: 'RFPs' },
  ]

  // Prepare user data for UserBadge
  const userData = {
    id: userProfile.id,
    name: userProfile.full_name,
    role: userProfile.community_profile?.role,
    company: userProfile.vendor_profile?.company_name,
    location:
      userProfile.community_profile?.property_location ||
      userProfile.vendor_profile?.service_areas?.[0],
    avatarUrl: userProfile.avatar_url || undefined,
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex">
            <Link
              href="/dashboard"
              className="flex-shrink-0 flex items-center"
            >
              <h1 className="text-xl font-bold text-gray-900">
                Common Elements
              </h1>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-8 md:flex md:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium relative',
                    isActive(link.href)
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  )}
                >
                  {link.label}
                  {link.badge && link.badge > 0 && (
                    <NotificationBadge
                      count={link.badge}
                      className="ml-2"
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link href="/profile" aria-label="View profile">
              <UserBadge user={userData} size="sm" showLocation={false} />
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label="Logout from your account"
            >
              <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-gray-200" role="navigation" aria-label="Mobile navigation">
          <nav className="pt-2 pb-3 space-y-1" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'block pl-3 pr-4 py-2 border-l-4 text-base font-medium',
                  isActive(link.href)
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                )}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={isActive(link.href) ? 'page' : undefined}
              >
                <div className="flex items-center justify-between">
                  <span>{link.label}</span>
                  {link.badge && link.badge > 0 && (
                    <NotificationBadge count={link.badge} aria-label={`${link.badge} unread notifications`} />
                  )}
                </div>
              </Link>
            ))}
          </nav>

          {/* Mobile user section */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-4 mb-3">
              <Link href="/profile" onClick={() => setMobileMenuOpen(false)} aria-label="View your profile">
                <UserBadge user={userData} size="md" />
              </Link>
            </div>
            <div className="px-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label="Logout from your account"
              >
                <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
