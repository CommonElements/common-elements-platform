-- Migration: Create Storage Buckets and Policies
-- Description: Creates Supabase Storage buckets for file uploads and sets up access policies

-- ============================================================================
-- CREATE STORAGE BUCKETS
-- ============================================================================

-- Create bucket for RFP attachments (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('rfp-attachments', 'rfp-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Create bucket for proposal attachments (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('proposal-attachments', 'proposal-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Create bucket for user avatars (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- RFP ATTACHMENTS BUCKET POLICIES
-- ============================================================================

-- Allow authenticated users to upload files to their own RFP folders
CREATE POLICY "Users can upload RFP attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'rfp-attachments' AND
  -- Check if user is the RFP creator
  EXISTS (
    SELECT 1 FROM rfps r
    JOIN community_profiles cp ON r.creator_id = cp.id
    WHERE (storage.foldername(name))[1] = r.id::text
      AND cp.user_id = auth.uid()
  )
);

-- Allow RFP creators and approved vendors to view attachments
CREATE POLICY "RFP attachments viewable by creator and approved vendors"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'rfp-attachments' AND (
    -- Creator can access
    EXISTS (
      SELECT 1 FROM rfps r
      JOIN community_profiles cp ON r.creator_id = cp.id
      WHERE (storage.foldername(name))[1] = r.id::text
        AND cp.user_id = auth.uid()
    )
    OR
    -- Approved vendor can access
    EXISTS (
      SELECT 1 FROM rfps r
      JOIN rfp_approved_vendors rav ON r.id = rav.rfp_id
      JOIN vendor_profiles vp ON rav.vendor_id = vp.id
      WHERE (storage.foldername(name))[1] = r.id::text
        AND rav.status = 'approved'
        AND vp.user_id = auth.uid()
    )
    OR
    -- Public RFPs are visible to all authenticated users
    EXISTS (
      SELECT 1 FROM rfps r
      WHERE (storage.foldername(name))[1] = r.id::text
        AND r.visibility = 'public'
    )
  )
);

-- Allow RFP creators to delete their attachments
CREATE POLICY "RFP creators can delete attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'rfp-attachments' AND
  EXISTS (
    SELECT 1 FROM rfps r
    JOIN community_profiles cp ON r.creator_id = cp.id
    WHERE (storage.foldername(name))[1] = r.id::text
      AND cp.user_id = auth.uid()
  )
);

-- ============================================================================
-- PROPOSAL ATTACHMENTS BUCKET POLICIES
-- ============================================================================

-- Allow vendors to upload files to their own proposal folders
CREATE POLICY "Vendors can upload proposal attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'proposal-attachments' AND
  -- Check if user is the proposal vendor
  EXISTS (
    SELECT 1 FROM proposals p
    JOIN vendor_profiles vp ON p.vendor_id = vp.id
    WHERE (storage.foldername(name))[1] = p.id::text
      AND vp.user_id = auth.uid()
  )
);

-- Allow proposal vendors and RFP creators to view attachments
CREATE POLICY "Proposal attachments viewable by vendor and RFP creator"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'proposal-attachments' AND (
    -- Vendor can access their own proposal attachments
    EXISTS (
      SELECT 1 FROM proposals p
      JOIN vendor_profiles vp ON p.vendor_id = vp.id
      WHERE (storage.foldername(name))[1] = p.id::text
        AND vp.user_id = auth.uid()
    )
    OR
    -- RFP creator can access all proposal attachments for their RFP
    EXISTS (
      SELECT 1 FROM proposals p
      JOIN rfps r ON p.rfp_id = r.id
      JOIN community_profiles cp ON r.creator_id = cp.id
      WHERE (storage.foldername(name))[1] = p.id::text
        AND cp.user_id = auth.uid()
    )
  )
);

-- Allow vendors to delete their own proposal attachments
CREATE POLICY "Vendors can delete own proposal attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'proposal-attachments' AND
  EXISTS (
    SELECT 1 FROM proposals p
    JOIN vendor_profiles vp ON p.vendor_id = vp.id
    WHERE (storage.foldername(name))[1] = p.id::text
      AND vp.user_id = auth.uid()
  )
);

-- ============================================================================
-- AVATARS BUCKET POLICIES
-- ============================================================================

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow everyone to view avatars (public bucket)
CREATE POLICY "Avatars are publicly viewable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow users to update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
