-- Migration: Create Row Level Security policies
-- Description: Enables RLS and creates policies for all tables to enforce authorization at the database level

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfps ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfp_private_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfp_approved_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfp_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Anyone can read public user info
CREATE POLICY "Users are viewable by everyone"
ON users FOR SELECT
USING (true);

-- Users can update their own record
CREATE POLICY "Users can update own record"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Users can insert their own record (during signup)
CREATE POLICY "Users can insert own record"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================================================
-- COMMUNITY PROFILES TABLE POLICIES
-- ============================================================================

-- Anyone can read profiles (respecting privacy settings in application layer)
CREATE POLICY "Community profiles are viewable by everyone"
ON community_profiles FOR SELECT
USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert own community profile"
ON community_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own community profile"
ON community_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- ============================================================================
-- VENDOR PROFILES TABLE POLICIES
-- ============================================================================

-- Anyone can read vendor profiles
CREATE POLICY "Vendor profiles are viewable by everyone"
ON vendor_profiles FOR SELECT
USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert own vendor profile"
ON vendor_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own vendor profile"
ON vendor_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- ============================================================================
-- FORUM CATEGORIES TABLE POLICIES
-- ============================================================================

-- Anyone can read forum categories
CREATE POLICY "Forum categories are viewable by everyone"
ON forum_categories FOR SELECT
USING (true);

-- ============================================================================
-- FORUM POSTS TABLE POLICIES
-- ============================================================================

-- Anyone can read posts
CREATE POLICY "Forum posts are viewable by everyone"
ON forum_posts FOR SELECT
USING (true);

-- Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts"
ON forum_posts FOR INSERT
WITH CHECK (auth.uid() = author_id);

-- Authors can update their own posts
CREATE POLICY "Authors can update own posts"
ON forum_posts FOR UPDATE
USING (auth.uid() = author_id);

-- Authors can delete their own posts
CREATE POLICY "Authors can delete own posts"
ON forum_posts FOR DELETE
USING (auth.uid() = author_id);

-- ============================================================================
-- FORUM COMMENTS TABLE POLICIES
-- ============================================================================

-- Anyone can read comments
CREATE POLICY "Forum comments are viewable by everyone"
ON forum_comments FOR SELECT
USING (true);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
ON forum_comments FOR INSERT
WITH CHECK (auth.uid() = author_id);

-- Authors can update their own comments
CREATE POLICY "Authors can update own comments"
ON forum_comments FOR UPDATE
USING (auth.uid() = author_id);

-- Authors can delete their own comments
CREATE POLICY "Authors can delete own comments"
ON forum_comments FOR DELETE
USING (auth.uid() = author_id);

-- ============================================================================
-- FORUM VOTES TABLE POLICIES
-- ============================================================================

-- Users can read all votes
CREATE POLICY "Forum votes are viewable by everyone"
ON forum_votes FOR SELECT
USING (true);

-- Users can insert their own votes
CREATE POLICY "Users can insert own votes"
ON forum_votes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own votes (change direction)
CREATE POLICY "Users can update own votes"
ON forum_votes FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own votes
CREATE POLICY "Users can delete own votes"
ON forum_votes FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- RFPS TABLE POLICIES
-- ============================================================================

-- Anyone can read basic RFP info
CREATE POLICY "RFPs are viewable by everyone"
ON rfps FOR SELECT
USING (true);

-- Only community members can create RFPs
CREATE POLICY "Community members can create RFPs"
ON rfps FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM community_profiles
    WHERE user_id = auth.uid() AND id = creator_id
  )
);

-- Creators can update their own RFPs
CREATE POLICY "Creators can update own RFPs"
ON rfps FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM community_profiles
    WHERE user_id = auth.uid() AND id = creator_id
  )
);

-- Creators can delete their own RFPs
CREATE POLICY "Creators can delete own RFPs"
ON rfps FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM community_profiles
    WHERE user_id = auth.uid() AND id = creator_id
  )
);

-- ============================================================================
-- RFP PRIVATE DETAILS TABLE POLICIES
-- ============================================================================

-- Only creator and approved vendors can read private details
-- Public RFPs are visible to all authenticated users
CREATE POLICY "Private details viewable by creator and approved vendors"
ON rfp_private_details FOR SELECT
USING (
  -- Creator can see
  EXISTS (
    SELECT 1 FROM rfps r
    JOIN community_profiles cp ON r.creator_id = cp.id
    WHERE r.id = rfp_id AND cp.user_id = auth.uid()
  )
  OR
  -- Approved vendor can see
  EXISTS (
    SELECT 1 FROM rfps r
    JOIN rfp_approved_vendors rav ON r.id = rav.rfp_id
    JOIN vendor_profiles vp ON rav.vendor_id = vp.id
    WHERE rav.rfp_id = rfp_id 
      AND rav.status = 'approved'
      AND vp.user_id = auth.uid()
  )
  OR
  -- Public RFPs are visible to all authenticated users
  EXISTS (
    SELECT 1 FROM rfps
    WHERE id = rfp_id AND visibility = 'public' AND auth.uid() IS NOT NULL
  )
);

