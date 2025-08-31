-- Database Diagnostic Script
-- Run this first to see what actually exists

-- 1. Show all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Show profiles table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 3. Show a few sample rows from profiles (if any exist)
SELECT * FROM profiles LIMIT 3;

-- 4. Check if there are any rows in profiles
SELECT COUNT(*) as total_profiles FROM profiles;

-- 5. Show auth.users table structure (if it exists)
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'auth'
ORDER BY ordinal_position;

-- 6. Show storage buckets (if any exist)
SELECT name, public, file_size_limit, allowed_mime_types
FROM storage.buckets;
