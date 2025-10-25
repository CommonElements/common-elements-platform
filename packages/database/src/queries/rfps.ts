/**
 * RFP-related database queries
 */

import { createServerSupabaseClient } from '../server'

export interface GetRFPsOptions {
  status?: string
  category?: string
  visibility?: 'public' | 'private'
  limit?: number
  offset?: number
  userId?: string // For filtering by user access
}

export interface RFP {
  id: string
  title: string
  category: string
  description: string
  visibility: 'public' | 'private'
  status: string
  deadline: string | null
  budget_min: number | null
  budget_max: number | null
  proposal_count: number
  created_at: string
  updated_at: string
  creator: {
    id: string
    user_id: string
    role: string
    property_name: string
    property_location: string
    user: {
      id: string
      full_name: string
      avatar_url: string | null
    }
  }
}

export interface RFPPrivateDetails {
  id: string
  rfp_id: string
  property_address: string
  contact_name: string
  contact_email: string
  contact_phone: string | null
  detailed_scope: string
  special_requirements: string | null
  attachments: Array<{
    name: string
    url: string
    size: number
  }>
}

export interface Proposal {
  id: string
  rfp_id: string
  cover_letter: string
  timeline: string
  cost: number
  payment_terms: string
  attachments: Array<{
    name: string
    url: string
    size: number
  }>
  status: string
  created_at: string
  updated_at: string
  vendor: {
    id: string
    user_id: string
    company_name: string
    service_categories: string[]
    service_areas: string[]
    user: {
      id: string
      full_name: string
      avatar_url: string | null
    }
  }
}

export interface RFPMessage {
  id: string
  rfp_id: string
  content: string
  read_at: string | null
  created_at: string
  sender: {
    id: string
    full_name: string
    avatar_url: string | null
    account_type: string
  }
  recipient: {
    id: string
    full_name: string
    avatar_url: string | null
    account_type: string
  }
}

/**
 * Fetch RFPs with filters and pagination
 * Optimized to use composite indexes and fetch only necessary columns
 */
export async function getRFPs(options: GetRFPsOptions = {}) {
  const {
    status,
    category,
    visibility,
    limit = 20,
    offset = 0,
    userId,
  } = options

  const supabase = await createServerSupabaseClient()

  // Build query with only necessary columns
  // Uses idx_rfps_list_covering, idx_rfps_status_visibility, or idx_rfps_category_status
  let query = supabase
    .from('rfps')
    .select(
      `
      id,
      title,
      category,
      description,
      visibility,
      status,
      deadline,
      proposal_count,
      created_at,
      creator_id,
      creator:community_profiles!rfps_creator_id_fkey (
        id,
        user_id,
        role,
        property_name,
        property_location,
        user:users!community_profiles_user_id_fkey (
          id,
          full_name,
          avatar_url
        )
      )
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // Apply filters (uses composite indexes for better performance)
  if (status) {
    query = query.eq('status', status)
  }

  if (category) {
    query = query.eq('category', category)
  }

  if (visibility) {
    query = query.eq('visibility', visibility)
  }

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch RFPs: ${error.message}`)
  }

  return {
    rfps: data as unknown as RFP[],
    total: count || 0,
  }
}

/**
 * Fetch a single RFP with creator and proposal count
 * Optimized to fetch only necessary columns
 */
export async function getRFP(rfpId: string) {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('rfps')
    .select(
      `
      id,
      title,
      category,
      description,
      visibility,
      status,
      deadline,
      budget_min,
      budget_max,
      proposal_count,
      created_at,
      updated_at,
      creator_id,
      creator:community_profiles!rfps_creator_id_fkey (
        id,
        user_id,
        role,
        property_name,
        property_location,
        user:users!community_profiles_user_id_fkey (
          id,
          full_name,
          avatar_url
        )
      )
    `
    )
    .eq('id', rfpId)
    .single()

  if (error) {
    throw new Error(`Failed to fetch RFP: ${error.message}`)
  }

  return data as unknown as RFP
}

/**
 * Fetch RFP private details with authorization check
 * Note: RLS policies enforce authorization at the database level
 */
export async function getRFPPrivateDetails(rfpId: string) {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('rfp_private_details')
    .select(
      `
      id,
      rfp_id,
      property_address,
      contact_name,
      contact_email,
      contact_phone,
      detailed_scope,
      special_requirements,
      attachments
    `
    )
    .eq('rfp_id', rfpId)
    .single()

  if (error) {
    // If error is due to RLS, return null instead of throwing
    if (error.code === 'PGRST116' || error.message.includes('row-level security')) {
      return null
    }
    throw new Error(`Failed to fetch RFP private details: ${error.message}`)
  }

  return data as RFPPrivateDetails
}

/**
 * Fetch proposals for an RFP
 * Optimized to use idx_proposals_rfp index and fetch only necessary columns
 */
