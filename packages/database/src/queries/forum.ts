/**
 * Forum-related database queries
 */

import { createServerSupabaseClient } from '../server'

export interface GetForumPostsOptions {
  categoryId?: string
  limit?: number
  offset?: number
  orderBy?: 'created_at' | 'vote_count' | 'comment_count'
  orderDirection?: 'asc' | 'desc'
}

export interface ForumPost {
  id: string
  title: string
  content: string
  vote_count: number
  comment_count: number
  view_count: number
  created_at: string
  updated_at: string
  author: {
    id: string
    full_name: string
    avatar_url: string | null
    account_type: string
  }
  category: {
    id: string
    name: string
    slug: string
    icon: string | null
  }
}

export interface ForumComment {
  id: string
  content: string
  vote_count: number
  created_at: string
  updated_at: string
  parent_comment_id: string | null
  author: {
    id: string
    full_name: string
    avatar_url: string | null
    account_type: string
  }
  replies?: ForumComment[]
}

export interface ForumCategory {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  sort_order: number
}

/**
 * Fetch forum posts with pagination and filters
 * Optimized to fetch only necessary columns and use efficient indexes
 */
export async function getForumPosts(options: GetForumPostsOptions = {}) {
  const {
    categoryId,
    limit = 20,
    offset = 0,
    orderBy = 'created_at',
    orderDirection = 'desc',
  } = options

  const supabase = await createServerSupabaseClient()

  // Build query with only necessary columns to reduce data transfer
  let query = supabase
    .from('forum_posts')
    .select(
      `
      id,
      title,
      content,
      vote_count,
      comment_count,
      view_count,
      created_at,
      author_id,
      category_id,
      author:users!forum_posts_author_id_fkey (
        id,
        full_name,
        avatar_url,
        account_type
      ),
      category:forum_categories!forum_posts_category_id_fkey (
        id,
        name,
        slug,
        icon
      )
    `,
      { count: 'exact' }
    )
    .order(orderBy, { ascending: orderDirection === 'asc' })
    .range(offset, offset + limit - 1)

  // Apply category filter if provided (uses idx_forum_posts_category_created index)
  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch forum posts: ${error.message}`)
  }

  return {
    posts: data as unknown as ForumPost[],
    total: count || 0,
  }
}

/**
 * Fetch a single forum post with author and category
 * Optimized to fetch only necessary columns
 */
export async function getForumPost(postId: string) {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('forum_posts')
    .select(
      `
      id,
      title,
      content,
      vote_count,
      comment_count,
      view_count,
      created_at,
      updated_at,
      author_id,
      category_id,
      author:users!forum_posts_author_id_fkey (
        id,
        full_name,
        avatar_url,
        account_type
      ),
      category:forum_categories!forum_posts_category_id_fkey (
        id,
        name,
        slug,
        icon
      )
    `
    )
    .eq('id', postId)
    .single()

  if (error) {
    throw new Error(`Failed to fetch forum post: ${error.message}`)
  }

  return data as unknown as ForumPost
}

/**
 * Fetch comments for a post with threading (one level)
 * Optimized with efficient index usage (idx_forum_comments_post_created)
 */
export async function getForumComments(postId: string) {
  const supabase = await createServerSupabaseClient()

  // Uses idx_forum_comments_post_created for efficient filtering and ordering
  const { data, error } = await supabase
    .from('forum_comments')
    .select(
      `
      id,
      content,
      vote_count,
      created_at,
      parent_comment_id,
      author_id,
      author:users!forum_comments_author_id_fkey (
        id,
        full_name,
        avatar_url,
        account_type
      )
    `
    )
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch forum comments: ${error.message}`)
  }

  const comments = data as unknown as ForumComment[]

  // Organize comments into threaded structure (one level) in memory
  // This is more efficient than multiple database queries
  const topLevelComments: ForumComment[] = []
  const commentMap = new Map<string, ForumComment>()

  // First pass: create map and identify top-level comments
  comments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, replies: [] })
    if (!comment.parent_comment_id) {
      topLevelComments.push(commentMap.get(comment.id)!)
    }
  })

  // Second pass: attach replies to parent comments
  comments.forEach((comment) => {
    if (comment.parent_comment_id) {
      const parent = commentMap.get(comment.parent_comment_id)
      if (parent) {
        parent.replies!.push(commentMap.get(comment.id)!)
      }
    }
  })

  return topLevelComments
}

/**
 * Fetch all forum categories
 */
export async function getForumCategories() {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('forum_categories')
    .select('id, name, slug, description, icon, sort_order')
    .order('sort_order', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch forum categories: ${error.message}`)
  }

  return data as ForumCategory[]
}
