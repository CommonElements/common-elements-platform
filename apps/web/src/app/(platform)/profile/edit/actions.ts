'use server'

import { createServerSupabaseClient } from '@repo/database/server'
import {
  communityMemberSchema,
  vendorSchema,
  type CommunityMemberInput,
  type VendorInput,
} from '@repo/validations'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

type ProfileResponse =
  | { success: true; data?: { avatarUrl: string } }
  | {
      success: false
      error: {
        type: 'validation' | 'database' | 'authorization'
        message: string
        issues?: z.ZodIssue[]
      }
    }

export async function updateCommunityMemberProfile(
  userId: string,
  data: CommunityMemberInput
): Promise<ProfileResponse> {
  try {
    const supabase = await createServerSupabaseClient()

    // Verify current user is updating their own profile
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== userId) {
      return {
        success: false,
        error: {
          type: 'authorization',
          message: 'You can only update your own profile',
        },
      }
    }

    // Validate input
    const validated = communityMemberSchema.parse(data)

    // Update community profile
    const { error: profileError } = await supabase
      .from('community_profiles')
      .update({
        role: validated.role,
        property_name: validated.propertyName,
        property_location: validated.propertyLocation,
        license_type: validated.licenseType,
        license_number: validated.licenseNumber,
        hide_property_name: validated.hidePropertyName,
      })
      .eq('user_id', userId)

    if (profileError) {
      return {
        success: false,
        error: {
          type: 'database',
          message: 'Failed to update profile',
        },
      }
    }

    revalidatePath(`/profile/${userId}`)
    revalidatePath('/profile/edit')
    revalidatePath('/dashboard')

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

export async function updateVendorProfile(
  userId: string,
  data: VendorInput
): Promise<ProfileResponse> {
  try {
    const supabase = await createServerSupabaseClient()

    // Verify current user is updating their own profile
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== userId) {
      return {
        success: false,
        error: {
          type: 'authorization',
          message: 'You can only update your own profile',
        },
      }
    }

    // Validate input
    const validated = vendorSchema.parse(data)

    // Update vendor profile
    const { error: profileError } = await supabase
      .from('vendor_profiles')
      .update({
        company_name: validated.companyName,
        service_categories: validated.serviceCategories,
        service_areas: validated.serviceAreas,
        business_description: validated.businessDescription,
        license_info: validated.licenseInfo,
        insurance_info: validated.insuranceInfo,
        years_in_business: validated.yearsInBusiness,
      })
      .eq('user_id', userId)

    if (profileError) {
      return {
        success: false,
        error: {
          type: 'database',
          message: 'Failed to update profile',
        },
      }
    }

    revalidatePath(`/profile/${userId}`)
    revalidatePath('/profile/edit')
    revalidatePath('/dashboard')

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


export async function uploadAvatar(
  userId: string,
  formData: FormData
): Promise<ProfileResponse> {
  try {
    const supabase = await createServerSupabaseClient()

    // Verify current user is updating their own profile
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== userId) {
      return {
        success: false,
        error: {
          type: 'authorization',
          message: 'You can only update your own avatar',
        },
      }
    }

    const file = formData.get('avatar') as File
    if (!file) {
      return {
        success: false,
        error: {
          type: 'validation',
          message: 'No file provided',
        },
      }
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: {
          type: 'validation',
          message: 'Only JPG and PNG images are allowed',
        },
      }
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: {
          type: 'validation',
          message: 'File size must be less than 2MB',
        },
      }
    }

    // Delete old avatar if exists
    const { data: userData } = await supabase
      .from('users')
      .select('avatar_url')
      .eq('id', userId)
      .single()

    if (userData?.avatar_url) {
      // Extract file path from URL
      const oldPath = userData.avatar_url.split('/').slice(-2).join('/')
      await supabase.storage.from('avatars').remove([oldPath])
    }

    // Upload new avatar
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/avatar.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type,
      })

    if (uploadError) {
      return {
        success: false,
        error: {
          type: 'database',
          message: 'Failed to upload avatar',
        },
      }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(fileName)

    // Update user record
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', userId)

    if (updateError) {
      return {
        success: false,
        error: {
          type: 'database',
          message: 'Failed to update profile',
        },
      }
    }

    revalidatePath(`/profile/${userId}`)
    revalidatePath('/profile/edit')
    revalidatePath('/dashboard')

    return { success: true, data: { avatarUrl: publicUrl } }
  } catch (error) {
    return {
      success: false,
      error: {
        type: 'database',
        message: 'An unexpected error occurred',
      },
    }
  }
}
