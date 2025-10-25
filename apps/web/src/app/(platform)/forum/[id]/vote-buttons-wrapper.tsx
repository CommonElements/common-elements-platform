'use client'

import { VoteButtons } from '@repo/ui'
import { voteOnPost, voteOnComment } from '../actions'

interface VoteButtonsWrapperProps {
  postId?: string
  commentId?: string
  initialCount: number
  initialUserVote: 'up' | 'down' | null
  votableType: 'post' | 'comment'
}

export function VoteButtonsWrapper({
  postId,
  commentId,
  initialCount,
  initialUserVote,
  votableType,
}: VoteButtonsWrapperProps) {
  const handleVote = async (direction: 'up' | 'down') => {
    if (votableType === 'post' && postId) {
      await voteOnPost(postId, direction)
    } else if (votableType === 'comment' && commentId) {
      await voteOnComment(commentId, direction)
    }
  }

  return (
    <VoteButtons
      count={initialCount}
      userVote={initialUserVote}
      onVote={handleVote}
      orientation="vertical"
    />
  )
}
