/**
 * UserBadge Component
 * 
 * Displays user identity with avatar, name, role/company, and location
 * Used throughout the application to show user information
 */

'use client'

import * as React from 'react'
import Image from 'next/image'
import { cn } from './lib/utils'

export interface UserBadgeProps {
  user: {
    id: string
    name: string
    role?: string
    company?: string
    location?: string
    avatarUrl?: string
  }
  size?: 'sm' | 'md' | 'lg'
  showLocation?: boolean
  showBio?: boolean
  onClick?: () => void
  className?: string
}

const sizeClasses = {
  sm: {
    container: 'gap-2',
    avatar: 'h-8 w-8 text-xs',
    name: 'text-sm',
    meta: 'text-xs',
  },
  md: {
    container: 'gap-3',
    avatar: 'h-10 w-10 text-sm',
    name: 'text-base',
    meta: 'text-sm',
  },
  lg: {
    container: 'gap-4',
    avatar: 'h-12 w-12 text-base',
    name: 'text-lg',
    meta: 'text-base',
  },
}

export function UserBadge({
  user,
  size = 'md',
  showLocation = true,
  showBio = false,
  onClick,
  className,
}: UserBadgeProps) {
  const sizes = sizeClasses[size]
  const isClickable = !!onClick

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div
      className={cn(
        'flex items-center',
        sizes.container,
        isClickable && 'cursor-pointer hover:opacity-80 transition-opacity',
        className
      )}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-gray-200 font-semibold text-gray-600 overflow-hidden flex-shrink-0 relative',
          sizes.avatar
        )}
      >
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt={user.name}
            fill
            sizes={
              size === 'sm' ? '32px' :
              size === 'md' ? '40px' :
              '48px'
            }
            className="object-cover"
            priority={false}
          />
        ) : (
          <span>{getInitials(user.name)}</span>
        )}
      </div>

      {/* User Info */}
      <div className="flex flex-col min-w-0">
        <div className={cn('font-semibold text-gray-900 truncate', sizes.name)}>
          {user.name}
        </div>
        
        {(user.role || user.company) && (
          <div className={cn('text-gray-600 truncate', sizes.meta)}>
            {user.company || user.role}
          </div>
        )}
        
        {showLocation && user.location && (
          <div className={cn('text-gray-500 truncate', sizes.meta)}>
            {user.location}
          </div>
        )}
      </div>
    </div>
  )
}
