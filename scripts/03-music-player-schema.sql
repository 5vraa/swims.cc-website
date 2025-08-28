-- Create music_tracks table
CREATE TABLE IF NOT EXISTS music_tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(200) NOT NULL,
  artist VARCHAR(200),
  audio_url TEXT NOT NULL,
  cover_image_url TEXT,
  duration INTEGER, -- Duration in seconds
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create music_player_settings table for customization
CREATE TABLE IF NOT EXISTS music_player_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  player_style VARCHAR(50) DEFAULT 'modern', -- modern, minimal, classic, neon
  show_cover_art BOOLEAN DEFAULT true,
  show_track_info BOOLEAN DEFAULT true,
  show_progress_bar BOOLEAN DEFAULT true,
  show_volume_control BOOLEAN DEFAULT true,
  auto_play BOOLEAN DEFAULT false,
  loop_playlist BOOLEAN DEFAULT false,
  background_color VARCHAR(7) DEFAULT '#1a1a1a',
  accent_color VARCHAR(7) DEFAULT '#dc2626',
  text_color VARCHAR(7) DEFAULT '#ffffff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS music_tracks_user_id_idx ON music_tracks(user_id);
CREATE INDEX IF NOT EXISTS music_tracks_position_idx ON music_tracks(user_id, position);
CREATE INDEX IF NOT EXISTS music_player_settings_user_id_idx ON music_player_settings(user_id);

-- Enable RLS
ALTER TABLE music_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_player_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for music_tracks
CREATE POLICY "Users can view their own music tracks" ON music_tracks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own music tracks" ON music_tracks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own music tracks" ON music_tracks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own music tracks" ON music_tracks
  FOR DELETE USING (auth.uid() = user_id);

-- Allow public to view active music tracks for profile pages
CREATE POLICY "Public can view active music tracks" ON music_tracks
  FOR SELECT USING (is_active = true);

-- Create RLS policies for music_player_settings
CREATE POLICY "Users can view their own player settings" ON music_player_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own player settings" ON music_player_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own player settings" ON music_player_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow public to view player settings for profile pages
CREATE POLICY "Public can view player settings" ON music_player_settings
  FOR SELECT USING (true);

-- Create functions to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_music_tracks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_music_player_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_music_tracks_updated_at
  BEFORE UPDATE ON music_tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_music_tracks_updated_at();

CREATE TRIGGER update_music_player_settings_updated_at
  BEFORE UPDATE ON music_player_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_music_player_settings_updated_at();
