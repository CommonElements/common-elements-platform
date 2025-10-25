import { z } from 'zod'

/**
 * User authentication schemas
 */

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

/**
 * Onboarding schemas
 */

export const accountTypeSchema = z.object({
  accountType: z.enum(['community_member', 'vendor'], {
    required_error: 'Please select an account type',
  }),
})

export const communityMemberSchema = z.object({
  role: z.enum(
    [
      'board_president',
      'board_member',
      'property_manager',
      'attorney',
      'committee_member',
      'resident',
    ],
    {
      required_error: 'Please select your role',
    }
  ),
  propertyName: z.string().min(2, 'Property name must be at least 2 characters'),
  propertyLocation: z.string().min(2, 'Property location is required'),
  licenseType: z.string().optional(),
  licenseNumber: z.string().optional(),
  hidePropertyName: z.boolean().default(false),
})

export const vendorSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  serviceCategories: z
    .array(z.string())
    .min(1, 'Please select at least one service category'),
  serviceAreas: z.array(z.string()).min(1, 'Please select at least one service area'),
  businessDescription: z.string().optional(),
  licenseInfo: z.string().optional(),
  insuranceInfo: z.string().optional(),
  yearsInBusiness: z.number().int().min(0).optional(),
})

/**
 * Profile update schemas
 */

export const updateCommunityProfileSchema = communityMemberSchema.partial()
export const updateVendorProfileSchema = vendorSchema.partial()

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type AccountTypeInput = z.infer<typeof accountTypeSchema>
export type CommunityMemberInput = z.infer<typeof communityMemberSchema>
export type VendorInput = z.infer<typeof vendorSchema>
