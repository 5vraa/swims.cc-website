-- Check Auth Users and Profile Relationships
-- Run this to see the current state

-- 1. Show auth users
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Show profiles with their current user_id
SELECT id, username, user_id, is_public, role, created_at 
FROM profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Check if any profiles have user_id that matches auth.users
SELECT p.username, p.user_id, p.id as profile_id, 
       CASE WHEN au.id IS NOT NULL THEN 'MATCHES AUTH USER' ELSE 'NO AUTH USER' END as status
FROM profiles p
LEFT JOIN auth.users au ON p.user_id = au.id
ORDER BY p.created_at DESC;
