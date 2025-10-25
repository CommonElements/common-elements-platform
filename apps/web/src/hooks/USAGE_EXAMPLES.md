# React Query Usage Examples

This document provides examples of how to use the React Query hooks in your components.

## Basic Data Fetching

### Fetching Forum Posts (Client Component)

```typescript
'use client'

import { useForumPosts } from '@/hooks'

export function ForumPostsList({ categoryId }: { categoryId?: string }) {
  const { data: posts, isLoading, error } = useForumPosts({ categoryId, limit: 20 })

  if (isLoading) {
    return <PostsSkeleton />
  }

  if (error) {
    return <div>Error loading posts: {error.message}</div>
  }

  return (
    <div className="space-y-4">
      {posts?.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
```

### Fetching a Single Post

```typescript
'use client'

import { useForumPost } from '@/hooks'

export function PostDetail({ postId }: { postId: string }) {
  const { data: post, isLoading, error } = useForumPost(postId)

  if (isLoading) return <PostSkeleton />
  if (error) return <ErrorMessage error={error} />
  if (!post) return <NotFound />

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  )
}
```

## Optimistic Updates

### Voting on Posts

```typescript
'use client'

import { useVoteOnPost } from '@/hooks'
import { VoteButtons } from '@repo/ui'

export function PostVoteButtons({ 
  postId, 
  initialCount, 
  initialUserVote 
}: { 
  postId: string
  initialCount: number
  initialUserVote: 'up' | 'down' | null
}) {
  const voteMutation = useVoteOnPost(postId)

  const handleVote = async (direction: 'up' | 'down') => {
    await voteMutation.mutateAsync(direction)
  }

  return (
    <VoteButtons
      count={initialCount}
      userVote={initialUserVote}
      onVote={handleVote}
      disabled={voteMutation.isPending}
    />
  )
}
```

### Creating Comments

```typescript
'use client'

import { useCreateComment } from '@/hooks'
import { useState } from 'react'

export function CommentForm({ postId }: { postId: string }) {
  const [content, setContent] = useState('')
  const createComment = useCreateComment(postId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    await createComment.mutateAsync({ content })
    setContent('') // Clear form on success
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a comment..."
        disabled={createComment.isPending}
      />
      <button type="submit" disabled={createComment.isPending}>
        {createComment.isPending ? 'Posting...' : 'Post Comment'}
      </button>
      {createComment.error && (
        <p className="text-red-600">Error: {createComment.error.message}</p>
      )}
    </form>
  )
}
```

## Fetching RFPs

### RFP List with Filters

```typescript
'use client'

import { useRFPs } from '@/hooks'
import { useState } from 'react'

export function RFPList() {
  const [status, setStatus] = useState<string>()
  const [category, setCategory] = useState<string>()

  const { data: rfps, isLoading, isFetching } = useRFPs({
    status,
    category,
    limit: 20,
  })

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex gap-2">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
        
        {isFetching && <span>Updating...</span>}
      </div>

      {/* RFP List */}
      {isLoading ? (
        <RFPsSkeleton />
      ) : (
        <div className="space-y-4">
          {rfps?.map((rfp) => (
            <RFPCard key={rfp.id} rfp={rfp} />
          ))}
        </div>
      )}
    </div>
  )
}
```

### RFP Detail with Messages

```typescript
'use client'

import { useRFP, useRFPMessages } from '@/hooks'

export function RFPDetail({ rfpId }: { rfpId: string }) {
  const { data: rfp, isLoading: rfpLoading } = useRFP(rfpId)
  const { data: messages, isLoading: messagesLoading } = useRFPMessages(rfpId)

  if (rfpLoading) return <RFPSkeleton />

  return (
    <div>
      <h1>{rfp?.title}</h1>
      <p>{rfp?.description}</p>

      {/* Messages auto-refresh every 30 seconds */}
      <div className="mt-8">
        <h2>Messages</h2>
        {messagesLoading ? (
          <MessagesSkeleton />
        ) : (
          <MessagesList messages={messages} />
        )}
      </div>
    </div>
  )
}
```

## Creating and Updating Data

### Creating a Proposal

```typescript
'use client'

import { useCreateProposal } from '@/hooks'
import { useRouter } from 'next/navigation'

export function ProposalForm({ rfpId }: { rfpId: string }) {
  const router = useRouter()
  const createProposal = useCreateProposal(rfpId)

  const handleSubmit = async (data: ProposalData) => {
    try {
      const proposal = await createProposal.mutateAsync(data)
      router.push(`/rfps/${rfpId}/proposals/${proposal.id}`)
    } catch (error) {
      // Error is already logged, show user-friendly message
      alert('Failed to create proposal. Please try again.')
    }
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      handleSubmit({
        coverLetter: formData.get('coverLetter') as string,
        timeline: formData.get('timeline') as string,
        cost: parseFloat(formData.get('cost') as string),
        paymentTerms: formData.get('paymentTerms') as string,
      })
    }}>
      {/* Form fields */}
      <button type="submit" disabled={createProposal.isPending}>
        {createProposal.isPending ? 'Submitting...' : 'Submit Proposal'}
      </button>
    </form>
  )
}
```

## Advanced Patterns

### Dependent Queries

```typescript
'use client'

import { useRFP, useRFPProposals } from '@/hooks'

export function RFPWithProposals({ rfpId }: { rfpId: string }) {
  // First query
  const { data: rfp, isLoading: rfpLoading } = useRFP(rfpId)
  
  // Second query only runs if first succeeds
  const { data: proposals, isLoading: proposalsLoading } = useRFPProposals(rfpId)

  if (rfpLoading) return <Skeleton />

  return (
    <div>
      <h1>{rfp?.title}</h1>
      
      {proposalsLoading ? (
        <ProposalsSkeleton />
      ) : (
        <ProposalsList proposals={proposals} />
      )}
    </div>
  )
}
```

### Infinite Scroll (Future Enhancement)

```typescript
'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { getForumPosts } from '@repo/database'

export function InfinitePostsList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: queryKeys.forum.posts(),
    queryFn: ({ pageParam = 0 }) => 
      getForumPosts({ limit: 20, offset: pageParam }),
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.length < 20) return undefined
      return pages.length * 20
    },
    initialPageParam: 0,
  })

  return (
    <div>
      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ))}
      
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  )
}
```

## Error Handling

### Global Error Boundary

```typescript
'use client'

import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

export function QueryErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <h2 className="text-red-800 font-semibold">Something went wrong</h2>
              <p className="text-red-600">{error.message}</p>
              <button
                onClick={resetErrorBoundary}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
              >
                Try again
              </button>
            </div>
          )}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
```

## Best Practices

1. **Always handle loading and error states**
   ```typescript
   if (isLoading) return <Skeleton />
   if (error) return <ErrorMessage error={error} />
   if (!data) return <NotFound />
   ```

2. **Use optimistic updates for better UX**
   - Voting, commenting, and other instant feedback actions

3. **Invalidate related queries after mutations**
   - Already handled in mutation hooks

4. **Use appropriate stale times**
   - Frequently changing data: 1-2 minutes
   - Stable data: 5-10 minutes

5. **Show loading indicators during background refetches**
   ```typescript
   {isFetching && !isLoading && <span>Updating...</span>}
   ```

6. **Disable actions during mutations**
   ```typescript
   <button disabled={mutation.isPending}>
     {mutation.isPending ? 'Saving...' : 'Save'}
   </button>
   ```
