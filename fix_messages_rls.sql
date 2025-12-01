-- Enable RLS on messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Allow public access to admin messages" ON messages;
DROP POLICY IF EXISTS "Users can manage their own messages" ON messages;
DROP POLICY IF EXISTS "Allow sending messages to admin" ON messages;

-- Create comprehensive policies

-- 1. Allow authenticated users to view/edit their own messages (standard RLS)
CREATE POLICY "Users can manage their own messages" ON messages
FOR ALL
TO authenticated
USING (
    auth.uid() = sender_id 
    OR auth.uid() = receiver_id
)
WITH CHECK (
    auth.uid() = sender_id 
    OR auth.uid() = receiver_id
);

-- 2. Allow PUBLIC (unauthenticated) access to messages involving the Admin UUID
-- This is required because the Admin login is local-only and does not authenticate with Supabase
-- We use the Nil UUID '00000000-0000-0000-0000-000000000000' for the local admin
CREATE POLICY "Allow public access to admin messages" ON messages
FOR ALL
TO public
USING (
    sender_id = '00000000-0000-0000-0000-000000000000' 
    OR receiver_id = '00000000-0000-0000-0000-000000000000'
)
WITH CHECK (
    sender_id = '00000000-0000-0000-0000-000000000000' 
    OR receiver_id = '00000000-0000-0000-0000-000000000000'
);

-- 3. Allow inserting messages where receiver is Admin (for Help & Support form)
-- This allows any user (even anonymous) to send a message to admin
CREATE POLICY "Allow sending messages to admin" ON messages
FOR INSERT
TO public
WITH CHECK (
    receiver_id = '00000000-0000-0000-0000-000000000000'
);
