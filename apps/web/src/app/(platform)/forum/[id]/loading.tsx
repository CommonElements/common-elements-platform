import { Skeleton } from '@repo/ui'

export default function PostLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link Skeleton */}
      <Skeleton className="h-5 w-32 mb-6" />

      {/* Post Skeleton */}
      <article className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          {/* Category Badge */}
          <Skeleton className="h-6 w-24 rounded-full mb-4" />

          {/* Title */}
          <Skeleton className="h-9 w-3/4 mb-6" />

          {/* Author and Meta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-6">
            {/* Vote Buttons */}
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-6 w-8" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>

            {/* Content */}
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="p-6">
          <Skeleton className="h-7 w-32 mb-6" />
          
          {/* Comment Skeletons */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3 mb-6">
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </article>
    </div>
  )
}
