-- Enable Realtime for messages and notifications
-- Execute this in your Supabase SQL Editor

-- Add messages table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Add notifications table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Verify
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
