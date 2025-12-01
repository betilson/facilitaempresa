-- Enable RLS on users table (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- CRITICAL FIX: Allow anonymous users (like the Local Admin) to update user profiles
-- This is required because the Admin logs in locally and is not authenticated with Supabase,
-- so they act as an "anonymous" user when trying to verify banks.
-- Without this, the "Verify" action fails silently or is blocked by RLS.

DROP POLICY IF EXISTS "Enable update for anon" ON users;

CREATE POLICY "Enable update for anon" ON "public"."users"
AS PERMISSIVE FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Also ensure insert/select is allowed
DROP POLICY IF EXISTS "Enable insert for anon" ON users;

CREATE POLICY "Enable insert for anon" ON "public"."users"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);

DROP POLICY IF EXISTS "Enable select for anon" ON users;

CREATE POLICY "Enable select for anon" ON "public"."users"
AS PERMISSIVE FOR SELECT
TO public
USING (true);
