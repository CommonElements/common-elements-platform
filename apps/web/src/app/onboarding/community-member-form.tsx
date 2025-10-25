'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { communityMemberSchema, type CommunityMemberInput } from '@repo/validations'
import { Spinner } from '@repo/ui'
import { saveCommunityMemberProfile } from './actions'

type CommunityMemberFormProps = {
  userId: string
  onBack: () => void
}

const ROLES = [
  { value: 'board_president', label: 'Board President' },
  { value: 'board_member', label: 'Board Member' },
  { value: 'property_manager', label: 'Property Manager' },
  { value: 'attorney', label: 'Attorney' },
  { value: 'committee_member', label: 'Committee Member' },
  { value: 'resident', label: 'Resident' },
]

export function CommunityMemberForm({ userId, onBack }: CommunityMemberFormProps) {
  const router = useRouter()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string>('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors({})
    setServerError('')
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      role: formData.get('role') as string,
      propertyName: formData.get('propertyName') as string,
      propertyLocation: formData.get('propertyLocation') as string,
      licenseType: formData.get('licenseType') as string || undefined,
      licenseNumber: formData.get('licenseNumber') as string || undefined,
      hidePropertyName: formData.get('hidePropertyName') === 'on',
    }

    // Client-side validation
    const result = communityMemberSchema.safeParse(data)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message
        }
      })
      setErrors(fieldErrors)
      setIsLoading(false)
      return
    }

    // Server action
    const response = await saveCommunityMemberProfile(userId, result.data)
    setIsLoading(false)

    if (!response.success) {
      if (response.error.type === 'validation') {
        const fieldErrors: Record<string, string> = {}
        response.error.issues?.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0].toString()] = issue.message
          }
        })
        setErrors(fieldErrors)
      } else {
        setServerError(response.error.message)
      }
    } else {
      // Redirect to dashboard
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Community Member Profile
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Tell us about your role and property
        </p>
      </div>

      {serverError && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{serverError}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Your Role <span className="text-red-500">*</span>
          </label>
          <select
            id="role"
            name="role"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Select a role</option>
            {ROLES.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role}</p>
          )}
        </div>

        <div>
          <label htmlFor="propertyName" className="block text-sm font-medium text-gray-700">
            Property Name <span className="text-red-500">*</span>
          </label>
          <input
            id="propertyName"
            name="propertyName"
            type="text"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            placeholder="Sunset Hills HOA"
          />
          {errors.propertyName && (
            <p className="mt-1 text-sm text-red-600">{errors.propertyName}</p>
          )}
        </div>

        <div>
          <label htmlFor="propertyLocation" className="block text-sm font-medium text-gray-700">
            Property Location <span className="text-red-500">*</span>
          </label>
          <input
            id="propertyLocation"
            name="propertyLocation"
            type="text"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            placeholder="Miami, FL"
          />
          {errors.propertyLocation && (
            <p className="mt-1 text-sm text-red-600">{errors.propertyLocation}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="licenseType" className="block text-sm font-medium text-gray-700">
              License Type (Optional)
            </label>
            <input
              id="licenseType"
              name="licenseType"
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="CAM"
            />
          </div>

          <div>
            <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
              License Number (Optional)
            </label>
            <input
              id="licenseNumber"
              name="licenseNumber"
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="12345"
            />
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex h-5 items-center">
            <input
              id="hidePropertyName"
              name="hidePropertyName"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="hidePropertyName" className="font-medium text-gray-700">
              Hide property name from public profile
            </label>
            <p className="text-gray-500">
              Your property name will only be visible to you
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading && <Spinner size="sm" className="text-white" />}
          {isLoading ? 'Saving...' : 'Complete Profile'}
        </button>
      </div>
    </form>
  )
}
