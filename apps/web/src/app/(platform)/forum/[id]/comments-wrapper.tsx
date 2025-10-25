'use client'

import { CommentSection, type Comment } from '@repo/ui'
import { createComment, voteOnComment, updateComment } from '../actions'
import { useRouter } from 'next/navigation'

interface CommentsWrapperProps {
  postId: string
  comments: Comment[]
  currentUserId?: string
}

export function CommentsWrapper({
  postId,
  comments,
  currentUserId,
}: CommentsWrapperProps) {
  const router = useRouter()

  const handleSubmit = async (content: string, parentId?: string) => {
    await createComment(postId, content, parentId)
    router.refresh()
  }

  const handleVote = async (commentId: string, direction: 'up' | 'down') => {
    await voteOnComment(commentId, direction)
    router.refresh()
  }

  const handleEdit = async (commentId: string, content: string) => {
    await updateComment(commentId, content)
    router.refresh()
  }

  return (
    <CommentSection
      comments={comments}
      currentUserId={currentUserId}
      onSubmit={handleSubmit}
      onVote={handleVote}
      onEdit={handleEdit}
    />
  )
}
