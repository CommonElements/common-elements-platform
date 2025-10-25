import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getUser, hasCompletedOnboarding } from '@repo/auth'
import { OnboardingFlow } from './onboarding-flow'

export const metadata: Metadata = {
  title: 'Complete Your Profile | Common Elements',
  description: 'Complete your profile to get started',
}

export default async function OnboardingPage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Check if already completed onboarding
  const completed = await hasCompletedOnboarding()
  if (completed) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Tell us a bit about yourself to get started
          </p>
        </div>
        <OnboardingFlow userId={user.id} />
      </div>
    </div>
  )
}
