'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RichTextEditor, FileUploader, type ExistingFile, FormGeneralError } from '@repo/ui'
import { createRFP, uploadRFPAttachment, removeRFPAttachment } from '../actions'
import { Loader2 } from 'lucide-react'

export function RFPForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdRFPId, setCreatedRFPId] = useState<string | null>(null)
  
  // Form state
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'private'>('public')
  const [deadline, setDeadline] = useState('')
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  
  // Private details state
  const [propertyAddress, setPropertyAddress] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [detailedScope, setDetailedScope] = useState('')
  const [specialRequirements, setSpecialRequirements] = useState('')
  
  // File upload state
  const [attachments, setAttachments] = useState<ExistingFile[]>([])

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

  const handleFileUpload = async (files: File[]) => {
    if (!createdRFPId) {
      throw new Error('RFP must be created before uploading files')
    }

    for (const file of files) {
      const result = await uploadRFPAttachment(createdRFPId, file)
      
      if (result.success && result.url) {
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            url: result.url!,
            size: file.size,
          },
        ])
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    }
  }

  const handleFileRemove = async (fileUrl: string) => {
    if (!createdRFPId) return

    const result = await removeRFPAttachment(createdRFPId, fileUrl)
    
    if (result.success) {
      setAttachments((prev) => prev.filter((file) => file.url !== fileUrl))
    } else {
      setError(result.error || 'Failed to remove file')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const result = await createRFP({
        title,
        category,
        description,
        visibility,
        deadline: deadline || undefined,
        budgetMin: budgetMin ? parseFloat(budgetMin) : undefined,
        budgetMax: budgetMax ? parseFloat(budgetMax) : undefined,
        propertyAddress,
        contactName,
        contactEmail,
        contactPhone: contactPhone || undefined,
        detailedScope,
        specialRequirements: specialRequirements || undefined,
      })

      if (result.success && result.data) {
        setCreatedRFPId(result.data.id)
        router.push(`/rfps/${result.data.id}`)
      } else if (result.error) {
        setError(result.error.message)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <FormGeneralError error={error} />

      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={10}
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Roof Repair and Replacement Needed"
          />
          <p className="mt-1 text-xs text-gray-500">
            Minimum 10 characters, maximum 200 characters
          </p>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="Provide a general description of the project..."
            maxLength={10000}
          />
          <p className="mt-1 text-xs text-gray-500">
            Minimum 50 characters. This will be visible to all vendors.
          </p>
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Visibility <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={visibility === 'public'}
                onChange={(e) => setVisibility(e.target.value as 'public')}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-gray-900">Public</div>
                <div className="text-sm text-gray-600">
                  All vendors can see full details and submit proposals
                </div>
              </div>
            </label>
            <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={visibility === 'private'}
                onChange={(e) => setVisibility(e.target.value as 'private')}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-gray-900">Private</div>
                <div className="text-sm text-gray-600">
                  Only approved vendors can see full details and submit proposals
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Deadline */}
        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
            Deadline (Optional)
          </label>
          <input
            type="datetime-local"
            id="deadline"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Budget Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="budgetMin" className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Budget (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                id="budgetMin"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                min="0"
                step="0.01"
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label htmlFor="budgetMax" className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Budget (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                id="budgetMax"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                min="0"
                step="0.01"
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Private Details */}
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Private Details</h2>
          <p className="mt-1 text-sm text-gray-600">
            {visibility === 'private'
              ? 'Only visible to you and approved vendors'
              : 'Only visible to you and vendors who submit proposals'}
          </p>
        </div>

        {/* Property Address */}
        <div>
          <label htmlFor="propertyAddress" className="block text-sm font-medium text-gray-700 mb-1">
            Property Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="propertyAddress"
            value={propertyAddress}
            onChange={(e) => setPropertyAddress(e.target.value)}
            required
            minLength={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="123 Main St, City, State 12345"
          />
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="contactName"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              required
              minLength={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Phone (Optional)
            </label>
            <input
              type="tel"
              id="contactPhone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        <div>
          <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
            Contact Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="contactEmail"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="contact@example.com"
          />
        </div>

        {/* Detailed Scope */}
        <div>
          <label htmlFor="detailedScope" className="block text-sm font-medium text-gray-700 mb-1">
            Detailed Scope <span className="text-red-500">*</span>
          </label>
          <RichTextEditor
            value={detailedScope}
            onChange={setDetailedScope}
            placeholder="Provide detailed project requirements, specifications, and expectations..."
            maxLength={20000}
          />
          <p className="mt-1 text-xs text-gray-500">
            Minimum 50 characters. Include all relevant details for vendors.
          </p>
        </div>

        {/* Special Requirements */}
        <div>
          <label htmlFor="specialRequirements" className="block text-sm font-medium text-gray-700 mb-1">
            Special Requirements (Optional)
          </label>
          <textarea
            id="specialRequirements"
            value={specialRequirements}
            onChange={(e) => setSpecialRequirements(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Any special requirements, certifications, or qualifications needed..."
          />
        </div>

        {/* File Attachments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Attachments (Optional)
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Note: You can upload files after creating the RFP. Files will be accessible to {visibility === 'private' ? 'approved vendors only' : 'all vendors'}.
          </p>
          {createdRFPId ? (
            <FileUploader
              onUpload={handleFileUpload}
              existingFiles={attachments}
              onRemove={handleFileRemove}
              maxFiles={5}
              maxSize={10}
            />
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
              <p className="text-sm text-gray-500">
                File uploads will be available after creating the RFP
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isSubmitting ? 'Creating...' : 'Create RFP'}
        </button>
      </div>
    </form>
  )
}
