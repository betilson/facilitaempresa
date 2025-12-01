-- Fix RLS policies for banks table to allow branch creation

-- First, check if RLS is enabled
-- ALTER TABLE banks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read banks" ON banks;
DROP POLICY IF EXISTS "Allow users to insert their own company/branches" ON banks;
DROP POLICY IF EXISTS "Allow users to update their own company/branches" ON banks;
DROP POLICY IF EXISTS "Allow users to delete their own branches" ON banks;

-- Create new policies

-- 1. Allow all authenticated users to read all banks/companies
CREATE POLICY "Allow authenticated users to read banks"
ON banks FOR SELECT
TO authenticated
USING (true);

-- 2. Allow authenticated users to insert banks/branches
-- Users can create their own company profile or branches under their company
CREATE POLICY "Allow users to insert their own company/branches"
ON banks FOR INSERT
TO authenticated
WITH CHECK (
  -- User can create their own company (id matches auth.uid())
  id = auth.uid()::text
  OR
  -- User can create branches under their own company (parentId matches auth.uid())
  parent_id = auth.uid()::text
);

-- 3. Allow users to update their own company or branches
CREATE POLICY "Allow users to update their own company/branches"
ON banks FOR UPDATE
TO authenticated
USING (
  -- User owns this company
  id = auth.uid()::text
  OR
  -- User owns the parent company of this branch
  parent_id = auth.uid()::text
)
WITH CHECK (
  -- Same conditions for the updated data
  id = auth.uid()::text
  OR
  parent_id = auth.uid()::text
);

-- 4. Allow users to delete their own branches (but not their main company)
CREATE POLICY "Allow users to delete their own branches"
ON banks FOR DELETE
TO authenticated
USING (
  -- Can only delete branches, not the main company
  parent_id = auth.uid()::text
  AND type = 'BRANCH'
);

-- Grant necessary permissions
GRANT ALL ON banks TO authenticated;
GRANT ALL ON banks TO service_role;
