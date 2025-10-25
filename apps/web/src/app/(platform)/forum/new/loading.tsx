import { FormSkeleton, Skeleton } from '@repo/ui'

export default function PostNewLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link Skeleton */}
      <Skeleton className="h-5 w-32 mb-6" />

      {/* Page Title */}
      <div className="mb-8">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <FormSkeleton />
      </div>
    </div>
  )
}
