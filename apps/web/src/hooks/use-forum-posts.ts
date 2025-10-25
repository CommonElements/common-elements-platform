'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { getForumPosts, getForumPost } from '@repo/database'

/**
 * Hook to fetch forum posts with pagination
 */
export function useForumPosts(params?: {
  categoryId?: string
  limit?: number
  offset?: number
}) {
  return useQuery({
    queryKey: params?.categoryId
      ? queryKeys.forum.postsByCategory(params.categoryId)
      : queryKeys.forum.posts(),
    queryFn: () => getForumPosts(params),
    staleTime: 2 * 60 * 1000, // 2 minutes - forum posts change frequently
  })
}

/**
 * Hook to fetch a single forum post with details
 */
export function useForumPost(postId: string) {
  return useQuery({
    queryKey: queryKeys.forum.post(postId),
    queryFn: () => getForumPost(postId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch comments for a post
 */
export function usePostComments(postId: string) {
  return useQuery({
    queryKey: queryKeys.forum.postComments(postId),
    queryFn: async () => {
      // This would be implemented in the database package
      // For now, return empty array as placeholder
      return []
    },
    staleTime: 1 * 60 * 1000, // 1 minute - comments change frequently
  })
}
