'use server'

import { createServerSupabaseClient } from '@repo/database'
import { signupSchema, type SignupInput } from '@repo/validations'
import { redirect } from 'next/navigation'
import { z } from 'zod'

type SignupResponse =
  | { success: true }
  | {
      success: false
      error: {
        type: 'validation' | 'auth' | 'database'
        message: string
        issues?: z.ZodIssue[]
      }
    }

export async function signup(data: SignupInput): Promise<SignupResponse> {
  try {
    // Validate input
    const validated = signupSchema.parse(data)

    const supabase = await createServerSupabaseClient()

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validated.email,
      password: validated.password,
      options: {
        data: {
          full_name: validated.fullName,
        },
      },
    })

    if (authError) {
      return {
        success: false,
        error: {
          type: 'auth',
          message: authError.message,
        },
      }
    }

    if (!authData.user) {
      return {
        success: false,
        error: {
          type: 'auth',
          message: 'Failed to create user account',
        },
      }
    }

    // Create user record in users table
    const { error: userError } = await supabase.from('users').insert({
      id: authData.user.id,
      email: validated.email,
      full_name: validated.fullName,
      account_type: 'community_member', // Default, will be updated in onboarding
    })

    if (userError) {
      return {
        success: false,
        error: {
          type: 'database',
          message: 'Failed to create user profile',
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
