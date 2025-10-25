import { ProfileSkeleton, CardSkeleton } from '@repo/ui'

export default function ProfileLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link Skeleton */}
      <div className="mb-6">
        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Profile Card */}
      <ProfileSkeleton />

      {/* Recent Activity */}
      <div className="mt-8">
        <div className="h-7 w-40 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  )
}
