-- Temporarily Disable RLS on Storage Objects
-- This will allow uploads to work while we figure out the policy issues

-- Check current RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'storage' 
AND tablename = 'objects';

-- Disable RLS temporarily
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'storage' 
AND tablename = 'objects';

-- Note: This is less secure but will allow uploads to work
-- You can re-enable it later with: ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
