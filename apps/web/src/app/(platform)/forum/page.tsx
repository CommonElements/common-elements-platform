import Link from 'next/link'
import { Suspense } from 'react'
import {
  getForumPosts,
  getForumCategories,
  type ForumPost,
  type ForumCategory,
} from '@repo/database'
import { UserBadge } from '@repo/ui'
import { MessageSquare, ChevronUp } from 'lucide-react'

interface ForumPageProps {
  searchParams: Promise<{
    category?: string
    page?: string
  }>
}

export default async function ForumPage({ searchParams }: ForumPageProps) {
  const { category, page } = await searchParams

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">The Common Area</h1>
        <Link
          href="/forum/new"
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-h-[44px]"
        >
          Create Post
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8">
        {/* Categories Sidebar */}
        <aside className="lg:col-span-1 order-2 lg:order-1">
          <Suspense fallback={<CategoriesSkeleton />}>
            <CategoriesList selectedCategory={category} />
          </Suspense>
        </aside>

        {/* Posts Feed */}
        <main className="lg:col-span-3 order-1 lg:order-2">
          <Suspense fallback={<PostsSkeleton />}>
            <PostsList
              categoryId={category}
              page={page ? parseInt(page) : 1}
            />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

async function CategoriesList({
  selectedCategory,
}: {
  selectedCategory?: string
}) {
  const categories = await getForumCategories()

  return (
    <nav className="bg-white rounded-lg shadow p-4" aria-label="Forum categories">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
      <div className="space-y-1">
        <Link
          href="/forum"
          className={`block px-3 py-2 rounded-md text-sm font-medium ${
            !selectedCategory
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
          aria-current={!selectedCategory ? 'page' : undefined}
        >
          All Posts
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/forum?category=${category.id}`}
            className={`block px-3 py-2 rounded-md text-sm font-medium ${
              selectedCategory === category.id
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            aria-current={selectedCategory === category.id ? 'page' : undefined}
          >
            <div className="flex items-center gap-2">
              {category.icon && <span aria-hidden="true">{category.icon}</span>}
              <span>{category.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </nav>
  )
}

async function PostsList({
  categoryId,
  page,
}: {
  categoryId?: string
  page: number
}) {
  const postsPerPage = 20
  const offset = (page - 1) * postsPerPage

  const { posts, total } = await getForumPosts({
    categoryId,
    limit: postsPerPage,
    offset,
    orderBy: 'created_at',
    orderDirection: 'desc',
  })

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">
          No posts yet. Be the first to start a discussion!
        </p>
      </div>
    )
  }

  const totalPages = Math.ceil(total / postsPerPage)
  const hasNextPage = page < totalPages

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          {page > 1 && (
            <Link
              href={`/forum?${categoryId ? `category=${categoryId}&` : ''}page=${page - 1}`}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          {hasNextPage && (
            <Link
              href={`/forum?${categoryId ? `category=${categoryId}&` : ''}page=${page + 1}`}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

function PostCard({ post }: { post: ForumPost }) {
  // Get user role or company for badge
  const getUserRole = () => {
    if (post.author.account_type === 'vendor') {
      // For vendors, we'd need to fetch vendor profile, but for now use account type
      return 'Vendor'
    }
    // For community members, we'd need to fetch community profile
    return 'Community Member'
  }

  return (
    <Link href={`/forum/${post.id}`} aria-label={`View post: ${post.title}`}>
      <article className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 sm:p-6">
        <div className="flex gap-3 sm:gap-4">
          {/* Vote Count Display */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0" aria-label={`${post.vote_count} votes`}>
            <ChevronUp className="h-5 w-5 text-gray-400" aria-hidden="true" />
            <span className="text-sm font-semibold text-gray-700">
              {post.vote_count}
            </span>
          </div>

          {/* Post Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-3">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 hover:text-blue-600">
                {post.title}
              </h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0 self-start">
                {post.category.name}
              </span>
            </div>

            {/* Post Preview */}
            <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-2">{post.content}</p>

            {/* Post Meta */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <UserBadge
                user={{
                  id: post.author.id,
                  name: post.author.full_name,
                  role: getUserRole(),
                  avatarUrl: post.author.avatar_url || undefined,
                }}
                size="sm"
                showLocation={false}
              />

              <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center gap-1" aria-label={`${post.comment_count} comments`}>
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  <span>{post.comment_count}</span>
                </div>
                <time dateTime={post.created_at} className="hidden sm:inline">
                  {new Date(post.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </time>
                <time dateTime={post.created_at} className="sm:hidden">
                  {new Date(post.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}

function CategoriesSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="h-6 bg-gray-200 rounded w-24 mb-4 animate-pulse" />
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    </div>
  )
}

function PostsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-6">
          <div className="flex gap-4">
            <div className="w-12 flex flex-col items-center gap-2">
              <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
              <div className="h-4 bg-gray-100 rounded w-5/6 animate-pulse" />
              <div className="flex items-center justify-between mt-4">
                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
