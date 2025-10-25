'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { voteOnPost, voteOnComment } from '@/app/(platform)/forum/actions'

interface VoteContext {
  previousVoteCount?: number
  previousUserVote?: 'up' | 'down' | null
}

/**
 * Hook for voting on posts with optimistic updates
 */
export function useVoteOnPost(postId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (direction: 'up' | 'down') => voteOnPost(postId, direction),
    
    // Optimistic update
    onMutate: async (direction) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.forum.post(postId) })

      // Snapshot previous value
      const previousPost = queryClient.getQueryData(queryKeys.forum.post(postId))

      // Optimistically update the cache
      queryClient.setQueryData(queryKeys.forum.post(postId), (old: any) => {
        if (!old) return old

        const currentVote = old.userVote
        let voteDelta = 0

        if (currentVote === direction) {
          // Removing vote
          voteDelta = direction === 'up' ? -1 : 1
          return {
            ...old,
            vote_count: old.vote_count + voteDelta,
            userVote: null,
          }
        } else if (currentVote) {
          // Switching vote
          voteDelta = direction === 'up' ? 2 : -2
          return {
            ...old,
            vote_count: old.vote_count + voteDelta,
            userVote: direction,
          }
        } else {
          // New vote
          voteDelta = direction === 'up' ? 1 : -1
          return {
            ...old,
            vote_count: old.vote_count + voteDelta,
            userVote: direction,
          }
        }
      })

      return { previousPost }
    },

    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(queryKeys.forum.post(postId), context.previousPost)
      }
    },

    // Refetch after success or error
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forum.post(postId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.forum.posts() })
    },
  })
}

/**
 * Hook for voting on comments with optimistic updates
 */
export function useVoteOnComment(commentId: string, postId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (direction: 'up' | 'down') => voteOnComment(commentId, direction),
    
    // Optimistic update
    onMutate: async (direction) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.forum.postComments(postId) })

      // Snapshot previous value
      const previousComments = queryClient.getQueryData(queryKeys.forum.postComments(postId))

      // Optimistically update the cache
      queryClient.setQueryData(queryKeys.forum.postComments(postId), (old: any) => {
        if (!old || !Array.isArray(old)) return old

        return old.map((comment: any) => {
          if (comment.id !== commentId) return comment

          const currentVote = comment.userVote
          let voteDelta = 0

          if (currentVote === direction) {
            // Removing vote
            voteDelta = direction === 'up' ? -1 : 1
            return {
              ...comment,
              vote_count: comment.vote_count + voteDelta,
              userVote: null,
            }
          } else if (currentVote) {
            // Switching vote
            voteDelta = direction === 'up' ? 2 : -2
            return {
              ...comment,
              vote_count: comment.vote_count + voteDelta,
              userVote: direction,
            }
          } else {
            // New vote
            voteDelta = direction === 'up' ? 1 : -1
            return {
              ...comment,
              vote_count: comment.vote_count + voteDelta,
              userVote: direction,
            }
          }
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
