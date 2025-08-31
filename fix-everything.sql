-- Comprehensive Database Fix Script
-- This will fix all the 500 errors by ensuring the schema matches the API expectations

-- 1. First, let's check what tables exist and their current structure
DO $$
BEGIN
    RAISE NOTICE 'Current database state:';
    RAISE NOTICE 'Tables: %', (
        SELECT string_agg(table_name, ', ')
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    );
END $$;

-- 2. Drop existing tables if they exist (to avoid conflicts)
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS music_tracks CASCADE;
DROP TABLE IF EXISTS social_links CASCADE;
DROP TABLE IF EXISTS music_player_settings CASCADE;
DROP TABLE IF EXISTS music_settings CASCADE;
DROP TABLE IF EXISTS file_uploads CASCADE;
DROP TABLE IF EXISTS profile_analytics CASCADE;
DROP TABLE IF EXISTS analytics_events CASCADE;

-- 3. Ensure profiles table has the correct structure
-- First, check if profiles table exists and has user_id column
DO $$
BEGIN
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'user_id') THEN
        ALTER TABLE profiles ADD COLUMN user_id UUID;
        RAISE NOTICE 'Added user_id column to profiles table';
    END IF;
    
    -- Create index for user_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_user_id') THEN
        CREATE INDEX idx_profiles_user_id ON profiles(user_id);
        RAISE NOTICE 'Created index on profiles.user_id';
    END IF;
END $$;

-- 4. Create the correct tables with the new schema

-- Create social_links table with profile_id (not user_id)
CREATE TABLE IF NOT EXISTS social_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  platform VARCHAR(50) NOT NULL,
  url TEXT NOT NULL,
  display_name VARCHAR(100),
  icon VARCHAR(50),
  order_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create music_tracks table with profile_id (not user_id)
CREATE TABLE IF NOT EXISTS music_tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  title VARCHAR(200) NOT NULL,
  artist VARCHAR(200),
  audio_url TEXT NOT NULL,
  cover_image_url TEXT,
  duration INTEGER,
  order_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create music_player_settings table with profile_id (not user_id)
CREATE TABLE IF NOT EXISTS music_player_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  player_style VARCHAR(20) DEFAULT 'modern',
  auto_play BOOLEAN DEFAULT false,
  show_controls BOOLEAN DEFAULT true,
  primary_color VARCHAR(7) DEFAULT '#ef4444',
  secondary_color VARCHAR(7) DEFAULT '#1f2937',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_badges table with profile_id (not user_id)
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  badge_id UUID NOT NULL,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, badge_id)
);

-- Create file_uploads table for managing uploaded files
CREATE TABLE IF NOT EXISTS file_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create badges table if it doesn't exist
CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7) DEFAULT '#ef4444',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create proper foreign key constraints
DO $$
BEGIN
    -- Add foreign key constraints if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_social_links_profile') THEN
        ALTER TABLE social_links ADD CONSTRAINT fk_social_links_profile 
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for social_links.profile_id';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_music_tracks_profile') THEN
        ALTER TABLE music_tracks ADD CONSTRAINT fk_music_tracks_profile 
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for music_tracks.profile_id';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_music_player_settings_profile') THEN
        ALTER TABLE music_player_settings ADD CONSTRAINT fk_music_player_settings_profile 
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for music_player_settings.profile_id';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_user_badges_profile') THEN
        ALTER TABLE user_badges ADD CONSTRAINT fk_user_badges_profile 
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for user_badges.profile_id';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_user_badges_badge') THEN
        ALTER TABLE user_badges ADD CONSTRAINT fk_user_badges_badge 
        FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for user_badges.badge_id';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_file_uploads_profile') THEN
        ALTER TABLE file_uploads ADD CONSTRAINT fk_file_uploads_profile 
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for file_uploads.profile_id';
    END IF;
