-- Complete Database Setup Script
-- Run this in your Supabase SQL editor to set up everything

-- 1. Create profiles table with all necessary columns
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  background_color VARCHAR(7) DEFAULT '#000000',
  background_image_url TEXT,
  theme VARCHAR(20) DEFAULT 'dark',
  is_public BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  role VARCHAR(20) DEFAULT 'user',
  view_count INTEGER DEFAULT 0,
  featured_badge_id UUID,
  email TEXT,
  discord_id TEXT,
  discord_username TEXT,
  discord_authorized BOOLEAN DEFAULT false,
  spotify_connected BOOLEAN DEFAULT false,
  spotify_username TEXT,
  card_outline_color VARCHAR(7) DEFAULT '#ef4444',
  card_glow_color VARCHAR(7) DEFAULT '#ef4444',
  card_glow_intensity DECIMAL(3,2) DEFAULT 0.5,
  background_blur INTEGER DEFAULT 0,
  font_family VARCHAR(50) DEFAULT 'Inter',
  font_size VARCHAR(10) DEFAULT '16px',
  font_color VARCHAR(7) DEFAULT '#ffffff',
  hover_effects BOOLEAN DEFAULT true,
  parallax_effects BOOLEAN DEFAULT true,
  particle_effects BOOLEAN DEFAULT true,
  reveal_enabled BOOLEAN DEFAULT true,
  reveal_title TEXT DEFAULT 'Reveal Page',
  reveal_message TEXT DEFAULT 'This is a reveal page',
  reveal_button TEXT DEFAULT 'Reveal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create social_links table
CREATE TABLE IF NOT EXISTS public.social_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  display_text TEXT NOT NULL,
  url TEXT NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create music_tracks table
CREATE TABLE IF NOT EXISTS public.music_tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
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

-- 4. Create badges table
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url TEXT,
  color VARCHAR(7) DEFAULT '#ef4444',
  is_premium BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create user_badges table
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- 6. Create file_uploads table
CREATE TABLE IF NOT EXISTS public.file_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  file_data TEXT NOT NULL,
  bucket_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create analytics_events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_username_lower ON public.profiles (lower(username));
CREATE INDEX IF NOT EXISTS idx_profiles_is_public_view_count ON public.profiles (is_public, view_count DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_links_profile_id ON public.social_links (profile_id);
CREATE INDEX IF NOT EXISTS idx_music_tracks_profile_id ON public.music_tracks (profile_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges (user_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON public.file_uploads (user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_profile_id ON public.analytics_events (profile_id);

-- 9. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 11. Create RLS policies for social_links
CREATE POLICY "Users can manage own social links" ON public.social_links
  FOR ALL USING (auth.uid() = user_id);

-- 12. Create RLS policies for music_tracks
CREATE POLICY "Users can manage own music tracks" ON public.music_tracks
  FOR ALL USING (auth.uid() = user_id);

-- 13. Create RLS policies for user_badges
CREATE POLICY "Users can view own badges" ON public.user_badges
  FOR SELECT USING (auth.uid() = user_id);

-- 14. Create RLS policies for file_uploads
CREATE POLICY "Users can manage own files" ON public.file_uploads
  FOR ALL USING (auth.uid() = user_id);

-- 15. Create RLS policies for analytics_events
CREATE POLICY "Users can view own analytics" ON public.analytics_events
  FOR SELECT USING (auth.uid() = (SELECT id FROM public.profiles WHERE id = profile_id));

-- 16. Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 52428800, '["image/*"]'),
  ('backgrounds', 'backgrounds', true, 52428800, '["image/*"]'),
  ('music', 'music', true, 104857600, '["audio/*"]'),
  ('uploads', 'uploads', true, 104857600, '["image/*", "audio/*", "video/*"]')
ON CONFLICT (id) DO NOTHING;

-- 17. Create storage policies
CREATE POLICY IF NOT EXISTS "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id IN (
    SELECT id FROM storage.buckets WHERE name IN ('avatars', 'music', 'backgrounds', 'uploads')
  ));

CREATE POLICY IF NOT EXISTS "Authenticated Upload" ON storage.objects
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    bucket_id IN (
      SELECT id FROM storage.buckets WHERE name IN ('avatars', 'music', 'backgrounds', 'uploads')
    )
  );

CREATE POLICY IF NOT EXISTS "User Update Own Files" ON storage.objects
  FOR UPDATE USING (
    auth.uid() = owner AND
    bucket_id IN (
      SELECT id FROM storage.buckets WHERE name IN ('avatars', 'music', 'backgrounds', 'uploads')
    )
  );

CREATE POLICY IF NOT EXISTS "User Delete Own Files" ON storage.objects
  FOR DELETE USING (
    auth.uid() = owner AND
    bucket_id IN (
      SELECT id FROM storage.buckets WHERE name IN ('avatars', 'music', 'backgrounds', 'uploads')
    )
  );

-- 18. Insert default badges
INSERT INTO public.badges (id, name, description, icon_url, color, is_premium, is_verified) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Early Adopter', 'One of the first users', '🌟', '#ffd700', false, false),
  ('550e8400-e29b-41d4-a716-446655440002', 'Premium Member', 'Premium subscription holder', '💎', '#9c27b0', true, false),
  ('550e8400-e29b-41d4-a716-446655440003', 'Verified User', 'Verified account', '✅', '#4caf50', false, true),
  ('550e8400-e29b-41d4-a716-446655440004', 'Content Creator', 'Active content creator', '🎨', '#ff9800', false, false),
  ('550e8400-e29b-41d4-a716-446655440005', 'Community Helper', 'Helpful community member', '🤝', '#2196f3', false, false)
ON CONFLICT (id) DO NOTHING;

-- 19. Create profiles for existing users without profiles
INSERT INTO public.profiles (
  id, user_id, username, display_name, email, is_public, background_color,
  card_outline_color, card_glow_color, card_glow_intensity, background_blur,
  font_family, font_size, font_color, hover_effects, parallax_effects,
  particle_effects, reveal_enabled, reveal_title, reveal_message, reveal_button
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
  'Reveal'
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.id IS NULL AND au.email_confirmed_at IS NOT NULL;

-- 20. Grant permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.social_links TO authenticated;
GRANT ALL ON public.music_tracks TO authenticated;
GRANT ALL ON public.user_badges TO authenticated;
GRANT ALL ON public.file_uploads TO authenticated;
GRANT ALL ON public.analytics_events TO authenticated;
GRANT SELECT ON public.badges TO authenticated;

-- 21. Create functions for profile management
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, username, display_name, email)
  VALUES (
    NEW.id,
    NEW.id,
    LOWER(SPLIT_PART(NEW.email, '@', 1)) || '-' || EXTRACT(EPOCH FROM NEW.created_at)::bigint,
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 22. Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 23. Verify setup
SELECT 'Database setup completed successfully!' as status;
