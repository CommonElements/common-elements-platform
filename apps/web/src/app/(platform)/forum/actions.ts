'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@repo/database/server'
import { createPostSchema } from '@repo/validations'

/**
 * Vote on a forum post
 * Handles upvote/downvote and vote removal
 */
export async function voteOnPost(postId: string, direction: 'up' | 'down') {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Must be authenticated to vote')
  }

  const voteValue = direction === 'up' ? 1 : -1

  // Check if user has already voted
  const { data: existingVote } = await supabase
    .from('forum_votes')
    .select('id, direction')
    .eq('user_id', user.id)
    .eq('votable_type', 'post')
    .eq('votable_id', postId)
    .single()

  if (existingVote) {
    if (existingVote.direction === voteValue) {
      // Remove vote if clicking same button
      await supabase.from('forum_votes').delete().eq('id', existingVote.id)
    } else {
      // Update vote if switching direction
      await supabase
        .from('forum_votes')
        .update({ direction: voteValue })
        .eq('id', existingVote.id)
    }
  } else {
    // Create new vote
    await supabase.from('forum_votes').insert({
      user_id: user.id,
      votable_type: 'post',
      votable_id: postId,
      direction: voteValue,
    })
  }

  revalidatePath(`/forum/${postId}`)
  revalidatePath('/forum')
}

/**
 * Vote on a forum comment
 * Handles upvote/downvote and vote removal
 */
export async function voteOnComment(
  commentId: string,
  direction: 'up' | 'down'
) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Must be authenticated to vote')
  }

  const voteValue = direction === 'up' ? 1 : -1

  // Check if user has already voted
  const { data: existingVote } = await supabase
    .from('forum_votes')
    .select('id, direction')
    .eq('user_id', user.id)
    .eq('votable_type', 'comment')
    .eq('votable_id', commentId)
    .single()

  if (existingVote) {
    if (existingVote.direction === voteValue) {
      // Remove vote if clicking same button
      await supabase.from('forum_votes').delete().eq('id', existingVote.id)
    } else {
      // Update vote if switching direction
      await supabase
        .from('forum_votes')
        .update({ direction: voteValue })
        .eq('id', existingVote.id)
    }
  } else {
    // Create new vote
    await supabase.from('forum_votes').insert({
      user_id: user.id,
      votable_type: 'comment',
      votable_id: commentId,
      direction: voteValue,
    })
  }

  // Revalidate the post page
  const { data: comment } = await supabase
    .from('forum_comments')
    .select('post_id')
    .eq('id', commentId)
    .single()

  if (comment) {
    revalidatePath(`/forum/${comment.post_id}`)
  }
}

/**
 * Create a new comment on a post
 */
export async function createComment(
  postId: string,
  content: string,
  parentCommentId?: string
) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Must be authenticated to comment')
  }

  if (!content.trim()) {
    throw new Error('Comment content is required')
  }

  const { error } = await supabase.from('forum_comments').insert({
    post_id: postId,
    author_id: user.id,
    content: content.trim(),
    parent_comment_id: parentCommentId || null,
  })

  if (error) {
    throw new Error(`Failed to create comment: ${error.message}`)
  }

  revalidatePath(`/forum/${postId}`)
  revalidatePath('/forum')
}

/**
 * Create a new forum post
 */
export async function createPost(data: {
  title: string
  content: string
  categoryId: string
}) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      errors: { general: 'Must be authenticated to create posts' },
    }
  }

  // Validate input
  const validation = createPostSchema.safeParse(data)
  if (!validation.success) {
    const errors: Record<string, string> = {}
    validation.error.issues.forEach((issue) => {
      const field = issue.path[0]
      if (field) {
        errors[field.toString()] = issue.message
      }
    })
    return { success: false, errors }
  }

  // Create post
  const { data: post, error } = await supabase
    .from('forum_posts')
    .insert({
      author_id: user.id,
      category_id: validation.data.categoryId,
      title: validation.data.title,
      content: validation.data.content,
    })
    .select('id')
    .single()

  if (error) {
    return {
      success: false,
      errors: { general: 'Failed to create post. Please try again.' },
    }
  }

  revalidatePath('/forum')
  return { success: true, postId: post.id }
}

/**
 * Update an existing forum post
 */
export async function updatePost(
  postId: string,
  data: {
    title: string
    content: string
    categoryId: string
  }
) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      errors: { general: 'Must be authenticated to edit posts' },
    }
  }

  // Check if user is the author
  const { data: post } = await supabase
    .from('forum_posts')
    .select('author_id')
    .eq('id', postId)
    .single()

  if (!post || post.author_id !== user.id) {
    return {
      success: false,
      errors: { general: 'You can only edit your own posts' },
    }
  }

  // Validate input
  const validation = createPostSchema.safeParse(data)
  if (!validation.success) {
    const errors: Record<string, string> = {}
    validation.error.issues.forEach((issue) => {
      const field = issue.path[0]
      if (field) {
        errors[field.toString()] = issue.message
      }
    })
    return { success: false, errors }
  }

  // Update post
  const { error } = await supabase
    .from('forum_posts')
    .update({
      category_id: validation.data.categoryId,
      title: validation.data.title,
      content: validation.data.content,
    })
    .eq('id', postId)

  if (error) {
    return {
      success: false,
      errors: { general: 'Failed to update post. Please try again.' },
    }
  }

  revalidatePath(`/forum/${postId}`)
  revalidatePath('/forum')
  return { success: true }
}

/**
 * Update an existing comment
 */
export async function updateComment(commentId: string, content: string) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Must be authenticated to edit comments')
  }

  // Check if user is the author
  const { data: comment } = await supabase
    .from('forum_comments')
    .select('author_id, post_id')
    .eq('id', commentId)
    .single()

  if (!comment || comment.author_id !== user.id) {
    throw new Error('You can only edit your own comments')
  }

  if (!content.trim()) {
    throw new Error('Comment content is required')
  }

  // Update comment
  const { error } = await supabase
    .from('forum_comments')
    .update({ content: content.trim() })
    .eq('id', commentId)

  if (error) {
    throw new Error(`Failed to update comment: ${error.message}`)
  }

  revalidatePath(`/forum/${comment.post_id}`)
}
