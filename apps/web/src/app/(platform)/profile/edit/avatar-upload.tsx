'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Camera, Upload, AlertCircle } from 'lucide-react'
import { uploadAvatar } from './actions'
import { useRouter } from 'next/navigation'

interface AvatarUploadProps {
  userId: string
  currentAvatarUrl?: string | null
  userName: string
}

export function AvatarUpload({ userId, currentAvatarUrl, userName }: AvatarUploadProps) {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG and PNG images are allowed')
      return
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      setError('File size must be less than 2MB')
      return
    }

    setError(null)
    setIsUploading(true)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    const formData = new FormData()
    formData.append('avatar', file)

    const response = await uploadAvatar(userId, formData)
    setIsUploading(false)

    if (!response.success) {
      setError(response.error.message)
      setPreviewUrl(currentAvatarUrl || null)
    } else {
      router.refresh()
    }

    // Reset input
    e.target.value = ''
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        {/* Avatar Preview */}
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center relative">
            {previewUrl ? (
              previewUrl.startsWith('data:') ? (
                // For preview URLs (base64), use regular img tag
                <img
                  src={previewUrl}
                  alt={userName}
                  className="h-full w-full object-cover"
                />
              ) : (
                // For uploaded URLs, use Next.js Image
                <Image
                  src={previewUrl}
                  alt={userName}
                  fill
                  sizes="96px"
                  className="object-cover"
                  priority
                />
              )
            ) : (
              <span className="text-2xl font-semibold text-gray-600">
                {getInitials(userName)}
              </span>
            )}
          </div>
          
          {/* Upload Button Overlay */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            aria-label="Upload avatar"
          >
            {isUploading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Upload Instructions */}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? 'Uploading...' : 'Change Avatar'}
          </button>
          
          <p className="mt-2 text-xs text-gray-500">
            JPG or PNG. Max size 2MB.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  )
}
