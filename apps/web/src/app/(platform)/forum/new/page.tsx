import { redirect } from 'next/navigation'
import { getForumCategories } from '@repo/database'
import { createServerSupabaseClient } from '@repo/database/server'
import { PostForm } from './post-form'

export default async function NewPostPage() {
  const supabase = await createServerSupabaseClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch categories
  const categories = await getForumCategories()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create a Post</h1>
        <p className="mt-2 text-gray-600">
          Share your thoughts, questions, or experiences with the community
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <PostForm categories={categories} />
      </div>
    </div>
  )
}
