-- Migration: Fix user_roles RLS infinite recursion
-- Description: Drops problematic recursive policies and creates simple, non-recursive ones

-- Temporarily disable RLS to make changes
ALTER TABLE IF EXISTS public.user_roles DISABLE ROW LEVEL SECURITY;

-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can delete their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.user_roles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.user_roles;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.user_roles;
DROP POLICY IF EXISTS "Service role has full access" ON public.user_roles;

-- Re-enable RLS
ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
-- Allow users to view their own roles
CREATE POLICY "user_roles_select_policy"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Allow service role full access (for admin operations)
CREATE POLICY "user_roles_service_role_policy"
ON public.user_roles FOR ALL
USING (auth.role() = 'service_role');

-- Allow authenticated users to read all roles (if needed for admin dashboards)
-- CREATE POLICY "user_roles_read_all_policy"
-- ON public.user_roles FOR SELECT
-- USING (auth.role() = 'authenticated');

COMMENT ON POLICY "user_roles_select_policy" ON public.user_roles IS 'Users can view their own role assignments';
COMMENT ON POLICY "user_roles_service_role_policy" ON public.user_roles IS 'Service role has full access for administrative operations';
