# Database Query Optimization Guide

This document describes the database query optimizations implemented in the Common Elements platform.

## Overview

The optimization strategy focuses on:
1. **Efficient Indexing**: Composite and partial indexes for common query patterns
2. **Selective Column Fetching**: Only fetch columns that are actually needed
3. **Pagination with Total Counts**: Accurate pagination without extra queries
4. **Index-Aware Queries**: Structure queries to leverage existing indexes

## Database Indexes

### Composite Indexes

These indexes optimize queries that filter and sort on multiple columns:

```sql
-- Forum posts filtered by category and sorted by date
idx_forum_posts_category_created (category_id, created_at DESC)

-- Forum posts filtered by category and sorted by votes
idx_forum_posts_category_votes (category_id, vote_count DESC)

-- Forum comments for a post, sorted by date
idx_forum_comments_post_created (post_id, created_at ASC)

-- RFPs filtered by status and visibility
idx_rfps_status_visibility (status, visibility)

-- RFPs filtered by category and status
idx_rfps_category_status (category, status)

-- RFPs filtered by visibility and sorted by date
idx_rfps_visibility_created (visibility, created_at DESC)

-- Proposals filtered by status and sorted by date
idx_proposals_status_created (status, created_at DESC)
```

### Covering Indexes

These indexes include commonly selected columns to avoid table lookups:

```sql
-- Forum posts list with commonly displayed fields
idx_forum_posts_list_covering (created_at DESC, category_id)
  INCLUDE (title, vote_count, comment_count, view_count, author_id)

-- RFPs list with commonly displayed fields
idx_rfps_list_covering (created_at DESC, status, visibility)
  INCLUDE (title, category, proposal_count, deadline, creator_id)
```

### Partial Indexes

These indexes only include rows matching specific conditions for faster queries:

```sql
-- Open RFPs only (most common filter)
idx_rfps_open (created_at DESC) WHERE status = 'open'

-- Public RFPs only
idx_rfps_public (created_at DESC) WHERE visibility = 'public'

-- Pending vendor approvals
idx_rfp_approved_vendors_pending (rfp_id, requested_at DESC) WHERE status = 'pending'

-- Submitted proposals
idx_proposals_submitted (rfp_id, created_at DESC) WHERE status = 'submitted'

-- Unread messages (very efficient for counts)
idx_rfp_messages_recipient_unread (recipient_id, read_at) WHERE read_at IS NULL
```

## Query Optimization Patterns

### 1. Selective Column Fetching

**Before:**
```typescript
.select('*')  // Fetches all columns
```

**After:**
```typescript
.select(`
  id,
  title,
  created_at,
  author_id,
  author:users!forum_posts_author_id_fkey (
    id,
    full_name,
    avatar_url
  )
`)  // Only fetch needed columns
```

**Benefits:**
- Reduces data transfer over network
- Faster query execution
- Lower memory usage

### 2. Pagination with Total Counts

**Before:**
```typescript
const posts = await getForumPosts({ limit: 20, offset: 0 })
// No way to know total count or total pages
```

**After:**
```typescript
const { posts, total } = await getForumPosts({ limit: 20, offset: 0 })
const totalPages = Math.ceil(total / 20)
const hasNextPage = currentPage < totalPages
```

**Benefits:**
- Accurate pagination controls
- Better UX with page numbers
- Single query for data + count

### 3. Index-Aware Query Structure

**Example: Forum Posts by Category**

```typescript
// This query uses idx_forum_posts_category_created
const { posts, total } = await getForumPosts({
  categoryId: 'abc-123',  // Filter first
  orderBy: 'created_at',  // Then sort
  orderDirection: 'desc',
  limit: 20,
  offset: 0
})
```

The query planner will use the composite index `idx_forum_posts_category_created` because:
1. We filter by `category_id` (first column in index)
2. We sort by `created_at DESC` (second column in index)
3. The index covers both operations efficiently

### 4. Avoiding N+1 Queries

**Before (N+1 Problem):**
```typescript
// 1 query for posts
const posts = await getPosts()

// N queries for authors (one per post)
for (const post of posts) {
  const author = await getUser(post.author_id)
}
```

**After (Single Query with Joins):**
```typescript
// 1 query with join
const posts = await supabase
  .from('forum_posts')
  .select(`
    *,
    author:users!forum_posts_author_id_fkey (
      id,
      full_name,
      avatar_url
    )
  `)
```

**Benefits:**
- Reduces database round trips from N+1 to 1
- Much faster for lists
- Lower database load

## Query Function Optimizations

### Forum Queries

#### `getForumPosts()`
- Uses `idx_forum_posts_category_created` for filtered queries
- Uses `idx_forum_posts_list_covering` for unfiltered queries
- Returns total count for accurate pagination
- Fetches only necessary columns

