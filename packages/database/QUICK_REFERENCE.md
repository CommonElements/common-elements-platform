# Database Query Quick Reference

## Common Query Patterns

### Forum Posts

```typescript
// Get paginated forum posts
const { posts, total } = await getForumPosts({
  categoryId: 'optional-category-id',
  limit: 20,
  offset: 0,
  orderBy: 'created_at', // or 'vote_count', 'comment_count'
  orderDirection: 'desc'
})

// Calculate pagination
const totalPages = Math.ceil(total / 20)
const hasNextPage = currentPage < totalPages

// Get single post with author and category
const post = await getForumPost(postId)

// Get comments for a post (with threading)
const comments = await getForumComments(postId)

// Get all categories
const categories = await getForumCategories()
```

### RFPs

```typescript
// Get paginated RFPs with filters
const { rfps, total } = await getRFPs({
  status: 'open', // optional
  category: 'Landscaping', // optional
  visibility: 'public', // optional
  limit: 20,
  offset: 0
})

// Get single RFP
const rfp = await getRFP(rfpId)

// Get private details (respects RLS)
const privateDetails = await getRFPPrivateDetails(rfpId)
// Returns null if user doesn't have access

// Get proposals for an RFP
const proposals = await getProposals(rfpId)

// Get single proposal
const proposal = await getProposal(proposalId)

// Get messages for an RFP
const messages = await getRFPMessages(rfpId)

// Get unread message count (very fast)
const unreadCount = await getUnreadMessageCount(userId)

// Get unread messages grouped by RFP
const unreadByRFP = await getUnreadMessagesByRFP(userId)

// Get pending vendor approvals
const pendingApprovals = await getPendingVendorApprovals(userId)
```

### Users

```typescript
// Get user profile (includes community or vendor profile)
const profile = await getUserProfile(userId)

// Get user's posts
const posts = await getUserPosts(userId, limit)

// Get user's comments
const comments = await getUserComments(userId, limit)

// Get vendor profile only
const vendorProfile = await getVendorProfile(userId)

// Get community profile only
const communityProfile = await getCommunityProfile(userId)
```

## Pagination Pattern

All list queries now return `{ items, total }`:

```typescript
// In your page component
async function MyList({ page }: { page: number }) {
  const itemsPerPage = 20
  const offset = (page - 1) * itemsPerPage
  
  const { items, total } = await getItems({
    limit: itemsPerPage,
    offset
  })
  
  const totalPages = Math.ceil(total / itemsPerPage)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1
  
  return (
    <>
      {items.map(item => <ItemCard key={item.id} item={item} />)}
      
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          hasNext={hasNextPage}
          hasPrev={hasPrevPage}
        />
      )}
    </>
  )
}
```

## Index Usage

These queries are optimized to use specific indexes:

| Query | Index Used |
|-------|-----------|
| `getForumPosts({ categoryId })` | `idx_forum_posts_category_created` |
| `getForumPosts()` | `idx_forum_posts_list_covering` |
| `getForumComments(postId)` | `idx_forum_comments_post_created` |
| `getRFPs({ status, visibility })` | `idx_rfps_status_visibility` |
| `getRFPs({ status: 'open' })` | `idx_rfps_open` (partial) |
| `getRFPs({ visibility: 'public' })` | `idx_rfps_public` (partial) |
| `getProposals(rfpId)` | `idx_proposals_rfp` |
| `getUnreadMessageCount(userId)` | `idx_rfp_messages_recipient_unread` |
| `getUserPosts(userId)` | `idx_forum_posts_author` |
| `getUserComments(userId)` | `idx_forum_comments_author` |

## Performance Tips

### ✅ DO

```typescript
// Fetch only needed columns
const { posts, total } = await getForumPosts({ limit: 20 })

// Use pagination
const offset = (page - 1) * limit

// Use composite filters (uses composite indexes)
const { rfps } = await getRFPs({ 
  status: 'open', 
  visibility: 'public' 
})

// Fetch relations in single query
const post = await getForumPost(postId) // Includes author and category
```

### ❌ DON'T

```typescript
// Don't fetch all rows
const { posts } = await getForumPosts() // Missing limit!

// Don't fetch in loops (N+1 problem)
for (const post of posts) {
  const author = await getUser(post.author_id) // BAD!
}

// Don't fetch unnecessary data
.select('*') // Fetches everything

// Don't skip pagination
const allPosts = await getAllPosts() // Fetches thousands of rows
```

## Common Patterns

### Server Component with Pagination

```typescript
export default async function PostsPage({ 
  searchParams 
}: { 
  searchParams: { page?: string } 
}) {
  const page = parseInt(searchParams.page || '1')
  const { posts, total } = await getForumPosts({
    limit: 20,
    offset: (page - 1) * 20
  })
  
  return <PostsList posts={posts} total={total} page={page} />
}
```

### Client Component with Optimistic Updates

```typescript
'use client'

export function VoteButton({ postId, initialCount }: Props) {
  const [count, setCount] = useState(initialCount)
  
  const handleVote = async () => {
    // Optimistic update
    setCount(prev => prev + 1)
    
    try {
      await voteOnPost(postId, 'up')
    } catch (error) {
      // Rollback on error
      setCount(prev => prev - 1)
    }
  }
  
  return <button onClick={handleVote}>{count}</button>
}
```

### Conditional Rendering Based on Access

```typescript
export default async function RFPPage({ params }: Props) {
  const rfp = await getRFP(params.id)
  const privateDetails = await getRFPPrivateDetails(params.id)
  
  return (
    <>
      <RFPHeader rfp={rfp} />
      
      {privateDetails ? (
        <PrivateDetails details={privateDetails} />
      ) : (
        <RequestAccessButton rfpId={rfp.id} />
      )}
    </>
  )
}
```

## Troubleshooting

### Slow Queries

1. Check if indexes are being used:
```sql
EXPLAIN ANALYZE SELECT * FROM forum_posts WHERE category_id = '...' ORDER BY created_at DESC LIMIT 20;
```

2. Look for "Seq Scan" (bad) vs "Index Scan" (good)

3. Update statistics if needed:
```sql
ANALYZE forum_posts;
```

### Missing Data

1. Check RLS policies - they may be filtering data
2. Verify user has correct permissions
3. Check if data exists in database

### Type Errors

1. Regenerate types after schema changes:
```bash
supabase gen types typescript --local > packages/database/src/types.ts
```

2. Restart TypeScript server in your editor

## Migration Checklist

When adding new queries:

- [ ] Add appropriate indexes for filters and sorts
- [ ] Fetch only necessary columns
- [ ] Return total count for pagination
- [ ] Add comments explaining index usage
- [ ] Test with EXPLAIN ANALYZE
- [ ] Update this documentation
