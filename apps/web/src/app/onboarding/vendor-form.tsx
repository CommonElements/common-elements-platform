'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { vendorSchema, type VendorInput } from '@repo/validations'
import { Spinner } from '@repo/ui'
import { saveVendorProfile } from './actions'

type VendorFormProps = {
  userId: string
  onBack: () => void
}

const SERVICE_CATEGORIES = [
  'Landscaping',
  'Pool Maintenance',
  'Roofing',
  'Painting',
  'Plumbing',
  'Electrical',
  'HVAC',
  'Security',
  'Cleaning',
  'Legal Services',
  'Accounting',
  'Insurance',
  'Property Management',
  'Other',
]

const SERVICE_AREAS = [
  'Miami-Dade County',
  'Broward County',
  'Palm Beach County',
  'Orange County',
  'Hillsborough County',
  'Pinellas County',
  'Other',
]

export function VendorForm({ userId, onBack }: VendorFormProps) {
  const router = useRouter()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string>('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])

  function toggleCategory(category: string) {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  function toggleArea(area: string) {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors({})
    setServerError('')
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      companyName: formData.get('companyName') as string,
      serviceCategories: selectedCategories,
      serviceAreas: selectedAreas,
      businessDescription: formData.get('businessDescription') as string || undefined,
      licenseInfo: formData.get('licenseInfo') as string || undefined,
      insuranceInfo: formData.get('insuranceInfo') as string || undefined,
      yearsInBusiness: formData.get('yearsInBusiness')
        ? parseInt(formData.get('yearsInBusiness') as string)
        : undefined,
    }

    // Client-side validation
    const result = vendorSchema.safeParse(data)
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
    const response = await saveVendorProfile(userId, result.data)
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
          Vendor Profile
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Tell us about your business and services
        </p>
      </div>

      {serverError && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{serverError}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            placeholder="ABC Services Inc."
          />
          {errors.companyName && (
            <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Service Categories <span className="text-red-500">*</span>
          </label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {SERVICE_CATEGORIES.map((category) => (
              <label
                key={category}
                className="flex items-center space-x-2 rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => toggleCategory(category)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{category}</span>
              </label>
            ))}
          </div>
          {errors.serviceCategories && (
            <p className="mt-1 text-sm text-red-600">{errors.serviceCategories}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Service Areas <span className="text-red-500">*</span>
          </label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {SERVICE_AREAS.map((area) => (
              <label
                key={area}
                className="flex items-center space-x-2 rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedAreas.includes(area)}
                  onChange={() => toggleArea(area)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{area}</span>
              </label>
            ))}
          </div>
          {errors.serviceAreas && (
            <p className="mt-1 text-sm text-red-600">{errors.serviceAreas}</p>
          )}
        </div>

        <div>
          <label htmlFor="businessDescription" className="block text-sm font-medium text-gray-700">
            Business Description (Optional)
          </label>
          <textarea
            id="businessDescription"
            name="businessDescription"
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            placeholder="Tell us about your business..."
          />
        </div>

        <div>
          <label htmlFor="licenseInfo" className="block text-sm font-medium text-gray-700">
            License Information (Optional)
          </label>
          <input
            id="licenseInfo"
            name="licenseInfo"
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            placeholder="License type and number"
          />
        </div>

        <div>
          <label htmlFor="insuranceInfo" className="block text-sm font-medium text-gray-700">
            Insurance Information (Optional)
          </label>
          <input
            id="insuranceInfo"
            name="insuranceInfo"
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            placeholder="Insurance provider and coverage"
          />
        </div>

        <div>
          <label htmlFor="yearsInBusiness" className="block text-sm font-medium text-gray-700">
            Years in Business (Optional)
          </label>
          <input
            id="yearsInBusiness"
            name="yearsInBusiness"
            type="number"
            min="0"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            placeholder="5"
          />
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
