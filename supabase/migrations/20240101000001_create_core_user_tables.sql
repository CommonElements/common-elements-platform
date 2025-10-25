-- Migration: Create core user tables
-- Description: Creates users, community_profiles, and vendor_profiles tables

-- Create users table (extends auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('community_member', 'vendor')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Create community_profiles table
CREATE TABLE community_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN (
    'board_president', 
    'board_member', 
    'property_manager', 
    'attorney', 
    'committee_member', 
    'resident'
  )),
  property_name TEXT NOT NULL,
  property_location TEXT NOT NULL,
  license_type TEXT,
  license_number TEXT,
  hide_property_name BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for faster joins
CREATE INDEX idx_community_profiles_user_id ON community_profiles(user_id);

-- Create vendor_profiles table
CREATE TABLE vendor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  service_categories TEXT[] NOT NULL,
  service_areas TEXT[] NOT NULL,
  business_description TEXT,
  license_info TEXT,
  insurance_info TEXT,
  years_in_business INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for faster joins
CREATE INDEX idx_vendor_profiles_user_id ON vendor_profiles(user_id);

-- Create indexes on array columns for faster filtering
CREATE INDEX idx_vendor_profiles_service_categories ON vendor_profiles USING GIN(service_categories);
CREATE INDEX idx_vendor_profiles_service_areas ON vendor_profiles USING GIN(service_areas);

-- Add comments for documentation
COMMENT ON TABLE users IS 'Core user table extending Supabase auth.users';
COMMENT ON TABLE community_profiles IS 'Profile information for community members (board presidents, property managers, etc.)';
COMMENT ON TABLE vendor_profiles IS 'Profile information for service vendors';
