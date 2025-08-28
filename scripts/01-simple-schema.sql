-- Simple Database Setup for Bio Link Platform
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (simplified)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  bio TEXT,
  avatar_url TEXT,
  background_color VARCHAR(7) DEFAULT '#000000',
  background_image_url TEXT,
  is_public BOOLEAN DEFAULT true,
  reveal_type VARCHAR(20) DEFAULT 'none',
  reveal_title TEXT,
  reveal_description TEXT,
  reveal_min_age INTEGER DEFAULT 18,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create music settings table
CREATE TABLE IF NOT EXISTS music_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  player_style VARCHAR(20) DEFAULT 'modern',
  auto_play BOOLEAN DEFAULT false,
  show_controls BOOLEAN DEFAULT true,
  primary_color VARCHAR(7) DEFAULT '#ef4444',
  secondary_color VARCHAR(7) DEFAULT '#1f2937',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Simple RLS Policies
CREATE POLICY "Public profiles viewable" ON profiles FOR SELECT USING (is_public = true);
CREATE POLICY "Users manage own profile" ON profiles FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users manage own social links" ON social_links FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Public social links viewable" ON social_links FOR SELECT USING (is_visible = true);

CREATE POLICY "Users manage own music" ON music_tracks FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Public music viewable" ON music_tracks FOR SELECT USING (is_visible = true);

CREATE POLICY "Users manage own music settings" ON music_settings FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Public music settings viewable" ON music_settings FOR SELECT USING (true);

CREATE POLICY "Users view own analytics" ON analytics_events FOR SELECT USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Insert analytics events" ON analytics_events FOR INSERT WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_social_links_user_id ON social_links(user_id);
CREATE INDEX IF NOT EXISTS idx_music_tracks_user_id ON music_tracks(user_id);