-- Only creator can insert private details
CREATE POLICY "Creators can insert private details"
ON rfp_private_details FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM rfps r
    JOIN community_profiles cp ON r.creator_id = cp.id
    WHERE r.id = rfp_id AND cp.user_id = auth.uid()
  )
);

-- Only creator can update private details
CREATE POLICY "Creators can update private details"
ON rfp_private_details FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM rfps r
    JOIN community_profiles cp ON r.creator_id = cp.id
    WHERE r.id = rfp_id AND cp.user_id = auth.uid()
  )
);

-- ============================================================================
-- RFP APPROVED VENDORS TABLE POLICIES
-- ============================================================================

-- Creators and vendors can read approval records
CREATE POLICY "Approval records viewable by creator and vendor"
ON rfp_approved_vendors FOR SELECT
USING (
  -- Creator can see all approval records for their RFPs
  EXISTS (
    SELECT 1 FROM rfps r
    JOIN community_profiles cp ON r.creator_id = cp.id
    WHERE r.id = rfp_id AND cp.user_id = auth.uid()
  )
  OR
  -- Vendor can see their own approval records
  EXISTS (
    SELECT 1 FROM vendor_profiles vp
    WHERE vp.id = vendor_id AND vp.user_id = auth.uid()
  )
);

-- Vendors can request approval (insert pending record)
CREATE POLICY "Vendors can request approval"
ON rfp_approved_vendors FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM vendor_profiles
    WHERE id = vendor_id AND user_id = auth.uid()
  )
  AND status = 'pending'
);

-- Creators can update approval status
CREATE POLICY "Creators can update approval status"
ON rfp_approved_vendors FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM rfps r
    JOIN community_profiles cp ON r.creator_id = cp.id
    WHERE r.id = rfp_id AND cp.user_id = auth.uid()
  )
);

-- ============================================================================
-- PROPOSALS TABLE POLICIES
-- ============================================================================

-- Creator can see all proposals for their RFPs
-- Vendors can see only their own proposals
CREATE POLICY "Proposals viewable by creator and vendor"
ON proposals FOR SELECT
USING (
  -- RFP creator can see all proposals
  EXISTS (
    SELECT 1 FROM rfps r
    JOIN community_profiles cp ON r.creator_id = cp.id
    WHERE r.id = rfp_id AND cp.user_id = auth.uid()
  )
  OR
  -- Vendor can see their own proposal
  EXISTS (
    SELECT 1 FROM vendor_profiles vp
    WHERE vp.id = vendor_id AND vp.user_id = auth.uid()
  )
);

-- Only vendors can create proposals
CREATE POLICY "Vendors can create proposals"
ON proposals FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM vendor_profiles
    WHERE id = vendor_id AND user_id = auth.uid()
  )
);

-- Vendors can update their own proposals
CREATE POLICY "Vendors can update own proposals"
ON proposals FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM vendor_profiles
    WHERE id = vendor_id AND user_id = auth.uid()
  )
);

-- Vendors can delete their own proposals
CREATE POLICY "Vendors can delete own proposals"
ON proposals FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM vendor_profiles
    WHERE id = vendor_id AND user_id = auth.uid()
  )
);

-- ============================================================================
-- RFP MESSAGES TABLE POLICIES
-- ============================================================================

-- Users can read messages where they are sender or recipient
CREATE POLICY "Users can read own messages"
ON rfp_messages FOR SELECT
USING (
  auth.uid() = sender_id OR auth.uid() = recipient_id
);

-- Users can send messages
CREATE POLICY "Users can send messages"
ON rfp_messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Users can update their own sent messages (e.g., mark as edited)
CREATE POLICY "Users can update own sent messages"
ON rfp_messages FOR UPDATE
USING (auth.uid() = sender_id);

-- Add comments for documentation
COMMENT ON POLICY "Users are viewable by everyone" ON users IS 'Public user information is visible to all users';
COMMENT ON POLICY "Private details viewable by creator and approved vendors" ON rfp_private_details IS 'Enforces private RFP access control at database level';
COMMENT ON POLICY "Proposals viewable by creator and vendor" ON proposals IS 'Ensures proposals are only visible to RFP creator and the vendor who submitted it';
