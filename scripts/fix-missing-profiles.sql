-- Fix Missing Profiles Script
-- This script helps identify and fix users who don't have profiles

-- 1. Find users without profiles
SELECT 
  au.id as user_id,
  au.email,
  au.created_at as user_created_at,
  p.id as profile_id
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.id IS NULL
ORDER BY au.created_at DESC;

-- 2. Create profiles for users who don't have them
-- (Run this only if you want to auto-create profiles)
INSERT INTO public.profiles (
  id,
  user_id,
  username,
  display_name,
  email,
  is_public,
  background_color,
  card_outline_color,
  card_glow_color,
  card_glow_intensity,
  background_blur,
  font_family,
  font_size,
  font_color,
  hover_effects,
  parallax_effects,
  particle_effects,
  reveal_enabled,
  reveal_title,
  reveal_message,
  reveal_button,
  created_at,
  updated_at
)
SELECT 
  au.id,
  au.id,
  LOWER(SPLIT_PART(au.email, '@', 1)) || '-' || EXTRACT(EPOCH FROM au.created_at)::bigint,
  COALESCE(au.raw_user_meta_data->>'display_name', SPLIT_PART(au.email, '@', 1)),
  au.email,
  true,
  '#000000',
  '#ef4444',
  '#ef4444',
  0.5,
  0,
  'Inter',
  '16px',
  '#ffffff',
  true,
  true,
  true,
  true,
  'Reveal Page',
  'This is a reveal page',
  'Reveal',
  NOW(),
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.id IS NULL;

-- 3. Verify the fix
SELECT 
  COUNT(*) as total_users,
  COUNT(p.id) as users_with_profiles,
  COUNT(*) - COUNT(p.id) as users_without_profiles
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id;
