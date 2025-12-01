-- =============================================
-- FIX USERS TABLE RLS POLICIES
-- =============================================
-- This script fixes the Row Level Security policies on the users table
-- to allow proper read/write access for authenticated users.

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "users_view_own" ON users;
DROP POLICY IF EXISTS "Enable select for anon" ON users;
DROP POLICY IF EXISTS "Enable insert for anon" ON users;
DROP POLICY IF EXISTS "Enable update for anon" ON users;

-- Create comprehensive policies for authenticated users
-- Policy 1: Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT
    USING (auth.uid() = id);

-- Policy 2: Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy 3: Allow new user creation (for registration)
CREATE POLICY "Enable insert for authenticated users" ON users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy 4: Allow anonymous/public access for admin operations
-- This is needed for the local admin user who isn't authenticated via Supabase
CREATE POLICY "Enable select for public" ON users
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Enable insert for public" ON users
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "Enable update for public" ON users
    FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);

-- Verify policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;
