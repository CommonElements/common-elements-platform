# React Query Setup

This document describes the React Query implementation for data fetching and state management.

## Configuration

### Provider Setup
The `ReactQueryProvider` is configured in `src/lib/react-query.tsx` and wraps the entire application in `app/layout.tsx`.

**Default Settings:**
- **Stale Time**: 5 minutes (data considered fresh for 5 minutes)
- **GC Time**: 10 minutes (unused data kept in cache for 10 minutes)
- **Retry**: 1 attempt for failed requests
- **Refetch on Window Focus**: Enabled (ensures fresh data when user returns)
- **Refetch on Mount**: Disabled if data is fresh

### Query Keys
Query keys are centralized in `src/lib/query-keys.ts` using factory functions:

```typescript
// Example usage
queryKeys.forum.post('post-id')
queryKeys.rfps.list({ status: 'open' })
queryKeys.proposals.detail('proposal-id')
```

## Custom Hooks

### Forum Hooks

**`useForumPosts(params?)`**
- Fetches forum posts with optional filters
- Stale time: 2 minutes
- Supports pagination and category filtering

**`useForumPost(postId)`**
- Fetches a single post with details
- Stale time: 5 minutes

**`usePostComments(postId)`**
- Fetches comments for a post
- Stale time: 1 minute (comments change frequently)

### RFP Hooks

**`useRFPs(filters?)`**
- Fetches RFPs with optional filters
- Stale time: 3 minutes
- Supports status, category, and visibility filters

**`useRFP(rfpId)`**
- Fetches a single RFP with details
- Stale time: 5 minutes

**`useRFPProposals(rfpId)`**
- Fetches proposals for an RFP
- Stale time: 2 minutes

**`useRFPMessages(rfpId)`**
- Fetches messages for an RFP
- Stale time: 30 seconds
- Auto-refetches every 30 seconds for real-time updates

### Proposal Hooks

**`useProposals(filters?)`**
- Fetches proposals with optional filters
- Stale time: 3 minutes

**`useProposal(proposalId)`**
- Fetches a single proposal
- Stale time: 5 minutes

**`useCreateProposal(rfpId)`**
- Mutation hook for creating proposals
- Invalidates related queries on success

**`useUpdateProposal(proposalId, rfpId)`**
- Mutation hook for updating proposals
- Invalidates related queries on success

### Vote Hooks

**`useVoteOnPost(postId)`**
- Mutation hook for voting on posts
- Implements optimistic updates
- Automatically rolls back on error

**`useVoteOnComment(commentId, postId)`**
- Mutation hook for voting on comments
- Implements optimistic updates
- Automatically rolls back on error

### Comment Hooks

**`useCreateComment(postId)`**
- Mutation hook for creating comments
- Implements optimistic updates
- Updates comment count on post

**`useUpdateComment(postId)`**
- Mutation hook for updating comments
- Implements optimistic updates
- Handles both top-level and reply comments

## Optimistic Updates

Optimistic updates provide instant feedback to users by updating the UI before the server responds.

### How It Works

1. **onMutate**: Cancel in-flight queries, snapshot current data, update cache optimistically
2. **onError**: Rollback to snapshot if mutation fails
3. **onSettled**: Refetch data to ensure consistency

### Example: Voting

```typescript
const voteMutation = useVoteOnPost(postId)

// User clicks upvote
voteMutation.mutate('up')
// UI updates immediately
// If server request fails, UI rolls back
// After success/error, data is refetched
```

## Cache Invalidation

Mutations automatically invalidate related queries to keep data fresh:

```typescript
// Creating a comment invalidates:
- queryKeys.forum.postComments(postId)
- queryKeys.forum.post(postId) // for comment count

// Creating a proposal invalidates:
- queryKeys.rfps.proposals(rfpId)
- queryKeys.rfps.detail(rfpId) // for proposal count
- queryKeys.proposals.lists()
```

## Development Tools

React Query DevTools are enabled in development mode:
- Press the React Query icon in the bottom-left corner
- View all queries, their status, and cached data
- Manually refetch or invalidate queries
- Debug stale/fresh states

## Best Practices

1. **Use query keys consistently**: Always use the factory functions from `query-keys.ts`
2. **Set appropriate stale times**: Frequently changing data (comments) = shorter stale time
3. **Implement optimistic updates**: For mutations that affect visible data
4. **Invalidate related queries**: After mutations, invalidate all affected queries
5. **Handle loading states**: Use `isLoading` and `isFetching` from query results
6. **Handle errors**: Display user-friendly error messages from `error` property

## Performance Considerations

- **Automatic Request Deduplication**: Multiple components requesting the same data only trigger one request
- **Background Refetching**: Stale data is refetched in the background without blocking UI
- **Garbage Collection**: Unused data is automatically removed after GC time
- **Pagination**: Use offset/limit parameters to load data in chunks
- **Selective Refetching**: Only refetch queries that are actually stale
