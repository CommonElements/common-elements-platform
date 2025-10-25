import { notFound } from 'next/navigation'
import { getForumPost, getForumComments } from '@repo/database'
import { createServerSupabaseClient } from '@repo/database/server'
import { UserBadge } from '@repo/ui'
import { VoteButtonsWrapper } from './vote-buttons-wrapper'
import { CommentsWrapper } from './comments-wrapper'
import { MessageSquare, Eye } from 'lucide-react'

interface PostPageProps {
  params: {
    id: string
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = params

  // Fetch post and increment view count
  let post
  try {
    post = await getForumPost(id)
  } catch (error) {
    notFound()
  }

  // Increment view count
  const supabase = await createServerSupabaseClient()
  await supabase
    .from('forum_posts')
    .update({ view_count: post.view_count + 1 })
    .eq('id', id)

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch comments
  const comments = await getForumComments(id)

  // Get current user's vote on post
  let userVote: 'up' | 'down' | null = null
  if (user) {
    const { data: voteData } = await supabase
      .from('forum_votes')
      .select('direction')
      .eq('user_id', user.id)
      .eq('votable_type', 'post')
      .eq('votable_id', id)
      .single()

    if (voteData) {
      userVote = voteData.direction === 1 ? 'up' : 'down'
    }

    // Get user's votes on comments
    const commentIds = comments.flatMap((c) => [
      c.id,
      ...(c.replies?.map((r) => r.id) || []),
    ])

    if (commentIds.length > 0) {
      const { data: commentVotes } = await supabase
        .from('forum_votes')
        .select('votable_id, direction')
        .eq('user_id', user.id)
        .eq('votable_type', 'comment')
        .in('votable_id', commentIds)

      if (commentVotes) {
        const voteMap = new Map(
          commentVotes.map((v) => [
            v.votable_id,
            v.direction === 1 ? 'up' : 'down',
          ])
        )

        // Add user votes to comments
        comments.forEach((comment) => {
          comment.userVote = voteMap.get(comment.id) || null
          comment.replies?.forEach((reply) => {
            reply.userVote = voteMap.get(reply.id) || null
          })
        })
      }
    }
  }

  // Get user role or company for badge
  const getUserRole = () => {
    if (post.author.account_type === 'vendor') {
      return 'Vendor'
    }
    return 'Community Member'
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link */}
      <a
        href="/forum"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        ← Back to Forum
      </a>

      {/* Post Header */}
      <article className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start gap-4 mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {post.category.name}
            </span>
          </div>

          <div className="flex items-start justify-between gap-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 flex-1">
              {post.title}
            </h1>
            {user && post.author.id === user.id && (
              <a
                href={`/forum/${id}/edit`}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Edit
              </a>
            )}
          </div>

          <div className="flex items-center justify-between">
            <UserBadge
              user={{
                id: post.author.id,
                name: post.author.full_name,
                role: getUserRole(),
                avatarUrl: post.author.avatar_url || undefined,
              }}
              size="md"
              showLocation={false}
            />

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{post.view_count + 1}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{post.comment_count}</span>
              </div>
              <time dateTime={post.created_at}>
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </time>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-6">
            {/* Vote Buttons */}
            <div className="flex-shrink-0">
              <VoteButtonsWrapper
                postId={id}
                initialCount={post.vote_count}
                initialUserVote={userVote}
                votableType="post"
              />
            </div>

            {/* Content */}
            <div className="flex-1 prose prose-gray max-w-none">
              <div
                className="text-gray-700 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {post.comment_count} {post.comment_count === 1 ? 'Comment' : 'Comments'}
          </h2>

          <CommentsWrapper
            postId={id}
            comments={comments}
            currentUserId={user?.id}
          />
        </div>
      </article>
    </div>
  )
}
