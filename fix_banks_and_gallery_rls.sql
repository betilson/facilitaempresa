-- =============================================
-- FIX RLS FOR BANKS AND PRODUCT_GALLERY TABLES
-- =============================================
-- This script enables Row Level Security on banks and product_gallery tables
-- and creates appropriate policies for data access.

-- =============================================
-- BANKS TABLE
-- =============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Banks are viewable by everyone" ON banks;
DROP POLICY IF EXISTS "Users can manage their own banks" ON banks;

-- Enable RLS on banks table
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow everyone to view banks (public read access)
CREATE POLICY "Banks are viewable by everyone" ON banks
    FOR SELECT
    TO public
    USING (true);

-- Policy 2: Allow authenticated users to insert banks
CREATE POLICY "Authenticated users can create banks" ON banks
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Policy 3: Allow users to update their own banks
CREATE POLICY "Users can update own banks" ON banks
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy 4: Allow users to delete their own banks
CREATE POLICY "Users can delete own banks" ON banks
    FOR DELETE
    TO authenticated
    USING (auth.uid() = id);

-- Policy 5: Allow public/anonymous access for admin operations
CREATE POLICY "Public can manage banks" ON banks
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- =============================================
-- PRODUCT_GALLERY TABLE
-- =============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Product gallery is viewable by everyone" ON product_gallery;
DROP POLICY IF EXISTS "Product owners can manage gallery" ON product_gallery;

-- Enable RLS on product_gallery table
ALTER TABLE product_gallery ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow everyone to view product gallery (public read access)
CREATE POLICY "Product gallery is viewable by everyone" ON product_gallery
    FOR SELECT
    TO public
    USING (true);

-- Policy 2: Allow product owners to insert gallery images
CREATE POLICY "Product owners can add gallery images" ON product_gallery
    FOR INSERT
    TO authenticated
    WITH CHECK (
        product_id IN (
            SELECT id FROM products WHERE owner_id = auth.uid()
        )
    );

-- Policy 3: Allow product owners to update gallery images
CREATE POLICY "Product owners can update gallery images" ON product_gallery
    FOR UPDATE
    TO authenticated
    USING (
        product_id IN (
            SELECT id FROM products WHERE owner_id = auth.uid()
        )
    );

-- Policy 4: Allow product owners to delete gallery images
CREATE POLICY "Product owners can delete gallery images" ON product_gallery
    FOR DELETE
    TO authenticated
    USING (
        product_id IN (
            SELECT id FROM products WHERE owner_id = auth.uid()
        )
    );

-- Policy 5: Allow public/anonymous access for admin operations
CREATE POLICY "Public can manage gallery" ON product_gallery
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- =============================================
-- VERIFICATION
-- =============================================

-- Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('banks', 'product_gallery')
ORDER BY tablename;

-- List all policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command
FROM pg_policies
WHERE tablename IN ('banks', 'product_gallery')
ORDER BY tablename, policyname;
