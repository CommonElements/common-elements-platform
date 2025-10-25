import { AlertCircle } from 'lucide-react'

interface FormErrorProps {
  message?: string
  className?: string
}

/**
 * FormError component displays field-level validation errors
 */
export function FormError({ message, className = '' }: FormErrorProps) {
  if (!message) return null

  return (
    <p className={`mt-1 text-sm text-red-600 flex items-center gap-1 ${className}`}>
      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
      <span>{message}</span>
    </p>
  )
}

interface FormFieldErrorProps {
  errors?: Record<string, string>
  field: string
  className?: string
}

/**
 * FormFieldError component displays errors for a specific field
 */
export function FormFieldError({ errors, field, className }: FormFieldErrorProps) {
  if (!errors || !errors[field]) return null
  
  return <FormError message={errors[field]} className={className} />
}

interface FormGeneralErrorProps {
  error?: string | null
  className?: string
}

/**
 * FormGeneralError component displays general form-level errors
 */
export function FormGeneralError({ error, className = '' }: FormGeneralErrorProps) {
  if (!error) return null

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 ${className}`}>
      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
      <div>
        <h3 className="text-sm font-medium text-red-800">Error</h3>
        <p className="text-sm text-red-700 mt-1">{error}</p>
      </div>
    </div>
  )
}
