-- Minimal Database Schema Update for Discord OAuth Application
-- Run this in your Supabase SQL editor to add missing features

-- 1. Add missing columns to existing profiles table ONLY
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS theme VARCHAR(20) DEFAULT 'dark',
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user',
ADD COLUMN IF NOT EXISTS featured_badge_id UUID,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS discord_id TEXT,
ADD COLUMN IF NOT EXISTS discord_username TEXT,
ADD COLUMN IF NOT EXISTS discord_authorized BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS spotify_connected BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS spotify_username TEXT,
ADD COLUMN IF NOT EXISTS card_outline_color VARCHAR(7) DEFAULT '#ef4444',
ADD COLUMN IF NOT EXISTS card_glow_color VARCHAR(7) DEFAULT '#ef4444',
ADD COLUMN IF NOT EXISTS card_glow_intensity DECIMAL(3,2) DEFAULT 0.5,
ADD COLUMN IF NOT EXISTS background_blur INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS font_family VARCHAR(50) DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS font_size VARCHAR(10) DEFAULT '16px',
ADD COLUMN IF NOT EXISTS font_color VARCHAR(7) DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS hover_effects BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS parallax_effects BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS particle_effects BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS reveal_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS reveal_title TEXT DEFAULT 'Reveal Page',
ADD COLUMN IF NOT EXISTS reveal_message TEXT DEFAULT 'This is a reveal page',
ADD COLUMN IF NOT EXISTS reveal_button TEXT DEFAULT 'Reveal',
ADD COLUMN IF NOT EXISTS custom_css TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS custom_js TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS advanced_animations BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS custom_fonts BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS gradient_backgrounds BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS premium_themes BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS custom_domain BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS advanced_analytics BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS priority_support BOOLEAN DEFAULT false;

-- 2. Add unique constraint on discord_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_discord_id_key'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_discord_id_key UNIQUE (discord_id);
  END IF;
END $$;

-- 3. Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 52428800, ARRAY['image/*']),
  ('backgrounds', 'backgrounds', true, 52428800, ARRAY['image/*']),
  ('music', 'music', true, 104857600, ARRAY['audio/*']),
  ('uploads', 'uploads', true, 104857600, ARRAY['image/*', 'audio/*', 'video/*'])
ON CONFLICT (id) DO NOTHING;

-- 4. Create social_links table (no foreign key constraints)
CREATE TABLE IF NOT EXISTS public.social_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID,
  platform VARCHAR(50) NOT NULL,
  display_text TEXT NOT NULL,
  url TEXT NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create music_tracks table (no foreign key constraints)
CREATE TABLE IF NOT EXISTS public.music_tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID,
  title TEXT NOT NULL,
  artist TEXT,
  audio_url TEXT NOT NULL,
  cover_image_url TEXT,
  duration INTEGER,
  order_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create badges table
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create user_badges table (no foreign key constraints)
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID,
  badge_id UUID,
  assigned_by UUID,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, badge_id)
);

-- 8. Create basic indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username_lower ON public.profiles (lower(username));
CREATE INDEX IF NOT EXISTS idx_profiles_discord_id ON public.profiles (discord_id);
CREATE INDEX IF NOT EXISTS idx_social_links_profile_id ON public.social_links (profile_id);
CREATE INDEX IF NOT EXISTS idx_music_tracks_profile_id ON public.music_tracks (profile_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_profile_id ON public.user_badges (profile_id);

-- 9. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- 10. Create basic RLS policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- 11. Insert default badges
INSERT INTO public.badges (name, display_name, description, color, icon) VALUES
  ('owner', 'Owner', 'Platform owner and founder', '#ff0000', 'crown'),
  ('developer', 'Developer', 'Core platform developer', '#00ff00', 'code'),
  ('premium', 'Premium', 'Premium subscriber', '#ffd700', 'star'),
  ('verified', 'Verified', 'Verified account', '#1da1f2', 'check-circle'),
  ('early_supporter', 'Early Supporter', 'Early platform supporter', '#9146ff', 'heart'),
  ('content_creator', 'Content Creator', 'Recognized content creator', '#ff6b6b', 'video'),
  ('beta_tester', 'Beta Tester', 'Beta testing participant', '#4ecdc4', 'flask'),
  ('moderator', 'Moderator', 'Community moderator', '#ff9f43', 'shield')
ON CONFLICT (name) DO NOTHING;

-- 12. Grant basic permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.social_links TO authenticated;
GRANT ALL ON public.music_tracks TO authenticated;
GRANT ALL ON public.user_badges TO authenticated;
GRANT SELECT ON public.badges TO authenticated;

-- 13. Verify setup
SELECT 'Extended schema update completed successfully!' as status;
