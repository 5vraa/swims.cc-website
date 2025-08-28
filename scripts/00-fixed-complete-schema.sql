-- Complete Database Setup for Advanced Bio Link Platform
-- Fixed version that handles auth.users properly

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table with proper auth reference
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  bio TEXT,
  avatar_url TEXT,
  background_color VARCHAR(7) DEFAULT '#000000',
  background_image_url TEXT,
  is_public BOOLEAN DEFAULT true,
  reveal_type VARCHAR(20) DEFAULT 'none' CHECK (reveal_type IN ('none', 'age', 'content', 'nsfw', 'custom')),
  reveal_title TEXT,
  reveal_description TEXT,
  reveal_min_age INTEGER DEFAULT 18,
  reveal_custom_message TEXT,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create social links table
CREATE TABLE IF NOT EXISTS social_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform VARCHAR(50) NOT NULL,
  url TEXT NOT NULL,
  display_text VARCHAR(100),
  is_visible BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create music tracks table
CREATE TABLE IF NOT EXISTS music_tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title VARCHAR(200) NOT NULL,
  artist VARCHAR(200),
  audio_url TEXT NOT NULL,
  cover_image_url TEXT,
  duration INTEGER,
  is_visible BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create music settings table
CREATE TABLE IF NOT EXISTS music_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  player_style VARCHAR(20) DEFAULT 'modern' CHECK (player_style IN ('modern', 'minimal', 'classic', 'neon')),
  auto_play BOOLEAN DEFAULT false,
  show_controls BOOLEAN DEFAULT true,
  primary_color VARCHAR(7) DEFAULT '#ef4444',
  secondary_color VARCHAR(7) DEFAULT '#1f2937',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create storage buckets (these might already exist)
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public) VALUES 
    ('avatars', 'avatars', true),
    ('banners', 'banners', true),
    ('music', 'music', true),
    ('covers', 'covers', true);
EXCEPTION WHEN unique_violation THEN
  -- Buckets already exist, do nothing
  NULL;
END $$;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Drop existing social_links policies
DROP POLICY IF EXISTS "Users can manage own social links" ON social_links;
DROP POLICY IF EXISTS "Public social links are viewable" ON social_links;

-- RLS Policies for social_links
CREATE POLICY "Users can manage own social links" ON social_links
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Public social links are viewable" ON social_links
  FOR SELECT USING (
    is_visible = true AND 
    user_id IN (SELECT user_id FROM profiles WHERE is_public = true)
  );

-- Drop existing music_tracks policies
DROP POLICY IF EXISTS "Users can manage own music tracks" ON music_tracks;
DROP POLICY IF EXISTS "Public music tracks are viewable" ON music_tracks;

-- RLS Policies for music_tracks
CREATE POLICY "Users can manage own music tracks" ON music_tracks
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Public music tracks are viewable" ON music_tracks
  FOR SELECT USING (
    is_visible = true AND 
    user_id IN (SELECT user_id FROM profiles WHERE is_public = true)
  );

-- Drop existing music_settings policies
DROP POLICY IF EXISTS "Users can manage own music settings" ON music_settings;
DROP POLICY IF EXISTS "Public music settings are viewable" ON music_settings;

-- RLS Policies for music_settings
CREATE POLICY "Users can manage own music settings" ON music_settings
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Public music settings are viewable" ON music_settings
  FOR SELECT USING (
    user_id IN (SELECT user_id FROM profiles WHERE is_public = true)
  );

-- Drop existing analytics_events policies
DROP POLICY IF EXISTS "Users can view their own analytics" ON analytics_events;
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON analytics_events;

-- RLS Policies for analytics_events
CREATE POLICY "Users can view their own analytics" ON analytics_events
  FOR SELECT USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Anyone can insert analytics events" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- Storage policies (drop existing ones first)
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- Avatar storage policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatars" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatars" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Banner storage policies
DROP POLICY IF EXISTS "Banner images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own banners" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own banners" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own banners" ON storage.objects;

CREATE POLICY "Banner images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'banners');

CREATE POLICY "Users can upload their own banners" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own banners" ON storage.objects
  FOR UPDATE USING (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own banners" ON storage.objects
  FOR DELETE USING (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Music storage policies
DROP POLICY IF EXISTS "Music files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own music" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own music" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own music" ON storage.objects;

CREATE POLICY "Music files are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'music');

CREATE POLICY "Users can upload their own music" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'music' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own music" ON storage.objects
  FOR UPDATE USING (bucket_id = 'music' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own music" ON storage.objects
  FOR DELETE USING (bucket_id = 'music' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Cover image storage policies
DROP POLICY IF EXISTS "Cover images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own covers" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own covers" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own covers" ON storage.objects;

CREATE POLICY "Cover images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'covers');

CREATE POLICY "Users can upload their own covers" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own covers" ON storage.objects
  FOR UPDATE USING (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own covers" ON storage.objects
  FOR DELETE USING (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Utility functions
CREATE OR REPLACE FUNCTION increment_view_count(profile_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET view_count = view_count + 1 
  WHERE id = profile_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_like_count(profile_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET like_count = like_count + 1 
  WHERE id = profile_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_social_links_user_id ON social_links(user_id);
CREATE INDEX IF NOT EXISTS idx_social_links_sort_order ON social_links(sort_order);
CREATE INDEX IF NOT EXISTS idx_music_tracks_user_id ON music_tracks(user_id);
CREATE INDEX IF NOT EXISTS idx_music_tracks_sort_order ON music_tracks(sort_order);
CREATE INDEX IF NOT EXISTS idx_analytics_events_profile_id ON analytics_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
