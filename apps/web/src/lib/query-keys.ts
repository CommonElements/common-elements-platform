/**
 * Query Key Factories
 * 
 * Centralized query key management for React Query
 * Follows the pattern: [entity, ...filters/params]
 */

export const queryKeys = {
  // Forum queries
  forum: {
    all: ['forum'] as const,
    posts: () => [...queryKeys.forum.all, 'posts'] as const,
    post: (id: string) => [...queryKeys.forum.posts(), id] as const,
    postComments: (postId: string) => [...queryKeys.forum.post(postId), 'comments'] as const,
    categories: () => [...queryKeys.forum.all, 'categories'] as const,
    postsByCategory: (categoryId: string) =>
      [...queryKeys.forum.posts(), 'category', categoryId] as const,
  },

  // RFP queries
  rfps: {
    all: ['rfps'] as const,
    lists: () => [...queryKeys.rfps.all, 'list'] as const,
    list: (filters?: {
      status?: string
      category?: string
      visibility?: string
    }) => [...queryKeys.rfps.lists(), filters] as const,
    details: () => [...queryKeys.rfps.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.rfps.details(), id] as const,
    privateDetails: (id: string) => [...queryKeys.rfps.detail(id), 'private'] as const,
    proposals: (rfpId: string) => [...queryKeys.rfps.detail(rfpId), 'proposals'] as const,
    messages: (rfpId: string) => [...queryKeys.rfps.detail(rfpId), 'messages'] as const,
    approvedVendors: (rfpId: string) =>
      [...queryKeys.rfps.detail(rfpId), 'approved-vendors'] as const,
  },

  // Proposal queries
  proposals: {
    all: ['proposals'] as const,
    lists: () => [...queryKeys.proposals.all, 'list'] as const,
    list: (filters?: { vendorId?: string; rfpId?: string; status?: string }) =>
      [...queryKeys.proposals.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.proposals.all, 'detail', id] as const,
  },

  // User queries
  users: {
    all: ['users'] as const,
    profile: (id: string) => [...queryKeys.users.all, 'profile', id] as const,
    currentUser: () => [...queryKeys.users.all, 'current'] as const,
    posts: (userId: string) => [...queryKeys.users.profile(userId), 'posts'] as const,
    comments: (userId: string) => [...queryKeys.users.profile(userId), 'comments'] as const,
    unreadMessages: (userId: string) =>
      [...queryKeys.users.profile(userId), 'unread-messages'] as const,
  },

  // Vote queries
  votes: {
    all: ['votes'] as const,
    userVote: (votableType: 'post' | 'comment', votableId: string) =>
      [...queryKeys.votes.all, votableType, votableId] as const,
  },
}
