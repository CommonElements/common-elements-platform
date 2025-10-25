import { z } from 'zod'

/**
 * Forum post schemas
 */

export const createPostSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must be less than 200 characters'),
  content: z
    .string()
    .min(20, 'Content must be at least 20 characters')
    .max(10000, 'Content must be less than 10,000 characters'),
  categoryId: z.string().uuid('Invalid category'),
})

export const updatePostSchema = createPostSchema.partial()

/**
 * Forum comment schemas
 */

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(5000, 'Comment must be less than 5,000 characters'),
  postId: z.string().uuid('Invalid post'),
  parentCommentId: z.string().uuid().optional(),
})

export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(5000, 'Comment must be less than 5,000 characters'),
})

/**
 * Forum vote schemas
 */

export const voteSchema = z.object({
  votableType: z.enum(['post', 'comment']),
  votableId: z.string().uuid('Invalid ID'),
  direction: z.enum(['up', 'down']),
})

export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
export type CreateCommentInput = z.infer<typeof createCommentSchema>
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>
export type VoteInput = z.infer<typeof voteSchema>