#### `getForumComments()`
- Uses `idx_forum_comments_post_created` for efficient filtering and sorting
- Organizes threading in memory (single query vs multiple)
- Fetches only necessary columns

### RFP Queries

#### `getRFPs()`
- Uses `idx_rfps_status_visibility` when filtering by both
- Uses `idx_rfps_category_status` when filtering by category
- Uses `idx_rfps_open` or `idx_rfps_public` for common filters
- Returns total count for accurate pagination

#### `getProposals()`
- Uses `idx_proposals_rfp` for efficient filtering
- Uses `idx_proposals_submitted` for submitted proposals
- Fetches only necessary columns

#### `getUnreadMessageCount()`
- Uses `idx_rfp_messages_recipient_unread` partial index
- Extremely fast count query (index-only scan)
- No table access needed

### User Queries

#### `getUserPosts()` and `getUserComments()`
- Use `idx_forum_posts_author` and `idx_forum_comments_author`
- Efficient filtering by author
- Limited result sets for profile pages

## Performance Metrics

### Expected Query Performance

| Query Type | Rows | Before | After | Improvement |
|------------|------|--------|-------|-------------|
| Forum posts list | 20 | ~50ms | ~10ms | 5x faster |
| RFPs list (filtered) | 20 | ~60ms | ~12ms | 5x faster |
| Unread message count | N/A | ~30ms | ~2ms | 15x faster |
| Post comments | 50 | ~40ms | ~15ms | 2.7x faster |
| Proposals list | 10 | ~35ms | ~10ms | 3.5x faster |

*Note: Actual performance depends on database size and server load*

### Index Usage Verification

To verify indexes are being used, run EXPLAIN ANALYZE:

```sql
EXPLAIN ANALYZE
SELECT id, title, created_at
FROM forum_posts
WHERE category_id = 'abc-123'
ORDER BY created_at DESC
LIMIT 20;
```

Look for:
- `Index Scan using idx_forum_posts_category_created`
- Low execution time (< 10ms for small datasets)
- No sequential scans on large tables

## Best Practices

### 1. Always Use Pagination
```typescript
// Good
const { posts, total } = await getForumPosts({ limit: 20, offset: 0 })

// Bad - fetches all rows
const posts = await getForumPosts()
```

### 2. Fetch Only Needed Columns
```typescript
// Good
.select('id, title, created_at')

// Bad - fetches everything
.select('*')
```

### 3. Use Composite Indexes
```typescript
// Good - uses idx_rfps_status_visibility
.eq('status', 'open')
.eq('visibility', 'public')

// Less efficient - may use only one index
.eq('visibility', 'public')
.eq('status', 'open')
```

### 4. Leverage Partial Indexes
```typescript
// Good - uses idx_rfps_open partial index
.eq('status', 'open')
.order('created_at', { ascending: false })

// Good - uses idx_rfp_messages_recipient_unread
.eq('recipient_id', userId)
.is('read_at', null)
```

### 5. Avoid Over-Fetching Relations
```typescript
// Good - only fetch needed user fields
author:users!forum_posts_author_id_fkey (
  id,
  full_name,
  avatar_url
)

// Bad - fetches all user fields
author:users!forum_posts_author_id_fkey (*)
```

## Monitoring and Maintenance

### Regular Maintenance Tasks

1. **Update Statistics** (weekly):
```sql
ANALYZE forum_posts;
ANALYZE rfps;
ANALYZE proposals;
```

2. **Check Index Usage** (monthly):
```sql
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY schemaname, tablename;
```

3. **Monitor Slow Queries** (continuous):
```sql
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 20;
```

### Performance Degradation Signs

Watch for:
- Query times increasing over time
- Sequential scans on large tables
- High database CPU usage
- Slow page load times

### Optimization Checklist

- [ ] All list queries use pagination (limit + offset)
- [ ] All queries fetch only necessary columns
- [ ] Composite indexes exist for common filter + sort patterns
- [ ] Partial indexes exist for common WHERE conditions
- [ ] No N+1 query patterns in code
- [ ] Total counts returned for pagination
- [ ] EXPLAIN ANALYZE shows index usage
- [ ] Query times < 50ms for typical operations

## Future Optimizations

Potential improvements for Phase 2:

1. **Materialized Views**: Pre-compute expensive aggregations
2. **Full-Text Search**: Add GIN indexes for text search
3. **Query Caching**: Cache frequently accessed data
4. **Connection Pooling**: Optimize database connections
5. **Read Replicas**: Separate read and write workloads

## References

- [PostgreSQL Index Types](https://www.postgresql.org/docs/current/indexes-types.html)
- [Supabase Performance Guide](https://supabase.com/docs/guides/database/performance)
- [Query Optimization Best Practices](https://www.postgresql.org/docs/current/performance-tips.html)
