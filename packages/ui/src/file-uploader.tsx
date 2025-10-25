/**
 * FileUploader Component
 * 
 * Drag-and-drop file upload interface with validation
 * Displays upload progress and existing files
 */

'use client'

import * as React from 'react'
import { Upload, X, File, AlertCircle } from 'lucide-react'
import { cn } from './lib/utils'

export interface ExistingFile {
  name: string
  url: string
  size: number
}

export interface FileUploaderProps {
  onUpload: (files: File[]) => Promise<void>
  maxFiles?: number
  maxSize?: number // in MB
  acceptedTypes?: string[]
  existingFiles?: ExistingFile[]
  onRemove?: (fileUrl: string) => void
  disabled?: boolean
  className?: string
}

const DEFAULT_ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
]

const DEFAULT_MAX_SIZE = 10 // MB

export function FileUploader({
  onUpload,
  maxFiles = 5,
  maxSize = DEFAULT_MAX_SIZE,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  existingFiles = [],
  onRemove,
  disabled = false,
  className,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = React.useState<number>(0)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || ''
  }

  const validateFiles = (files: File[]): string | null => {
    if (existingFiles.length + files.length > maxFiles) {
      return `Maximum ${maxFiles} files allowed`
    }

    for (const file of files) {
      if (file.size > maxSize * 1024 * 1024) {
        return `File ${file.name} exceeds ${maxSize}MB limit`
      }

      if (!acceptedTypes.includes(file.type)) {
        return `File type ${file.type} is not accepted`
      }
    }

    return null
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    const validationError = validateFiles(fileArray)

    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      await onUpload(fileArray)

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Reset after brief delay
      setTimeout(() => {
        setUploadProgress(0)
        setIsUploading(false)
      }, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (!disabled) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  const handleRemoveFile = (fileUrl: string) => {
    if (onRemove) {
      onRemove(fileUrl)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragging && 'border-blue-500 bg-blue-50',
          !isDragging && 'border-gray-300 hover:border-gray-400',
          disabled && 'opacity-50 cursor-not-allowed',
          isUploading && 'pointer-events-none'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          disabled={disabled}
          className="hidden"
        />

        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-semibold text-blue-600">Click to upload</span> or
          drag and drop
        </p>
        
        <p className="text-xs text-gray-500">
          PDF, DOC, DOCX, XLS, XLSX, JPG, PNG up to {maxSize}MB
        </p>
        
        <p className="text-xs text-gray-500 mt-1">
          Maximum {maxFiles} files
        </p>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Uploading...</span>
            <span className="text-gray-600">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Existing Files */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">
            Uploaded Files ({existingFiles.length})
          </p>
          <div className="space-y-2">
            {existingFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                    <File className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                {onRemove && (
                  <button
                    onClick={() => handleRemoveFile(file.url)}
                    disabled={disabled}
                    className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
                    aria-label="Remove file"
                    type="button"
                  >
                    <X className="h-4 w-4 text-gray-600" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
