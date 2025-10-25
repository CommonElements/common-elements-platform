/**
 * CommentSection Component
 * 
 * Displays threaded comments with one-level nesting
 * Supports replies and voting on comments
 */

'use client'

import * as React from 'react'
import { UserBadge } from './user-badge'
import { VoteButtons } from './vote-buttons'
import { MessageSquare } from 'lucide-react'
import { cn } from './lib/utils'

export interface Comment {
  id: string
  content: string
  vote_count: number
  created_at: string
  author: {
    id: string
    full_name: string
    avatar_url: string | null
    account_type: string
  }
  replies?: Comment[]
  userVote?: 'up' | 'down' | null
}

export interface CommentSectionProps {
  comments: Comment[]
  currentUserId?: string
  onSubmit: (content: string, parentId?: string) => Promise<void>
  onVote: (commentId: string, direction: 'up' | 'down') => Promise<void>
  onEdit?: (commentId: string, content: string) => Promise<void>
  className?: string
}

export function CommentSection({
  comments,
  currentUserId,
  onSubmit,
  onVote,
  onEdit,
  className,
}: CommentSectionProps) {
  const [replyingTo, setReplyingTo] = React.useState<string | null>(null)
  const [editingId, setEditingId] = React.useState<string | null>(null)

  return (
    <div className={cn('space-y-6', className)}>
      {/* New Comment Form */}
      {currentUserId && (
        <CommentForm
          onSubmit={async (content) => {
            await onSubmit(content)
          }}
          placeholder="Add a comment..."
        />
      )}

      {/* Comments List */}
      {comments.map((comment) => (
        <div key={comment.id} className="space-y-4">
          <CommentItem
            comment={comment}
            currentUserId={currentUserId}
            onVote={onVote}
            onReply={() => setReplyingTo(comment.id)}
            isReplying={replyingTo === comment.id}
            onCancelReply={() => setReplyingTo(null)}
            onSubmitReply={async (content) => {
              await onSubmit(content, comment.id)
              setReplyingTo(null)
            }}
            onEdit={onEdit}
            isEditing={editingId === comment.id}
            onStartEdit={() => setEditingId(comment.id)}
            onCancelEdit={() => setEditingId(null)}
            onSubmitEdit={async (content) => {
              if (onEdit) {
                await onEdit(comment.id, content)
                setEditingId(null)
              }
            }}
          />

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-12 space-y-4 border-l-2 border-gray-200 pl-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  currentUserId={currentUserId}
                  onVote={onVote}
                  onEdit={onEdit}
                  isEditing={editingId === reply.id}
                  onStartEdit={() => setEditingId(reply.id)}
                  onCancelEdit={() => setEditingId(null)}
                  onSubmitEdit={async (content) => {
                    if (onEdit) {
                      await onEdit(reply.id, content)
                      setEditingId(null)
                    }
                  }}
                  isReply
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

interface CommentItemProps {
  comment: Comment
  currentUserId?: string
  onVote: (commentId: string, direction: 'up' | 'down') => Promise<void>
  onReply?: () => void
  isReplying?: boolean
  onCancelReply?: () => void
  onSubmitReply?: (content: string) => Promise<void>
  onEdit?: (commentId: string, content: string) => Promise<void>
  isEditing?: boolean
  onStartEdit?: () => void
  onCancelEdit?: () => void
  onSubmitEdit?: (content: string) => Promise<void>
  isReply?: boolean
}

function CommentItem({
  comment,
  currentUserId,
  onVote,
  onReply,
  isReplying,
  onCancelReply,
  onSubmitReply,
  onEdit,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSubmitEdit,
  isReply = false,
}: CommentItemProps) {
  const getUserRole = () => {
    if (comment.author.account_type === 'vendor') {
      return 'Vendor'
    }
    return 'Community Member'
  }

  return (
    <div className="flex gap-4">
      {/* Vote Buttons */}
      <div className="flex-shrink-0">
        <VoteButtons
          count={comment.vote_count}
          userVote={comment.userVote}
          onVote={(direction) => onVote(comment.id, direction)}
          orientation="vertical"
        />
      </div>

      {/* Comment Content */}
      <div className="flex-1 min-w-0">
        {isEditing && onSubmitEdit && onCancelEdit ? (
          <div className="bg-gray-50 rounded-lg p-4">
            <CommentForm
              onSubmit={onSubmitEdit}
              onCancel={onCancelEdit}
              initialValue={comment.content}
              placeholder="Edit your comment..."
              autoFocus
            />
          </div>
        ) : (
          <>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <UserBadge
                  user={{
                    id: comment.author.id,
                    name: comment.author.full_name,
                    role: getUserRole(),
                    avatarUrl: comment.author.avatar_url || undefined,
                  }}
                  size="sm"
                  showLocation={false}
                />
                <time
                  className="text-xs text-gray-500"
                  dateTime={comment.created_at}
                >
                  {new Date(comment.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </time>
              </div>

              <p className="text-gray-700 whitespace-pre-wrap mt-2">
                {comment.content}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-2 flex items-center gap-3">
              {/* Reply Button (only for top-level comments) */}
              {!isReply && onReply && currentUserId && (
                <button
                  onClick={onReply}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <MessageSquare className="h-4 w-4" />
                  Reply
                </button>
              )}

              {/* Edit Button (only for author) */}
              {currentUserId === comment.author.id && onStartEdit && onEdit && (
                <button
                  onClick={onStartEdit}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Edit
                </button>
              )}
            </div>
          </>
        )}

        {/* Reply Form */}
        {isReplying && onSubmitReply && onCancelReply && (
          <div className="mt-4">
            <CommentForm
              onSubmit={onSubmitReply}
              onCancel={onCancelReply}
              placeholder="Write a reply..."
              autoFocus
            />
          </div>
        )}
      </div>
    </div>
  )
}

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>
  onCancel?: () => void
  placeholder?: string
  autoFocus?: boolean
  initialValue?: string
}

function CommentForm({
  onSubmit,
  onCancel,
  placeholder = 'Add a comment...',
  autoFocus = false,
  initialValue = '',
}: CommentFormProps) {
  const [content, setContent] = React.useState(initialValue)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onSubmit(content)
      setContent('')
    } catch (error) {
      console.error('Failed to submit comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        disabled={isSubmitting}
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </form>
  )
}
