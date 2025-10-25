'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RichTextEditor, FormFieldError, FormGeneralError, Spinner } from '@repo/ui'
import type { ForumCategory } from '@repo/database'
import { createPost } from '../actions'

interface PostFormProps {
  categories: ForumCategory[]
}

export function PostForm({ categories }: PostFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{
    title?: string
    content?: string
    categoryId?: string
    general?: string
  }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsSubmitting(true)

    try {
      const result = await createPost({ title, content, categoryId })

      if (result.success && result.postId) {
        router.push(`/forum/${result.postId}`)
      } else if (result.errors) {
        setErrors(result.errors)
      }
    } catch (error) {
      setErrors({
        general: 'Failed to create post. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-label="Create new forum post">
      <FormGeneralError error={errors.general} />

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Title <span className="text-red-500" aria-label="required">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={10}
          maxLength={200}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
            errors.title
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }`}
          placeholder="What's your post about?"
          disabled={isSubmitting}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error' : 'title-help'}
          aria-required="true"
        />
        <FormFieldError errors={errors} field="title" />
        {!errors.title && (
          <p id="title-help" className="mt-1 text-xs text-gray-500">
            Minimum 10 characters, maximum 200 characters
          </p>
        )}
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Category <span className="text-red-500" aria-label="required">*</span>
        </label>
        <select
          id="category"
          name="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
            errors.categoryId
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }`}
          disabled={isSubmitting}
          aria-invalid={!!errors.categoryId}
          aria-describedby={errors.categoryId ? 'category-error' : undefined}
          aria-required="true"
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <FormFieldError errors={errors} field="categoryId" />
      </div>

      {/* Content */}
      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Content <span className="text-red-500" aria-label="required">*</span>
        </label>
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Share your thoughts..."
          maxLength={10000}
          disabled={isSubmitting}
        />
        <FormFieldError errors={errors} field="content" />
        {!errors.content && (
          <p id="content-help" className="mt-1 text-xs text-gray-500">
            Minimum 20 characters, maximum 10,000 characters
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-h-[44px]"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !title || !content || !categoryId}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
        >
          {isSubmitting && <Spinner size="sm" className="text-white" />}
          {isSubmitting ? 'Creating...' : 'Create Post'}
        </button>
      </div>
    </form>
  )
}