export async function getProposals(rfpId: string) {
  const supabase = await createServerSupabaseClient()

  // Uses idx_proposals_rfp for efficient filtering
  const { data, error } = await supabase
    .from('proposals')
    .select(
      `
      id,
      rfp_id,
      cover_letter,
      timeline,
      cost,
      payment_terms,
      attachments,
      status,
      created_at,
      vendor_id,
      vendor:vendor_profiles!proposals_vendor_id_fkey (
        id,
        user_id,
        company_name,
        service_categories,
        service_areas,
        user:users!vendor_profiles_user_id_fkey (
          id,
          full_name,
          avatar_url
        )
      )
    `
    )
    .eq('rfp_id', rfpId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch proposals: ${error.message}`)
  }

  return data as unknown as Proposal[]
}

/**
 * Fetch a single proposal by ID
 */
export async function getProposal(proposalId: string) {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('proposals')
    .select(
      `
      id,
      rfp_id,
      cover_letter,
      timeline,
      cost,
      payment_terms,
      attachments,
      status,
      created_at,
      updated_at,
      vendor:vendor_profiles!proposals_vendor_id_fkey (
        id,
        user_id,
        company_name,
        service_categories,
        service_areas,
        user:users!vendor_profiles_user_id_fkey (
          id,
          full_name,
          avatar_url
        )
      ),
      rfp:rfps!proposals_rfp_id_fkey (
        id,
        title,
        category,
        status
      )
    `
    )
    .eq('id', proposalId)
    .single()

  if (error) {
    throw new Error(`Failed to fetch proposal: ${error.message}`)
  }

  return data as unknown as Proposal & {
    rfp: {
      id: string
      title: string
      category: string
      status: string
    }
  }
}

/**
 * Fetch messages for an RFP with sender/recipient info
 * Optimized to use idx_rfp_messages_rfp index
 */
export async function getRFPMessages(rfpId: string) {
  const supabase = await createServerSupabaseClient()

  // Uses idx_rfp_messages_rfp for efficient filtering
  const { data, error } = await supabase
    .from('rfp_messages')
    .select(
      `
      id,
      rfp_id,
      content,
      read_at,
      created_at,
      sender_id,
      recipient_id,
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
    .eq('rfp_id', rfpId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch RFP messages: ${error.message}`)
  }

  return data as unknown as RFPMessage[]
}

export interface PendingVendorApproval {
  id: string
  rfp_id: string
  status: string
  requested_at: string
  rfp: {
    id: string
    title: string
    category: string
  }
  vendor: {
    id: string
    user_id: string
    company_name: string
    service_categories: string[]
    service_areas: string[]
    business_description: string | null
    user: {
      id: string
      full_name: string
      avatar_url: string | null
    }
  }
}

/**
 * Fetch pending vendor approval requests for a community member's RFPs
 */
export async function getPendingVendorApprovals(userId: string) {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('rfp_approved_vendors')
    .select(
      `
      id,
      rfp_id,
      status,
      requested_at,
      rfp:rfps!rfp_approved_vendors_rfp_id_fkey (
        id,
        title,
        category,
        creator:community_profiles!rfps_creator_id_fkey (
          user_id
        )
      ),
      vendor:vendor_profiles!rfp_approved_vendors_vendor_id_fkey (
        id,
        user_id,
        company_name,
        service_categories,
        service_areas,
        business_description,
        user:users!vendor_profiles_user_id_fkey (
          id,
          full_name,
          avatar_url
        )
      )
    `
    )
    .eq('status', 'pending')
    .order('requested_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch pending approvals: ${error.message}`)
  }

  // Filter to only include RFPs created by this user
  const filtered = (data as any[]).filter(
    (approval) => approval.rfp?.creator?.user_id === userId
  )

  return filtered as unknown as PendingVendorApproval[]
}

/**
 * Get unread message count for a user
 * Optimized to use idx_rfp_messages_recipient_unread partial index
 */
export async function getUnreadMessageCount(userId: string) {
  const supabase = await createServerSupabaseClient()

  // Uses idx_rfp_messages_recipient_unread partial index for very fast counts
  const { count, error } = await supabase
    .from('rfp_messages')
    .select('id', { count: 'exact', head: true })
    .eq('recipient_id', userId)
    .is('read_at', null)

  if (error) {
    throw new Error(`Failed to fetch unread message count: ${error.message}`)
  }

  return count || 0
}

/**
 * Get unread messages grouped by RFP
 */
export async function getUnreadMessagesByRFP(userId: string) {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('rfp_messages')
    .select(
      `
      id,
      rfp_id,
      sender_id,
      rfp:rfps!rfp_messages_rfp_id_fkey (
        id,
        title
      ),
      sender:users!rfp_messages_sender_id_fkey (
        id,
        full_name,
        avatar_url
      )
    `
    )
    .eq('recipient_id', userId)
    .is('read_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch unread messages: ${error.message}`)
  }

  // Group by RFP and sender
  const grouped = (data as any[]).reduce((acc, msg) => {
    const key = `${msg.rfp_id}-${msg.sender_id}`
    if (!acc[key]) {
      acc[key] = {
        rfpId: msg.rfp_id,
        rfpTitle: msg.rfp?.title,
        senderId: msg.sender_id,
        senderName: msg.sender?.full_name,
        senderAvatar: msg.sender?.avatar_url,
        count: 0,
      }
    }
    acc[key].count++
    return acc
  }, {})

  return Object.values(grouped) as Array<{
    rfpId: string
    rfpTitle: string
    senderId: string
    senderName: string
    senderAvatar: string | null
    count: number
  }>
}
