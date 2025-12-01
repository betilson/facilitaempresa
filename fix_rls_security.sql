-- =============================================
-- FIX RLS SECURITY ERRORS
-- =============================================
-- This migration enables Row Level Security on banks and product_gallery tables
-- and creates appropriate policies for data access.

-- =============================================
-- BANKS TABLE
-- =============================================

-- Enable RLS on banks table
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read banks
CREATE POLICY "Banks are viewable by everyone" ON banks
    FOR SELECT
    USING (true);

-- Policy: Allow authenticated users to insert/update/delete their own banks
CREATE POLICY "Users can manage their own banks" ON banks
    FOR ALL
    USING (auth.uid() = id::uuid OR auth.uid() IN (
        SELECT id::uuid FROM users WHERE id::uuid = auth.uid()
    ));

-- =============================================
-- PRODUCT_GALLERY TABLE
-- =============================================

-- Enable RLS on product_gallery table
ALTER TABLE product_gallery ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read product gallery
CREATE POLICY "Product gallery is viewable by everyone" ON product_gallery
    FOR SELECT
    USING (true);

-- Policy: Allow product owners to manage gallery
CREATE POLICY "Product owners can manage gallery" ON product_gallery
    FOR ALL
    USING (
        product_id IN (
            SELECT id FROM products WHERE owner_id::text = auth.uid()::text
        )
    );

-- =============================================
-- VERIFICATION
-- =============================================

-- Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename IN ('banks', 'product_gallery');

-- List policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('banks', 'product_gallery');
