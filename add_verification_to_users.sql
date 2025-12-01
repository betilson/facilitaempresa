-- Add is_verified column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- Update existing banks to be unverified by default (or verified if you prefer, but requirement says they need approval)
-- For now, we assume all existing banks need verification or are already verified. 
-- Let's set existing banks to FALSE to be safe, or TRUE if we want to avoid breaking existing users.
-- Given the prompt implies a new restriction, defaulting to FALSE is safer for compliance.
UPDATE users SET is_verified = FALSE WHERE is_bank = TRUE;
