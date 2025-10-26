import Link from 'next/link'
import { Suspense } from 'react'
import { getRFPs, type RFP } from '@repo/database'
import { getUserProfile } from '@repo/auth'
import { UserBadge } from '@repo/ui'
import { Calendar, FileText, Lock, Plus } from 'lucide-react'

interface RFPsPageProps {
  searchParams: Promise<{
    status?: string
    category?: string
    page?: string
  }>
}

export default async function RFPsPage({ searchParams }: RFPsPageProps) {
  const { status, category, page } = await searchParams
  const userProfile = await getUserProfile()
  const isCommunityMember = userProfile?.account_type === 'community_member'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">RFP Hub</h1>
        {isCommunityMember && (
          <Link
            href="/rfps/new"
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-h-[44px]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create RFP
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1 order-2 lg:order-1">
          <FiltersSidebar
            selectedStatus={status}
            selectedCategory={category}
          />
        </aside>

        {/* RFPs List */}
        <main className="lg:col-span-3 order-1 lg:order-2">
          <Suspense fallback={<RFPsSkeleton />}>
            <RFPsList
              status={status}
              category={category}
              page={page ? parseInt(page) : 1}
            />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

function FiltersSidebar({
  selectedStatus,
  selectedCategory,
}: {
  selectedStatus?: string
  selectedCategory?: string
}) {
  const statuses = [
    { value: 'open', label: 'Open' },
    { value: 'reviewing', label: 'Reviewing' },
    { value: 'awarded', label: 'Awarded' },
    { value: 'closed', label: 'Closed' },
  ]

  const categories = [
    'Landscaping',
    'Roofing',
    'Plumbing',
    'Electrical',
    'HVAC',
    'Painting',
    'Cleaning',
    'Security',
    'Pool Maintenance',
    'General Maintenance',
  ]

  const buildFilterUrl = (type: 'status' | 'category', value?: string) => {
    const params = new URLSearchParams()
    
    if (type === 'status') {
      if (value) params.set('status', value)
      if (selectedCategory) params.set('category', selectedCategory)
    } else {
      if (selectedStatus) params.set('status', selectedStatus)
      if (value) params.set('category', value)
    }
    
    return `/rfps${params.toString() ? `?${params.toString()}` : ''}`
  }

  return (
    <div className="space-y-6">
      {/* Status Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
        <nav className="space-y-1">
          <Link
            href="/rfps"
            className={`block px-3 py-2 rounded-md text-sm font-medium ${
              !selectedStatus
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            All RFPs
          </Link>
          {statuses.map((status) => (
            <Link
              key={status.value}
              href={buildFilterUrl('status', status.value)}
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                selectedStatus === status.value
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {status.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Category</h2>
        <nav className="space-y-1">
          <Link
            href={buildFilterUrl('category')}
            className={`block px-3 py-2 rounded-md text-sm font-medium ${
              !selectedCategory
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Categories
          </Link>
          {categories.map((category) => (
            <Link
              key={category}
              href={buildFilterUrl('category', category)}
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                selectedCategory === category
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {category}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}

async function RFPsList({
  status,
  category,
  page,
}: {
  status?: string
  category?: string
  page: number
}) {
  const rfpsPerPage = 20
  const offset = (page - 1) * rfpsPerPage

  const { rfps, total } = await getRFPs({
    status,
    category,
    limit: rfpsPerPage,
    offset,
  })

  if (rfps.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">
          No RFPs found. {!status && !category && 'Be the first to create one!'}
        </p>
      </div>
    )
  }

  const totalPages = Math.ceil(total / rfpsPerPage)
  const hasNextPage = page < totalPages

  return (
    <div className="space-y-4">
      {rfps.map((rfp) => (
        <RFPCard key={rfp.id} rfp={rfp} />
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          {page > 1 && (
            <Link
              href={`/rfps?${status ? `status=${status}&` : ''}${category ? `category=${category}&` : ''}page=${page - 1}`}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          {hasNextPage && (
            <Link
              href={`/rfps?${status ? `status=${status}&` : ''}${category ? `category=${category}&` : ''}page=${page + 1}`}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

function RFPCard({ rfp }: { rfp: RFP }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800'
      case 'reviewing':
        return 'bg-yellow-100 text-yellow-800'
      case 'awarded':
        return 'bg-blue-100 text-blue-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return 'No deadline'
    
    const date = new Date(deadline)
    const now = new Date()
    const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntil < 0) return 'Expired'
    if (daysUntil === 0) return 'Due today'
    if (daysUntil === 1) return 'Due tomorrow'
    if (daysUntil <= 7) return `Due in ${daysUntil} days`
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <Link href={`/rfps/${rfp.id}`}>
      <article className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 hover:text-blue-600 break-words">
                {rfp.title}
              </h2>
              {rfp.visibility === 'private' && (
                <Lock className="h-4 w-4 text-gray-500 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {rfp.category}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(rfp.status)}`}
              >
                {rfp.status.charAt(0).toUpperCase() + rfp.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Description Preview */}
        <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-2">{rfp.description}</p>

        {/* RFP Meta */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <UserBadge
            user={{
              id: rfp.creator.user.id,
              name: rfp.creator.user.full_name,
              role: rfp.creator.role
                .split('_')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' '),
              location: rfp.creator.property_location,
              avatarUrl: rfp.creator.user.avatar_url || undefined,
            }}
            size="sm"
            showLocation={true}
          />

          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">{rfp.proposal_count} proposals</span>
              <span className="sm:hidden">{rfp.proposal_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span className="truncate max-w-[120px] sm:max-w-none">{formatDeadline(rfp.deadline)}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}

function RFPsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
            </div>
            <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-5/6 animate-pulse" />
            <div className="flex items-center justify-between mt-4">
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="flex items-center gap-4">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
