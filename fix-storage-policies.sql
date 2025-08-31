-- Fix Storage RLS Policies
-- This will fix the "violates row-level security policy" error

-- 1. First, drop the existing problematic policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "User Update Own Files" ON storage.objects;
DROP POLICY IF EXISTS "User Delete Own Files" ON storage.objects;

-- 2. Create simpler, more permissive policies
-- Allow public read access to all objects
CREATE POLICY "Public Read Access" ON storage.objects
  FOR SELECT USING (true);

-- Allow authenticated users to upload to any bucket
CREATE POLICY "Authenticated Upload Access" ON storage.objects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own files (by folder structure)
CREATE POLICY "User Update Access" ON storage.objects
  FOR UPDATE USING (
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own files (by folder structure)
CREATE POLICY "User Delete Access" ON storage.objects
  FOR DELETE USING (
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 3. Verify the new policies
SELECT 
  policyname,
  tablename,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- 4. Check if RLS is enabled on storage.objects
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'storage' 
AND tablename = 'objects';

-- 5. If RLS is disabled, enable it
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
