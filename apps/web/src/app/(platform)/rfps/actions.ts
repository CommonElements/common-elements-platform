'use server'

import { createServerSupabaseClient } from '@repo/database'
import { createRFPSchema, type CreateRFPInput, fileUploadSchema } from '@repo/validations'
import { requireAuth, getUserProfile } from '@repo/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createRFP(data: CreateRFPInput) {
  try {
    // Require authentication
    const user = await requireAuth()
    const userProfile = await getUserProfile()

    // Check if user is a community member
    if (userProfile?.account_type !== 'community_member') {
      return {
        success: false,
        error: {
          type: 'authorization' as const,
          message: 'Only community members can create RFPs',
        },
      }
    }

    // Get community profile ID
    const supabase = await createServerSupabaseClient()
    const { data: communityProfile, error: profileError } = await supabase
      .from('community_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !communityProfile) {
      return {
        success: false,
        error: {
          type: 'authorization' as const,
          message: 'Community profile not found',
        },
      }
    }

    // Validate input
    const validated = createRFPSchema.parse(data)

    // Insert RFP
    const { data: rfp, error: rfpError } = await supabase
      .from('rfps')
      .insert({
        creator_id: communityProfile.id,
        title: validated.title,
        category: validated.category,
        description: validated.description,
        visibility: validated.visibility,
        status: 'open',
        deadline: validated.deadline || null,
        budget_min: validated.budgetMin || null,
        budget_max: validated.budgetMax || null,
      })
      .select('id')
      .single()

    if (rfpError || !rfp) {
      console.error('Failed to create RFP:', rfpError)
      return {
        success: false,
        error: {
          type: 'database' as const,
          message: 'Failed to create RFP. Please try again.',
        },
      }
    }

    // Insert private details
    const { error: privateDetailsError } = await supabase
      .from('rfp_private_details')
      .insert({
        rfp_id: rfp.id,
        property_address: validated.propertyAddress,
        contact_name: validated.contactName,
        contact_email: validated.contactEmail,
        contact_phone: validated.contactPhone || null,
        detailed_scope: validated.detailedScope,
        special_requirements: validated.specialRequirements || null,
        attachments: [],
      })

    if (privateDetailsError) {
      console.error('Failed to create private details:', privateDetailsError)
      // Delete the RFP if private details failed
      await supabase.from('rfps').delete().eq('id', rfp.id)
      
      return {
        success: false,
        error: {
          type: 'database' as const,
          message: 'Failed to save RFP details. Please try again.',
        },
      }
    }

    // Revalidate the RFPs page
    revalidatePath('/rfps')

    return {
      success: true,
      data: { id: rfp.id },
    }
  } catch (error) {
    console.error('Error creating RFP:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return {
        success: false,
        error: {
          type: 'validation' as const,
          message: 'Please check your input and try again.',
        },
      }
    }

    return {
      success: false,
      error: {
        type: 'unknown' as const,
        message: 'An unexpected error occurred. Please try again.',
      },
    }
  }
}


/**
 * Upload file to Supabase Storage for RFP attachments
 */
