-- Check the current structure of music_tracks and music_player_settings tables
-- This script helps diagnose what columns exist and what needs to be added

-- Check if tables exist
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE tablename IN ('music_tracks', 'music_player_settings', 'profiles')
ORDER BY tablename;

-- Check music_tracks table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'music_tracks'
ORDER BY ordinal_position;

-- Check music_player_settings table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'music_player_settings'
ORDER BY ordinal_position;

-- Check profiles table structure for music-related columns
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'profiles'
  AND column_name LIKE '%music%' OR column_name LIKE '%spotify%'
ORDER BY ordinal_position;

-- Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('music_tracks', 'music_player_settings', 'profiles')
ORDER BY tablename;

-- Check existing policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('music_tracks', 'music_player_settings', 'profiles')
ORDER BY tablename, policyname;
