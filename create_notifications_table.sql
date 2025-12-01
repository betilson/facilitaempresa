-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  type TEXT NOT NULL CHECK (type IN ('message', 'promo', 'alert', 'success', 'info')),
  related_entity_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_timestamp ON notifications(timestamp DESC);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Policy: System can insert notifications
CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  USING (auth.uid()::text = user_id);