export async function uploadRFPAttachment(
  rfpId: string,
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Require authentication
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    // Validate file
    const validation = fileUploadSchema.safeParse({
      name: file.name,
      size: file.size,
      type: file.type,
    })

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message || 'Invalid file',
      }
    }

    // Check if user has access to this RFP (must be creator)
    const { data: rfp, error: rfpError } = await supabase
      .from('rfps')
      .select('creator_id, community_profiles!rfps_creator_id_fkey(user_id)')
      .eq('id', rfpId)
      .single()

    if (rfpError || !rfp) {
      return {
        success: false,
        error: 'RFP not found',
      }
    }

    // @ts-ignore - Type issue with nested select
    if (rfp.community_profiles?.user_id !== user.id) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Upload to Supabase Storage
    const fileName = `${rfpId}/${Date.now()}-${file.name}`
    const { data, error: uploadError } = await supabase.storage
      .from('rfp-attachments')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return {
        success: false,
        error: 'Upload failed. Please try again.',
      }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('rfp-attachments').getPublicUrl(fileName)

    // Update RFP private details with new attachment
    const { data: privateDetails, error: fetchError } = await supabase
      .from('rfp_private_details')
      .select('attachments')
      .eq('rfp_id', rfpId)
      .single()

    if (fetchError) {
      return {
        success: false,
        error: 'Failed to update attachments',
      }
    }

    const currentAttachments = (privateDetails.attachments as any[]) || []
    const newAttachments = [
      ...currentAttachments,
      {
        name: file.name,
        url: publicUrl,
        size: file.size,
      },
    ]

    const { error: updateError } = await supabase
      .from('rfp_private_details')
      .update({ attachments: newAttachments })
      .eq('rfp_id', rfpId)

    if (updateError) {
      // Try to delete the uploaded file
      await supabase.storage.from('rfp-attachments').remove([fileName])
      return {
        success: false,
        error: 'Failed to save attachment',
      }
    }

    return {
      success: true,
      url: publicUrl,
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

/**
 * Remove file from RFP attachments
 */
export async function removeRFPAttachment(
  rfpId: string,
  fileUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Require authentication
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    // Check if user has access to this RFP (must be creator)
    const { data: rfp, error: rfpError } = await supabase
      .from('rfps')
      .select('creator_id, community_profiles!rfps_creator_id_fkey(user_id)')
      .eq('id', rfpId)
      .single()

    if (rfpError || !rfp) {
      return {
        success: false,
        error: 'RFP not found',
      }
    }

    // @ts-ignore - Type issue with nested select
    if (rfp.community_profiles?.user_id !== user.id) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Get current attachments
    const { data: privateDetails, error: fetchError } = await supabase
      .from('rfp_private_details')
      .select('attachments')
      .eq('rfp_id', rfpId)
      .single()

    if (fetchError) {
      return {
        success: false,
        error: 'Failed to fetch attachments',
      }
    }

    const currentAttachments = (privateDetails.attachments as any[]) || []
    const newAttachments = currentAttachments.filter(
      (att: any) => att.url !== fileUrl
    )

    // Update database
    const { error: updateError } = await supabase
      .from('rfp_private_details')
      .update({ attachments: newAttachments })
      .eq('rfp_id', rfpId)

    if (updateError) {
      return {
        success: false,
        error: 'Failed to remove attachment',
      }
    }

    // Extract file path from URL and delete from storage
    try {
      const urlParts = fileUrl.split('/rfp-attachments/')
      if (urlParts.length === 2) {
        const filePath = urlParts[1]
        await supabase.storage.from('rfp-attachments').remove([filePath])
      }
    } catch (storageError) {
      // Log but don't fail - file might already be deleted
      console.error('Storage deletion error:', storageError)
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error removing file:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

/**
 * Request to bid on a private RFP
 */
export async function requestToBid(rfpId: string) {
  try {
    // Require authentication
    const user = await requireAuth()
    const userProfile = await getUserProfile()

    // Check if user is a vendor
    if (userProfile?.account_type !== 'vendor') {
      return {
        success: false,
        error: {
          type: 'authorization' as const,
          message: 'Only vendors can request to bid on RFPs',
        },
      }
    }

    // Get vendor profile ID
    const supabase = await createServerSupabaseClient()
    const { data: vendorProfile, error: profileError } = await supabase
      .from('vendor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !vendorProfile) {
      return {
        success: false,
        error: {
          type: 'authorization' as const,
          message: 'Vendor profile not found',
        },
      }
    }

    // Check if RFP exists and is private
    const { data: rfp, error: rfpError } = await supabase
      .from('rfps')
      .select('id, visibility, status')
      .eq('id', rfpId)
      .single()

    if (rfpError || !rfp) {
      return {
        success: false,
        error: {
          type: 'validation' as const,
          message: 'RFP not found',
        },
      }
    }

    if (rfp.visibility !== 'private') {
      return {
        success: false,
        error: {
          type: 'validation' as const,
          message: 'This RFP is public and does not require approval',
        },
      }
    }

    if (rfp.status !== 'open') {
      return {
        success: false,
        error: {
          type: 'validation' as const,
          message: 'This RFP is no longer accepting requests',
        },
      }
    }

    // Check if request already exists
    const { data: existingRequest } = await supabase
      .from('rfp_approved_vendors')
      .select('id, status')
      .eq('rfp_id', rfpId)
      .eq('vendor_id', vendorProfile.id)
      .single()

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return {
          success: false,
          error: {
            type: 'validation' as const,
            message: 'You have already requested to bid on this RFP',
          },
        }
      } else if (existingRequest.status === 'approved') {
        return {
          success: false,
          error: {
            type: 'validation' as const,
            message: 'You are already approved to bid on this RFP',
          },
        }
      } else if (existingRequest.status === 'rejected') {
        return {
          success: false,
          error: {
            type: 'validation' as const,
            message: 'Your request to bid on this RFP was rejected',
          },
        }
      }
    }

    // Insert approval request
    const { error: insertError } = await supabase
      .from('rfp_approved_vendors')
      .insert({
        rfp_id: rfpId,
        vendor_id: vendorProfile.id,
        status: 'pending',
      })

    if (insertError) {
      console.error('Failed to create approval request:', insertError)
      return {
        success: false,
        error: {
          type: 'database' as const,
          message: 'Failed to submit request. Please try again.',
        },
      }
    }

    // Revalidate the RFP page
    revalidatePath(`/rfps/${rfpId}`)

    return {
      success: true,
      message: 'Request submitted successfully',
    }
  } catch (error) {
    console.error('Error requesting to bid:', error)
    return {
      success: false,
      error: {
        type: 'unknown' as const,
        message: 'An unexpected error occurred. Please try again.',
      },
    }
  }
}

/**
 * Approve or reject a vendor's request to bid on a private RFP
 */
export async function updateVendorApproval(
  approvalId: string,
  status: 'approved' | 'rejected'
) {
  try {
    // Require authentication
    const user = await requireAuth()
    const userProfile = await getUserProfile()

    // Check if user is a community member
    if (userProfile?.account_type !== 'community_member') {
      return {
        success: false,
        error: {
          type: 'authorization' as const,
          message: 'Only community members can approve vendors',
        },
      }
    }

    const supabase = await createServerSupabaseClient()

    // Get the approval request with RFP info
    const { data: approval, error: approvalError } = await supabase
      .from('rfp_approved_vendors')
      .select(
        `
        id,
        rfp_id,
        vendor_id,
        rfp:rfps!rfp_approved_vendors_rfp_id_fkey (
          id,
          creator:community_profiles!rfps_creator_id_fkey (
            user_id
          )
        )
      `
      )
      .eq('id', approvalId)
      .single()

    if (approvalError || !approval) {
      return {
        success: false,
        error: {
          type: 'validation' as const,
          message: 'Approval request not found',
        },
      }
    }

    // Check if user is the RFP creator
    // @ts-ignore - Type issue with nested select
    if (approval.rfp?.creator?.user_id !== user.id) {
      return {
        success: false,
        error: {
          type: 'authorization' as const,
          message: 'You can only approve vendors for your own RFPs',
        },
      }
    }

    // Update approval status
    const updateData: any = {
      status,
    }

    if (status === 'approved') {
      updateData.approved_at = new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('rfp_approved_vendors')
      .update(updateData)
      .eq('id', approvalId)

    if (updateError) {
      console.error('Failed to update approval:', updateError)
      return {
        success: false,
        error: {
          type: 'database' as const,
          message: 'Failed to update approval. Please try again.',
        },
      }
    }

    // Revalidate relevant pages
    revalidatePath(`/rfps/${approval.rfp_id}`)
    revalidatePath('/dashboard')

    return {
      success: true,
      message: `Vendor ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
    }
  } catch (error) {
    console.error('Error updating vendor approval:', error)
    return {
      success: false,
      error: {
        type: 'unknown' as const,
        message: 'An unexpected error occurred. Please try again.',
      },
    }
  }
}

/**
 * Submit a proposal for an RFP
 */
export async function createProposal(data: {
  rfpId: string
  coverLetter: string
  timeline: string
  cost: number
  paymentTerms: string
}) {
  try {
    // Require authentication
    const user = await requireAuth()
    const userProfile = await getUserProfile()

    // Check if user is a vendor
    if (userProfile?.account_type !== 'vendor') {
      return {
        success: false,
        error: {
          type: 'authorization' as const,
          message: 'Only vendors can submit proposals',
        },
      }
    }

    // Get vendor profile ID
    const supabase = await createServerSupabaseClient()
    const { data: vendorProfile, error: profileError } = await supabase
      .from('vendor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !vendorProfile) {
      return {
        success: false,
        error: {
          type: 'authorization' as const,
          message: 'Vendor profile not found',
        },
      }
    }

    // Check if RFP exists and is open
    const { data: rfp, error: rfpError } = await supabase
      .from('rfps')
      .select('id, visibility, status')
      .eq('id', data.rfpId)
      .single()

    if (rfpError || !rfp) {
      return {
        success: false,
        error: {
          type: 'validation' as const,
          message: 'RFP not found',
        },
      }
    }

    if (rfp.status !== 'open') {
      return {
        success: false,
        error: {
          type: 'validation' as const,
          message: 'This RFP is no longer accepting proposals',
        },
      }
    }

    // Check if vendor has access (for private RFPs)
    if (rfp.visibility === 'private') {
      const { data: approval } = await supabase
        .from('rfp_approved_vendors')
        .select('id, status')
        .eq('rfp_id', data.rfpId)
        .eq('vendor_id', vendorProfile.id)
        .single()

      if (!approval || approval.status !== 'approved') {
        return {
          success: false,
          error: {
            type: 'authorization' as const,
            message: 'You do not have access to submit a proposal for this RFP',
          },
        }
      }
    }

    // Check if proposal already exists
    const { data: existingProposal } = await supabase
      .from('proposals')
      .select('id')
      .eq('rfp_id', data.rfpId)
      .eq('vendor_id', vendorProfile.id)
      .single()

    if (existingProposal) {
      return {
        success: false,
        error: {
          type: 'validation' as const,
          message: 'You have already submitted a proposal for this RFP',
        },
      }
    }

    // Insert proposal
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .insert({
        rfp_id: data.rfpId,
        vendor_id: vendorProfile.id,
        cover_letter: data.coverLetter,
        timeline: data.timeline,
        cost: data.cost,
        payment_terms: data.paymentTerms,
        status: 'submitted',
        attachments: [],
      })
      .select('id')
      .single()

    if (proposalError || !proposal) {
      console.error('Failed to create proposal:', proposalError)
      return {
        success: false,
        error: {
          type: 'database' as const,
          message: 'Failed to submit proposal. Please try again.',
        },
      }
    }

    // Revalidate relevant pages
    revalidatePath(`/rfps/${data.rfpId}`)

    return {
      success: true,
      data: { id: proposal.id },
    }
  } catch (error) {
    console.error('Error creating proposal:', error)
    return {
      success: false,
      error: {
        type: 'unknown' as const,
        message: 'An unexpected error occurred. Please try again.',
      },
    }
  }
}

/**
 * Upload file to Supabase Storage for proposal attachments
 */
export async function uploadProposalAttachment(
  proposalId: string,
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Require authentication
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    // Validate file
    const validation = fileUploadSchema.safeParse({
      name: file.name,
      size: file.size,
      type: file.type,
    })

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message || 'Invalid file',
      }
    }

    // Check if user owns this proposal
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select('id, vendor_id, vendor_profiles!proposals_vendor_id_fkey(user_id)')
      .eq('id', proposalId)
      .single()

    if (proposalError || !proposal) {
      return {
        success: false,
        error: 'Proposal not found',
      }
    }

    // @ts-ignore - Type issue with nested select
    if (proposal.vendor_profiles?.user_id !== user.id) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Upload to Supabase Storage
    const fileName = `${proposalId}/${Date.now()}-${file.name}`
    const { data, error: uploadError } = await supabase.storage
      .from('proposal-attachments')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return {
        success: false,
        error: 'Upload failed. Please try again.',
      }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('proposal-attachments').getPublicUrl(fileName)

    // Update proposal with new attachment
    const { data: currentProposal, error: fetchError } = await supabase
      .from('proposals')
      .select('attachments')
      .eq('id', proposalId)
      .single()

    if (fetchError) {
      return {
        success: false,
        error: 'Failed to update attachments',
      }
    }

    const currentAttachments = (currentProposal.attachments as any[]) || []
    const newAttachments = [
      ...currentAttachments,
      {
        name: file.name,
        url: publicUrl,
        size: file.size,
      },
    ]

    const { error: updateError } = await supabase
      .from('proposals')
      .update({ attachments: newAttachments })
      .eq('id', proposalId)

    if (updateError) {
      // Try to delete the uploaded file
      await supabase.storage.from('proposal-attachments').remove([fileName])
      return {
        success: false,
        error: 'Failed to save attachment',
      }
    }

    return {
      success: true,
      url: publicUrl,
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

/**
 * Remove file from proposal attachments
 */
export async function removeProposalAttachment(
  proposalId: string,
  fileUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Require authentication
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    // Check if user owns this proposal
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select('id, vendor_id, vendor_profiles!proposals_vendor_id_fkey(user_id)')
      .eq('id', proposalId)
      .single()

    if (proposalError || !proposal) {
      return {
        success: false,
        error: 'Proposal not found',
      }
    }

    // @ts-ignore - Type issue with nested select
    if (proposal.vendor_profiles?.user_id !== user.id) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Get current attachments
    const { data: currentProposal, error: fetchError } = await supabase
      .from('proposals')
      .select('attachments')
      .eq('id', proposalId)
      .single()

    if (fetchError) {
      return {
        success: false,
        error: 'Failed to fetch attachments',
      }
    }

    const currentAttachments = (currentProposal.attachments as any[]) || []
    const newAttachments = currentAttachments.filter(
      (att: any) => att.url !== fileUrl
    )

    // Update database
    const { error: updateError } = await supabase
      .from('proposals')
      .update({ attachments: newAttachments })
      .eq('id', proposalId)

    if (updateError) {
      return {
        success: false,
        error: 'Failed to remove attachment',
      }
    }

    // Extract file path from URL and delete from storage
    try {
      const urlParts = fileUrl.split('/proposal-attachments/')
      if (urlParts.length === 2) {
        const filePath = urlParts[1]
        await supabase.storage.from('proposal-attachments').remove([filePath])
      }
    } catch (storageError) {
      // Log but don't fail - file might already be deleted
      console.error('Storage deletion error:', storageError)
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error removing file:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

/**
 * Update an existing proposal
 */
export async function updateProposal(
  proposalId: string,
  data: {
    coverLetter: string
    timeline: string
    cost: number
    paymentTerms: string
  }
) {
  try {
    // Require authentication
    const user = await requireAuth()
    const userProfile = await getUserProfile()

    // Check if user is a vendor
    if (userProfile?.account_type !== 'vendor') {
      return {
        success: false,
        error: {
          type: 'authorization' as const,
          message: 'Only vendors can update proposals',
        },
      }
    }

    const supabase = await createServerSupabaseClient()

    // Get the proposal with vendor and RFP info
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select(
        `
        id,
        status,
        rfp_id,
        vendor:vendor_profiles!proposals_vendor_id_fkey (
          id,
          user_id
        )
      `
      )
      .eq('id', proposalId)
      .single()

    if (proposalError || !proposal) {
      return {
        success: false,
        error: {
          type: 'validation' as const,
          message: 'Proposal not found',
        },
      }
    }

    // Check if user owns this proposal
    // @ts-ignore - Type issue with nested select
    if (proposal.vendor?.user_id !== user.id) {
      return {
        success: false,
        error: {
          type: 'authorization' as const,
          message: 'You can only edit your own proposals',
        },
      }
    }

    // Check if proposal can be edited (only submitted status)
    if (proposal.status !== 'submitted') {
      return {
        success: false,
        error: {
          type: 'validation' as const,
          message: 'You can only edit proposals with "submitted" status',
        },
      }
    }

    // Update proposal
    const { error: updateError } = await supabase
      .from('proposals')
      .update({
        cover_letter: data.coverLetter,
        timeline: data.timeline,
        cost: data.cost,
        payment_terms: data.paymentTerms,
        updated_at: new Date().toISOString(),
      })
      .eq('id', proposalId)

    if (updateError) {
      console.error('Failed to update proposal:', updateError)
      return {
        success: false,
        error: {
          type: 'database' as const,
          message: 'Failed to update proposal. Please try again.',
        },
      }
    }

    // Revalidate relevant pages
    revalidatePath(`/rfps/${proposal.rfp_id}`)

    return {
      success: true,
      message: 'Proposal updated successfully',
    }
  } catch (error) {
    console.error('Error updating proposal:', error)
    return {
      success: false,
      error: {
        type: 'unknown' as const,
        message: 'An unexpected error occurred. Please try again.',
      },
    }
  }
}
