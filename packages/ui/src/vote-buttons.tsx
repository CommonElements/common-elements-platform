/**
 * VoteButtons Component
 * 
 * Upvote/downvote buttons with count display
 * Handles optimistic UI updates and vote state
 */

'use client'

import * as React from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from './lib/utils'

export interface VoteButtonsProps {
  count: number
  userVote?: 'up' | 'down' | null
  onVote: (direction: 'up' | 'down') => Promise<void>
  disabled?: boolean
  className?: string
  orientation?: 'vertical' | 'horizontal'
}

export function VoteButtons({
  count,
  userVote = null,
  onVote,
  disabled = false,
  className,
  orientation = 'vertical',
}: VoteButtonsProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [optimisticCount, setOptimisticCount] = React.useState(count)
  const [optimisticVote, setOptimisticVote] = React.useState(userVote)

  // Sync with prop changes
  React.useEffect(() => {
    setOptimisticCount(count)
  }, [count])

  React.useEffect(() => {
    setOptimisticVote(userVote)
  }, [userVote])

  const handleVote = async (direction: 'up' | 'down') => {
    if (disabled || isLoading) return

    // Calculate optimistic updates
    let countDelta = 0
    let newVote: 'up' | 'down' | null = direction

    if (optimisticVote === direction) {
      // Clicking same button removes vote
      countDelta = direction === 'up' ? -1 : 1
      newVote = null
    } else if (optimisticVote) {
      // Switching from opposite vote
      countDelta = direction === 'up' ? 2 : -2
    } else {
      // New vote
      countDelta = direction === 'up' ? 1 : -1
    }

    // Apply optimistic updates
    const previousCount = optimisticCount
    const previousVote = optimisticVote
    setOptimisticCount(optimisticCount + countDelta)
    setOptimisticVote(newVote)
    setIsLoading(true)

    try {
      await onVote(direction)
    } catch (error) {
      // Rollback on error
      setOptimisticCount(previousCount)
      setOptimisticVote(previousVote)
      console.error('Vote failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isVertical = orientation === 'vertical'

  return (
    <div
      className={cn(
        'flex items-center gap-1',
        isVertical ? 'flex-col' : 'flex-row',
        className
      )}
    >
      {/* Upvote Button */}
      <button
        onClick={() => handleVote('up')}
        disabled={disabled || isLoading}
        className={cn(
          'flex items-center justify-center rounded p-1 transition-colors',
          'hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed',
          optimisticVote === 'up'
            ? 'text-orange-500 bg-orange-50'
            : 'text-gray-500'
        )}
        aria-label="Upvote"
        type="button"
      >
        <ChevronUp className="h-5 w-5" />
      </button>

      {/* Vote Count */}
      <span
        className={cn(
          'font-semibold text-sm min-w-[2rem] text-center',
          optimisticVote === 'up' && 'text-orange-500',
          optimisticVote === 'down' && 'text-blue-500',
          !optimisticVote && 'text-gray-700'
        )}
      >
        {optimisticCount}
      </span>

      {/* Downvote Button */}
      <button
        onClick={() => handleVote('down')}
        disabled={disabled || isLoading}
        className={cn(
          'flex items-center justify-center rounded p-1 transition-colors',
          'hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed',
          optimisticVote === 'down'
            ? 'text-blue-500 bg-blue-50'
            : 'text-gray-500'
        )}
        aria-label="Downvote"
        type="button"
      >
        <ChevronDown className="h-5 w-5" />
      </button>
    </div>
  )
}
