import { requireAuth, getUserProfile } from '@repo/auth'
import { redirect } from 'next/navigation'
import { RFPForm } from './rfp-form'

export default async function NewRFPPage() {
  // Require authentication
  await requireAuth()
  
  // Check if user is a community member
  const userProfile = await getUserProfile()
  
  if (userProfile?.account_type !== 'community_member') {
    redirect('/rfps')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New RFP</h1>
        <p className="mt-2 text-sm text-gray-600">
          Request proposals from qualified vendors for your project
        </p>
      </div>

      <RFPForm />
    </div>
  )
}
