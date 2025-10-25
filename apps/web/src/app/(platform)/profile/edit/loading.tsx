import { FormSkeleton } from '@repo/ui'

export default function ProfileEditLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link Skeleton */}
      <div className="mb-6">
        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Page Title */}
      <div className="mb-8">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Form Skeleton */}
      <div className="bg-white rounded-lg shadow p-6">
        <FormSkeleton />
      </div>
    </div>
  )
}
