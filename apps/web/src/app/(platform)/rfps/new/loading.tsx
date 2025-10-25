import { FormSkeleton, Skeleton } from '@repo/ui'

export default function RFPNewLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link Skeleton */}
      <Skeleton className="h-5 w-32 mb-6" />

      {/* Page Title */}
      <div className="mb-8">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Form Sections */}
      <div className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <Skeleton className="h-6 w-40 mb-6" />
          <FormSkeleton />
        </div>

        {/* Private Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-64 mb-6" />
          <FormSkeleton />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <Skeleton className="h-10 w-24 rounded" />
          <Skeleton className="h-10 w-32 rounded" />
        </div>
      </div>
    </div>
  )
}
