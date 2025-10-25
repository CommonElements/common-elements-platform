import { ListSkeleton, Skeleton } from '@repo/ui'

export default function ProposalsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link Skeleton */}
      <Skeleton className="h-5 w-32 mb-6" />

      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>

      {/* Proposals List */}
      <ListSkeleton count={3} />
    </div>
  )
}
