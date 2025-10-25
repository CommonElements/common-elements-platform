'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'

interface CreateCommentParams {
  postId: string
  content: string
  parentCommentId?: string
}

interface UpdateCommentParams {
  commentId: string
  content: string
}

/**
 * Hook for creating comments with optimistic updates
 */
export function useCreateComment(postId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { content: string; parentCommentId?: string }) => {
      // This would call a server action
      // For now, return a placeholder
      return {
        id: `temp-${Date.now()}`,
        content: params.content,
        vote_count: 0,
        created_at: new Date().toISOString(),
        author: {
          id: 'current-user',
          full_name: 'Current User',
          avatar_url: null,
          account_type: 'community_member',
        },
        userVote: null,
      }
    },

    // Optimistic update
    onMutate: async (params) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.forum.postComments(postId) })

      // Snapshot previous value
      const previousComments = queryClient.getQueryData(queryKeys.forum.postComments(postId))

      // Create optimistic comment
      const optimisticComment = {
        id: `temp-${Date.now()}`,
        content: params.content,
        vote_count: 0,
        created_at: new Date().toISOString(),
        author: {
          id: 'current-user',
          full_name: 'Current User',
          avatar_url: null,
          account_type: 'community_member',
        },
        userVote: null,
        parent_comment_id: params.parentCommentId,
      }

      // Optimistically update the cache
      queryClient.setQueryData(queryKeys.forum.postComments(postId), (old: any) => {
        if (!old || !Array.isArray(old)) return [optimisticComment]

        if (params.parentCommentId) {
          // Add as reply to parent comment
          return old.map((comment: any) => {
            if (comment.id === params.parentCommentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), optimisticComment],
              }
            }
            return comment
          })
        } else {
          // Add as top-level comment
          return [...old, optimisticComment]
        }
      })

      // Update comment count on post
      queryClient.setQueryData(queryKeys.forum.post(postId), (old: any) => {
        if (!old) return old
        return {
          ...old,
          comment_count: old.comment_count + 1,
        }
      })

      return { previousComments }
    },

    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          queryKeys.forum.postComments(postId),
          context.previousComments
        )
      }
    },

    // Refetch after success or error
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forum.postComments(postId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.forum.post(postId) })
    },
  })
}

/**
 * Hook for updating comments with optimistic updates
 */
export function useUpdateComment(postId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: UpdateCommentParams) => {
      // This would call a server action
      // For now, return the params
      return params
    },

    // Optimistic update
    onMutate: async (params) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.forum.postComments(postId) })

      // Snapshot previous value
      const previousComments = queryClient.getQueryData(queryKeys.forum.postComments(postId))

      // Optimistically update the cache
      queryClient.setQueryData(queryKeys.forum.postComments(postId), (old: any) => {
        if (!old || !Array.isArray(old)) return old

        return old.map((comment: any) => {
          if (comment.id === params.commentId) {
            return {
              ...comment,
              content: params.content,
              updated_at: new Date().toISOString(),
            }
          }

          // Check replies
          if (comment.replies && Array.isArray(comment.replies)) {
            return {
              ...comment,
              replies: comment.replies.map((reply: any) => {
                if (reply.id === params.commentId) {
                  return {
                    ...reply,
                    content: params.content,
                    updated_at: new Date().toISOString(),
                  }
                }
                return reply
              }),
            }
          }

          return comment
        })
      })

      return { previousComments }
    },

    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          queryKeys.forum.postComments(postId),
          context.previousComments
        )
      }
    },

    // Refetch after success or error
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forum.postComments(postId) })
    },
  })
}
