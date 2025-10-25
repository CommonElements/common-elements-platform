/**
 * User-related database queries
 */

import { createServerSupabaseClient } from '../server'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  account_type: 'community_member' | 'vendor'
  avatar_url: string | null
  created_at: string
  community_profile?: CommunityProfile
  vendor_profile?: VendorProfile
}

export interface CommunityProfile {
  id: string
  user_id: string
  role: string
  property_name: string
  property_location: string
  license_type: string | null
  license_number: string | null
  hide_property_name: boolean
}

export interface VendorProfile {
  id: string
  user_id: string
  company_name: string
  service_categories: string[]
  service_areas: string[]
  business_description: string | null
  license_info: string | null
  insurance_info: string | null
  years_in_business: number | null
}

export interface UserPost {
  id: string
  title: string
  content: string
  vote_count: number
  comment_count: number
  created_at: string
  category: {
    id: string
    name: string
    slug: string
  }
}

export interface UserComment {
  id: string
  content: string
  vote_count: number
  created_at: string
  post: {
    id: string
    title: string
  }
}

/**
 * Fetch user profile with account type detection
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createServerSupabaseClient()

  // First, get the user
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email, full_name, account_type, avatar_url, created_at')
    .eq('id', userId)
    .single()

  if (userError || !user) {
    return null
  }

  // Then fetch the appropriate profile based on account type
  if (user.account_type === 'community_member') {
    const { data: communityProfile } = await supabase
      .from('community_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    return {
      ...user,
      community_profile: communityProfile as CommunityProfile,
    } as UserProfile
  } else if (user.account_type === 'vendor') {
    const { data: vendorProfile } = await supabase
      .from('vendor_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    return {
      ...user,
      vendor_profile: vendorProfile as VendorProfile,
    } as UserProfile
  }

  return user as UserProfile
}

/**
 * Fetch posts created by a user
 * Optimized to use idx_forum_posts_author index and fetch only necessary columns
 */
export async function getUserPosts(userId: string, limit = 10) {
  const supabase = await createServerSupabaseClient()

  // Uses idx_forum_posts_author for efficient filtering
  const { data, error } = await supabase
    .from('forum_posts')
    .select(
      `
      id,
      title,
      content,
      vote_count,
      comment_count,
      created_at,
      category_id,
      category:forum_categories!forum_posts_category_id_fkey (
        id,
        name,
        slug
      )
    `
    )
    .eq('author_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to fetch user posts: ${error.message}`)
  }

  return data as unknown as UserPost[]
}

/**
 * Fetch comments created by a user
 * Optimized to use idx_forum_comments_author index and fetch only necessary columns
 */
export async function getUserComments(userId: string, limit = 10) {
  const supabase = await createServerSupabaseClient()

  // Uses idx_forum_comments_author for efficient filtering
  const { data, error } = await supabase
    .from('forum_comments')
    .select(
      `
      id,
      content,
      vote_count,
      created_at,
      post_id,
      post:forum_posts!forum_comments_post_id_fkey (
        id,
        title
      )
    `
    )
    .eq('author_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to fetch user comments: ${error.message}`)
  }

  return data as unknown as UserComment[]
}

/**
 * Fetch vendor profile with services and areas
 */
export async function getVendorProfile(userId: string): Promise<VendorProfile | null> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('vendor_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    return null
  }

  return data as VendorProfile
}

/**
 * Fetch community profile with property info
 */
export async function getCommunityProfile(userId: string): Promise<CommunityProfile | null> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('community_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    return null
  }

  return data as CommunityProfile
}
