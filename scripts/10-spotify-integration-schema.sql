-- Spotify Integration and Single Song Selection Schema
-- This script adds Spotify integration and enforces single song selection per user

-- Add spotify_connected to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS spotify_connected BOOLEAN DEFAULT FALSE;

-- Add new columns to music_tracks table
ALTER TABLE music_tracks 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'upload',
ADD COLUMN IF NOT EXISTS spotify_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Update existing data to map old columns to new ones
UPDATE music_tracks 
SET 
  audio_url = url,
  cover_image_url = thumbnail,
  source = CASE WHEN platform = 'spotify' THEN 'spotify' ELSE 'upload' END,
  is_active = is_featured
WHERE audio_url IS NULL OR cover_image_url IS NULL OR source IS NULL OR is_active IS NULL;

-- Create music_player_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS music_player_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  player_style VARCHAR(50) DEFAULT 'modern',
  auto_play BOOLEAN DEFAULT FALSE,
  show_controls BOOLEAN DEFAULT TRUE,
  primary_color VARCHAR(7) DEFAULT '#ef4444',
  secondary_color VARCHAR(7) DEFAULT '#1f2937',
  show_cover_art BOOLEAN DEFAULT TRUE,
  show_track_info BOOLEAN DEFAULT TRUE,
  show_progress_bar BOOLEAN DEFAULT TRUE,
  show_volume_control BOOLEAN DEFAULT TRUE,
  loop_playlist BOOLEAN DEFAULT FALSE,
  background_color VARCHAR(7) DEFAULT '#1a1a1a',
  accent_color VARCHAR(7) DEFAULT '#dc2626',
  text_color VARCHAR(7) DEFAULT '#ffffff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create function to ensure only one active track per user
CREATE OR REPLACE FUNCTION ensure_single_active_track()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting a track as active, deactivate all other tracks for the same user
  IF NEW.is_active = TRUE THEN
    UPDATE music_tracks 
    SET is_active = FALSE 
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce single active track
DROP TRIGGER IF EXISTS trigger_single_active_track ON music_tracks;
CREATE TRIGGER trigger_single_active_track
  BEFORE INSERT OR UPDATE ON music_tracks
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_active_track();

-- Add RLS policies for music_tracks
ALTER TABLE music_tracks ENABLE ROW LEVEL SECURITY;

-- Users can view their own tracks
CREATE POLICY "Users can view own tracks" ON music_tracks
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own tracks
CREATE POLICY "Users can insert own tracks" ON music_tracks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own tracks
CREATE POLICY "Users can update own tracks" ON music_tracks
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own tracks
CREATE POLICY "Users can delete own tracks" ON music_tracks
  FOR DELETE USING (auth.uid() = user_id);

-- Add RLS policies for music_player_settings
ALTER TABLE music_player_settings ENABLE ROW LEVEL SECURITY;

-- Users can view their own settings
CREATE POLICY "Users can view own settings" ON music_player_settings
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own settings
CREATE POLICY "Users can insert own settings" ON music_player_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own settings
CREATE POLICY "Users can update own settings" ON music_player_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own settings
CREATE POLICY "Users can delete own settings" ON music_player_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_music_tracks_user_id ON music_tracks(user_id);
CREATE INDEX IF NOT EXISTS idx_music_tracks_is_active ON music_tracks(is_active);
CREATE INDEX IF NOT EXISTS idx_music_player_settings_user_id ON music_player_settings(user_id);

-- Verify the changes
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('profiles', 'music_tracks', 'music_player_settings')
  AND column_name IN ('spotify_connected', 'is_active', 'source', 'spotify_id', 'audio_url', 'cover_image_url')
ORDER BY table_name, column_name;
