'use server'

import { createServerSupabaseClient } from '@repo/database'
import {
  communityMemberSchema,
  vendorSchema,
  type CommunityMemberInput,
  type VendorInput,
} from '@repo/validations'
import { z } from 'zod'

type ProfileResponse =
  | { success: true }
  | {
      success: false
      error: {
        type: 'validation' | 'database'
        message: string
        issues?: z.ZodIssue[]
      }
    }

export async function saveCommunityMemberProfile(
  userId: string,
  data: CommunityMemberInput
): Promise<ProfileResponse> {
  try {
    // Validate input
    const validated = communityMemberSchema.parse(data)

    const supabase = await createServerSupabaseClient()

    // Update user account type
    const { error: userError } = await supabase
      .from('users')
      .update({ account_type: 'community_member' })
      .eq('id', userId)

    if (userError) {
      return {
        success: false,
        error: {
          type: 'database',
          message: 'Failed to update account type',
        },
      }
    }

    // Create community profile
    const { error: profileError } = await supabase
      .from('community_profiles')
      .insert({
        user_id: userId,
        role: validated.role,
        property_name: validated.propertyName,
        property_location: validated.propertyLocation,
        license_type: validated.licenseType,
        license_number: validated.licenseNumber,
        hide_property_name: validated.hidePropertyName,
      })

    if (profileError) {
      return {
        success: false,
        error: {
          type: 'database',
          message: 'Failed to create profile',
        },
      }
    }

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          type: 'validation',
          message: 'Validation failed',
          issues: error.issues,
        },
      }
    }

    return {
      success: false,
      error: {
        type: 'database',
        message: 'An unexpected error occurred',
      },
    }
  }
}

export async function saveVendorProfile(
  userId: string,
  data: VendorInput
): Promise<ProfileResponse> {
  try {
    // Validate input
    const validated = vendorSchema.parse(data)

    const supabase = await createServerSupabaseClient()

    // Update user account type
    const { error: userError } = await supabase
      .from('users')
      .update({ account_type: 'vendor' })
      .eq('id', userId)

    if (userError) {
      return {
        success: false,
        error: {
          type: 'database',
          message: 'Failed to update account type',
        },
      }
    }

    // Create vendor profile
    const { error: profileError } = await supabase
      .from('vendor_profiles')
      .insert({
        user_id: userId,
        company_name: validated.companyName,
        service_categories: validated.serviceCategories,
        service_areas: validated.serviceAreas,
        business_description: validated.businessDescription,
        license_info: validated.licenseInfo,
        insurance_info: validated.insuranceInfo,
        years_in_business: validated.yearsInBusiness,
      })

    if (profileError) {
      return {
        success: false,
        error: {
          type: 'database',
          message: 'Failed to create profile',
        },
      }
    }

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          type: 'validation',
          message: 'Validation failed',
          issues: error.issues,
        },
      }
    }

    return {
      success: false,
      error: {
        type: 'database',
        message: 'An unexpected error occurred',
      },
    }
  }
}
