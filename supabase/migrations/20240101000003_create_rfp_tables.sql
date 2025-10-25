-- Migration: Create RFP tables
-- Description: Creates rfps, rfp_private_details, rfp_approved_vendors, proposals, and rfp_messages tables

-- Create rfps table
CREATE TABLE rfps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES community_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  visibility TEXT NOT NULL CHECK (visibility IN ('private', 'public')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('draft', 'open', 'reviewing', 'awarded', 'closed')),
  deadline TIMESTAMPTZ,
  budget_min DECIMAL,
  budget_max DECIMAL,
  proposal_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_rfps_creator ON rfps(creator_id);
CREATE INDEX idx_rfps_status ON rfps(status);
CREATE INDEX idx_rfps_visibility ON rfps(visibility);
CREATE INDEX idx_rfps_category ON rfps(category);
CREATE INDEX idx_rfps_created ON rfps(created_at DESC);
CREATE INDEX idx_rfps_deadline ON rfps(deadline);

-- Create rfp_private_details table
CREATE TABLE rfp_private_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfp_id UUID UNIQUE NOT NULL REFERENCES rfps(id) ON DELETE CASCADE,
  property_address TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  detailed_scope TEXT NOT NULL,
  special_requirements TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on rfp_id for faster joins
CREATE INDEX idx_rfp_private_details_rfp_id ON rfp_private_details(rfp_id);

-- Create rfp_approved_vendors table
CREATE TABLE rfp_approved_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfp_id UUID NOT NULL REFERENCES rfps(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  UNIQUE(rfp_id, vendor_id)
);

-- Create indexes for faster queries
CREATE INDEX idx_rfp_approved_vendors_rfp ON rfp_approved_vendors(rfp_id);
CREATE INDEX idx_rfp_approved_vendors_vendor ON rfp_approved_vendors(vendor_id);
CREATE INDEX idx_rfp_approved_vendors_status ON rfp_approved_vendors(status);

-- Create proposals table
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfp_id UUID NOT NULL REFERENCES rfps(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
  cover_letter TEXT NOT NULL,
  timeline TEXT NOT NULL,
  cost DECIMAL NOT NULL,
  payment_terms TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(rfp_id, vendor_id)
);

-- Create indexes for faster queries
CREATE INDEX idx_proposals_rfp ON proposals(rfp_id);
CREATE INDEX idx_proposals_vendor ON proposals(vendor_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_created ON proposals(created_at DESC);

-- Create rfp_messages table
CREATE TABLE rfp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfp_id UUID NOT NULL REFERENCES rfps(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_rfp_messages_rfp ON rfp_messages(rfp_id);
CREATE INDEX idx_rfp_messages_sender ON rfp_messages(sender_id);
CREATE INDEX idx_rfp_messages_recipient ON rfp_messages(recipient_id, read_at);
CREATE INDEX idx_rfp_messages_created ON rfp_messages(created_at ASC);

-- Add comments for documentation
COMMENT ON TABLE rfps IS 'Requests for Proposals created by community members';
COMMENT ON TABLE rfp_private_details IS 'Private details for RFPs (address, contact info, detailed scope)';
COMMENT ON TABLE rfp_approved_vendors IS 'Vendors approved to view private RFP details and submit proposals';
COMMENT ON TABLE proposals IS 'Vendor proposals submitted in response to RFPs';
COMMENT ON TABLE rfp_messages IS 'Messages between RFP creators and vendors';
