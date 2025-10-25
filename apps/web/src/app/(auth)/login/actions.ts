'use server'

import { createServerSupabaseClient } from '@repo/database'
import { loginSchema, type LoginInput } from '@repo/validations'
import { z } from 'zod'

type LoginResponse =
  | { success: true }
  | {
      success: false
      error: {
        type: 'validation' | 'auth'
        message: string
        issues?: z.ZodIssue[]
      }
    }

export async function login(data: LoginInput): Promise<LoginResponse> {
  try {
    // Validate input
    const validated = loginSchema.parse(data)

    const supabase = await createServerSupabaseClient()

    // Sign in with email and password
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: validated.email,
        password: validated.password,
      })

    if (authError) {
      return {
        success: false,
        error: {
          type: 'auth',
          message: 'Invalid email or password',
        },
      }
    }

    if (!authData.user) {
      return {
        success: false,
        error: {
          type: 'auth',
          message: 'Failed to sign in',
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
        type: 'auth',
        message: 'An unexpected error occurred',
      },
    }
  }
}
