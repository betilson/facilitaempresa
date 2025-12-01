-- Add favorites column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS favorites TEXT[];

-- Add following column to users table if it doesn't exist  
ALTER TABLE users ADD COLUMN IF NOT EXISTS following TEXT[];
