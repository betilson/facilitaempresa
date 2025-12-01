-- =============================================
-- FIX PRODUCTS OWNER_ID FOREIGN KEY CONSTRAINT
-- =============================================
-- This migration removes the foreign key constraint on products.owner_id
-- to allow products to be owned by either users or banks/agencies.

-- Remove the existing foreign key constraint
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_owner_id_fkey;

-- Add a comment to document the change
COMMENT ON COLUMN products.owner_id IS 'References either users.id or banks.id - no FK constraint to allow flexibility';

-- Verify the change
SELECT 
    conname AS constraint_name,
    contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'products'::regclass
    AND conname LIKE '%owner_id%';
