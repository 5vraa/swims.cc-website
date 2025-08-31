-- Add Spotify fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS spotify_access_token TEXT,
ADD COLUMN IF NOT EXISTS spotify_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS spotify_token_expires_at TIMESTAMP WITH TIME ZONE;

-- Add Spotify fields to music_tracks table
ALTER TABLE music_tracks 
ADD COLUMN IF NOT EXISTS spotify_track_id TEXT,
ADD COLUMN IF NOT EXISTS spotify_playlist_id TEXT;

-- Create index for Spotify track lookup
CREATE INDEX IF NOT EXISTS idx_music_tracks_spotify_id ON music_tracks(spotify_track_id);

-- Update existing profiles to set default values
UPDATE profiles 
SET 
  spotify_connected = COALESCE(spotify_connected, false),
  spotify_username = COALESCE(spotify_username, NULL),
  spotify_access_token = COALESCE(spotify_access_token, NULL),
  spotify_refresh_token = COALESCE(spotify_refresh_token, NULL),
  spotify_token_expires_at = COALESCE(spotify_token_expires_at, NULL)
WHERE spotify_connected IS NULL;

-- Add RLS policy for Spotify tokens (users can only see their own tokens)
CREATE POLICY "Users can manage own Spotify tokens" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Grant necessary permissions
GRANT SELECT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON music_tracks TO authenticated;
