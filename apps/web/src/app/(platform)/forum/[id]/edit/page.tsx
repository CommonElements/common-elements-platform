import { notFound, redirect } from 'next/navigation'
import { getForumPost, getForumCategories } from '@repo/database'
import { createServerSupabaseClient } from '@repo/database/server'
import { EditPostForm } from './edit-post-form'

interface EditPostPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch post
  let post
  try {
    post = await getForumPost(id)
  } catch (error) {
    notFound()
  }

  // Check if user is the author
  if (post.author.id !== user.id) {
    redirect(`/forum/${id}`)
  }

  // Fetch categories
  const categories = await getForumCategories()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
        <p className="mt-2 text-gray-600">Update your post content</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <EditPostForm
          postId={id}
          initialData={{
            title: post.title,
            content: post.content,
            categoryId: post.category.id,
          }}
          categories={categories}
        />
      </div>
    </div>
  )
}
