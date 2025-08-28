-- Create enhanced profiles table with all new features
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  website_url TEXT,
  location TEXT,
  is_public BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  theme_style TEXT DEFAULT 'modern',
  custom_css TEXT,
  music_enabled BOOLEAN DEFAULT false,
  music_url TEXT,
  music_title TEXT,
  music_artist TEXT,
  music_style TEXT DEFAULT 'minimal', -- minimal, card, floating, custom
  music_autoplay BOOLEAN DEFAULT false,
  music_volume REAL DEFAULT 0.5,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create social links table
CREATE TABLE IF NOT EXISTS public.social_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL, -- twitter, instagram, youtube, tiktok, discord, etc.
  url TEXT NOT NULL,
  display_name TEXT,
  icon_url TEXT,
  is_visible BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create custom links table (for bio links)
CREATE TABLE IF NOT EXISTS public.custom_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_visible BOOLEAN DEFAULT true,
  click_count INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  style TEXT DEFAULT 'default', -- default, button, card, minimal
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics table for tracking
CREATE TABLE IF NOT EXISTS public.profile_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL, -- view, link_click, social_click
  event_data JSONB,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create file uploads table for managing assets
CREATE TABLE IF NOT EXISTS public.file_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- image, audio, video, document
  file_size INTEGER,
  mime_type TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

-- Profiles policies
CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT USING (is_public = true OR auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Social links policies
CREATE POLICY "social_links_select_public" ON public.social_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = social_links.profile_id 
      AND (profiles.is_public = true OR profiles.id = auth.uid())
    )
  );

CREATE POLICY "social_links_manage_own" ON public.social_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = social_links.profile_id 
      AND profiles.id = auth.uid()
    )
  );

-- Custom links policies
CREATE POLICY "custom_links_select_public" ON public.custom_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = custom_links.profile_id 
      AND (profiles.is_public = true OR profiles.id = auth.uid())
    )
  );

CREATE POLICY "custom_links_manage_own" ON public.custom_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = custom_links.profile_id 
      AND profiles.id = auth.uid()
    )
  );

-- Analytics policies (only owner can view)
CREATE POLICY "analytics_select_own" ON public.profile_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = profile_analytics.profile_id 
      AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "analytics_insert_public" ON public.profile_analytics
  FOR INSERT WITH CHECK (true); -- Anyone can insert analytics

-- File uploads policies
CREATE POLICY "files_select_own_or_public" ON public.file_uploads
  FOR SELECT USING (
    is_public = true OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = file_uploads.profile_id 
      AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "files_manage_own" ON public.file_uploads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = file_uploads.profile_id 
      AND profiles.id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_is_public ON public.profiles(is_public);
CREATE INDEX IF NOT EXISTS idx_social_links_profile_id ON public.social_links(profile_id);
CREATE INDEX IF NOT EXISTS idx_custom_links_profile_id ON public.custom_links(profile_id);
CREATE INDEX IF NOT EXISTS idx_analytics_profile_id ON public.profile_analytics(profile_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.profile_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_file_uploads_profile_id ON public.file_uploads(profile_id);

-- Create or replace the trigger function for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update profile view count
CREATE OR REPLACE FUNCTION public.increment_profile_views(profile_username TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles 
  SET view_count = view_count + 1 
  WHERE username = profile_username AND is_public = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment link clicks
CREATE OR REPLACE FUNCTION public.increment_link_clicks(link_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.custom_links 
  SET click_count = click_count + 1 
  WHERE id = link_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
