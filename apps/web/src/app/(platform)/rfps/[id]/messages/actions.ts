'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@repo/database/server'
import { requireAuth, getUserProfile } from '@repo/auth'
import { z } from 'zod'

const sendMessageSchema = z.object({
  rfpId: z.string().uuid(),
  recipientId: z.string().uuid(),
  content: z.string().min(1).max(5000),
})

export async function sendMessage(
  rfpId: string,
  recipientId: string,
  content: string
) {
  try {
    // Validate input
    const validated = sendMessageSchema.parse({
      rfpId,
      recipientId,
      content,
    })

    // Require authentication
    await requireAuth()
    const userProfile = await getUserProfile()

    if (!userProfile) {
      return {
        success: false,
        error: 'User profile not found',
      }
    }

    const supabase = await createServerSupabaseClient()

    // Verify sender is either RFP creator or has submitted a proposal
    const { data: rfp } = await supabase
      .from('rfps')
      .select(
        `
        id,
        creator:community_profiles!rfps_creator_id_fkey (
          user_id
        )
      `
      )
      .eq('id', validated.rfpId)
      .single()

    if (!rfp) {
      return {
        success: false,
        error: 'RFP not found',
      }
    }

    const isCreator =
      userProfile.account_type === 'community_member' &&
      (rfp.creator as any)?.user_id === userProfile.profile?.user_id

    // Check if user is a vendor with a proposal
    let isVendorWithProposal = false
    if (userProfile.account_type === 'vendor') {
      const { data: proposal } = await supabase
        .from('proposals')
        .select('id')
        .eq('rfp_id', validated.rfpId)
        .eq('vendor_id', userProfile.profile?.id)
        .single()

      isVendorWithProposal = !!proposal
    }

    if (!isCreator && !isVendorWithProposal) {
      return {
        success: false,
        error: 'You do not have permission to send messages for this RFP',
      }
    }

    // Get current user ID
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      }
    }

    // Insert message
    const { data: message, error } = await supabase
      .from('rfp_messages')
      .insert({
        rfp_id: validated.rfpId,
        sender_id: user.id,
        recipient_id: validated.recipientId,
        content: validated.content,
      })
      .select(
        `
        id,
        rfp_id,
        content,
        read_at,
        created_at,
        sender:users!rfp_messages_sender_id_fkey (
          id,
          full_name,
          avatar_url,
          account_type
        ),
        recipient:users!rfp_messages_recipient_id_fkey (
          id,
          full_name,
          avatar_url,
          account_type
        )
      `
      )
      .single()

    if (error) {
      console.error('Failed to send message:', error)
      return {
        success: false,
        error: 'Failed to send message',
      }
    }

    // Revalidate the messages page
    revalidatePath(`/rfps/${validated.rfpId}/messages`)

    return {
      success: true,
      data: message,
    }
  } catch (error) {
    console.error('Error sending message:', error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid input',
      }
    }
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

export async function markMessagesAsRead(rfpId: string, senderId: string) {
  try {
    await requireAuth()
    const userProfile = await getUserProfile()

    if (!userProfile) {
      return {
        success: false,
        error: 'User profile not found',
      }
    }

    const supabase = await createServerSupabaseClient()

    // Get current user ID
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      }
    }

    // Mark all unread messages from sender as read
    const { error } = await supabase
      .from('rfp_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('rfp_id', rfpId)
      .eq('sender_id', senderId)
      .eq('recipient_id', user.id)
      .is('read_at', null)

    if (error) {
      console.error('Failed to mark messages as read:', error)
      return {
        success: false,
        error: 'Failed to mark messages as read',
      }
    }

    // Revalidate the messages page
    revalidatePath(`/rfps/${rfpId}/messages`)

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}