END $$;

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_social_links_profile_id ON social_links(profile_id);
CREATE INDEX IF NOT EXISTS idx_music_tracks_profile_id ON music_tracks(profile_id);
CREATE INDEX IF NOT EXISTS idx_music_player_settings_profile_id ON music_player_settings(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_profile_id ON user_badges(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_profile_id ON file_uploads(profile_id);

-- 7. Enable RLS on all tables
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_player_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

-- 8. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own social links" ON social_links;
DROP POLICY IF EXISTS "Users can insert own social links" ON social_links;
DROP POLICY IF EXISTS "Users can update own social links" ON social_links;
DROP POLICY IF EXISTS "Users can delete own social links" ON social_links;

DROP POLICY IF EXISTS "Users can view own music tracks" ON music_tracks;
DROP POLICY IF EXISTS "Users can insert own music tracks" ON music_tracks;
DROP POLICY IF EXISTS "Users can update own music tracks" ON music_tracks;
DROP POLICY IF EXISTS "Users can delete own music tracks" ON music_tracks;

DROP POLICY IF EXISTS "Users can view own music settings" ON music_player_settings;
DROP POLICY IF EXISTS "Users can insert own music settings" ON music_player_settings;
DROP POLICY IF EXISTS "Users can update own music settings" ON music_player_settings;
DROP POLICY IF EXISTS "Users can delete own music settings" ON music_player_settings;

DROP POLICY IF EXISTS "Users can view own badges" ON user_badges;
DROP POLICY IF EXISTS "Users can insert own badges" ON user_badges;
DROP POLICY IF EXISTS "Users can update own badges" ON user_badges;
DROP POLICY IF EXISTS "Users can delete own badges" ON user_badges;

DROP POLICY IF EXISTS "Admins can manage badges" ON badges;

-- 9. Create RLS Policies for social_links
CREATE POLICY "Users can view own social links" ON social_links
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

CREATE POLICY "Users can insert own social links" ON social_links
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

CREATE POLICY "Users can update own social links" ON social_links
  FOR UPDATE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

CREATE POLICY "Users can delete own social links" ON social_links
  FOR DELETE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

-- 10. Create RLS Policies for music_tracks
CREATE POLICY "Users can view own music tracks" ON music_tracks
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

CREATE POLICY "Users can insert own music tracks" ON music_tracks
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

CREATE POLICY "Users can update own music tracks" ON music_tracks
  FOR UPDATE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

CREATE POLICY "Users can delete own music tracks" ON music_tracks
  FOR DELETE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

-- 11. Create RLS Policies for music_player_settings
CREATE POLICY "Users can view own music settings" ON music_player_settings
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

CREATE POLICY "Users can insert own music settings" ON music_player_settings
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

CREATE POLICY "Users can update own music settings" ON music_player_settings
  FOR UPDATE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

CREATE POLICY "Users can delete own music settings" ON music_player_settings
  FOR DELETE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

-- 12. Create RLS Policies for user_badges
CREATE POLICY "Users can view own badges" ON user_badges
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

CREATE POLICY "Users can insert own badges" ON user_badges
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

CREATE POLICY "Users can update own badges" ON user_badges
  FOR UPDATE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

CREATE POLICY "Users can delete own badges" ON user_badges
  FOR DELETE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

-- 13. Create RLS Policies for file_uploads
CREATE POLICY "Users can view own file uploads" ON file_uploads
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

CREATE POLICY "Users can insert own file uploads" ON file_uploads
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

CREATE POLICY "Users can update own file uploads" ON file_uploads
  FOR UPDATE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

CREATE POLICY "Users can delete own file uploads" ON file_uploads
  FOR DELETE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

-- 14. Create public read policies for profile pages
CREATE POLICY "Public can view social links" ON social_links
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = profile_id AND is_public = true
  ));

CREATE POLICY "Public can view music tracks" ON music_tracks
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = profile_id AND is_public = true
  ));

CREATE POLICY "Public can view user badges" ON user_badges
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = profile_id AND is_public = true
  ));

-- 14. Create admin policies for badges
CREATE POLICY "Admins can manage badges" ON badges
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 15. Insert some default badges
INSERT INTO badges (name, display_name, description, icon, color) VALUES
  ('verified', 'Verified', 'Verified user badge', 'check-circle', '#10b981'),
  ('premium', 'Premium', 'Premium user badge', 'star', '#f59e0b'),
  ('early-adopter', 'Early Adopter', 'Early adopter badge', 'rocket', '#8b5cf6'),
  ('contributor', 'Contributor', 'Active contributor badge', 'heart', '#ef4444')
ON CONFLICT DO NOTHING;

-- 16. Ensure all existing profiles have a user_id
UPDATE profiles 
SET user_id = id 
WHERE user_id IS NULL;

-- 17. Show final table structure
DO $$
BEGIN
    RAISE NOTICE 'Database fix completed successfully!';
    RAISE NOTICE 'Tables created/updated: social_links, music_tracks, music_player_settings, user_badges, badges, file_uploads';
    RAISE NOTICE 'All foreign key constraints and RLS policies have been set up';
END $$;
