import { z } from 'zod'

/**
 * RFP schemas
 */

export const createRFPSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must be less than 200 characters'),
  category: z.string().min(1, 'Category is required'),
  description: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(10000, 'Description must be less than 10,000 characters'),
  visibility: z.enum(['private', 'public'], {
    required_error: 'Please select visibility',
  }),
  deadline: z.string().datetime().optional(),
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
  // Private details
  propertyAddress: z.string().min(5, 'Property address is required'),
  contactName: z.string().min(2, 'Contact name is required'),
  contactEmail: z.string().email('Invalid email address'),
  contactPhone: z.string().optional(),
  detailedScope: z
    .string()
    .min(50, 'Detailed scope must be at least 50 characters')
    .max(20000, 'Detailed scope must be less than 20,000 characters'),
  specialRequirements: z.string().optional(),
})

export const updateRFPSchema = createRFPSchema.partial()

/**
 * Proposal schemas
 */

export const createProposalSchema = z.object({
  rfpId: z.string().uuid('Invalid RFP'),
  coverLetter: z
    .string()
    .min(100, 'Cover letter must be at least 100 characters')
    .max(10000, 'Cover letter must be less than 10,000 characters'),
  timeline: z.string().min(10, 'Timeline is required'),
  cost: z.number().min(0, 'Cost must be a positive number'),
  paymentTerms: z.string().min(10, 'Payment terms are required'),
})

export const updateProposalSchema = createProposalSchema
  .omit({ rfpId: true })
  .partial()

/**
 * RFP message schemas
 */

export const createMessageSchema = z.object({
  rfpId: z.string().uuid('Invalid RFP'),
  recipientId: z.string().uuid('Invalid recipient'),
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message must be less than 5,000 characters'),
})

/**
 * Vendor approval schemas
 */

export const requestToBidSchema = z.object({
  rfpId: z.string().uuid('Invalid RFP'),
})

export const approveVendorSchema = z.object({
  rfpId: z.string().uuid('Invalid RFP'),
  vendorId: z.string().uuid('Invalid vendor'),
  status: z.enum(['approved', 'rejected']),
})

/**
 * File upload schemas
 */

export const fileUploadSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'),
  type: z.enum(
    [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
    ],
    {
      errorMap: () => ({
        message: 'File type must be PDF, DOC, DOCX, XLS, XLSX, JPG, or PNG',
      }),
    }
  ),
})

export type CreateRFPInput = z.infer<typeof createRFPSchema>
export type UpdateRFPInput = z.infer<typeof updateRFPSchema>
export type CreateProposalInput = z.infer<typeof createProposalSchema>
export type UpdateProposalInput = z.infer<typeof updateProposalSchema>
export type CreateMessageInput = z.infer<typeof createMessageSchema>
export type RequestToBidInput = z.infer<typeof requestToBidSchema>
export type ApproveVendorInput = z.infer<typeof approveVendorSchema>
export type FileUploadInput = z.infer<typeof fileUploadSchema>
