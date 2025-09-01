-- Performance Optimization Script
-- This script adds database indexes to improve query performance

-- Add indexes for common profile queries
CREATE INDEX IF NOT EXISTS idx_profiles_username_lower ON profiles(LOWER(username));
CREATE INDEX IF NOT EXISTS idx_profiles_is_public_created_at ON profiles(is_public, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_is_public_view_count ON profiles(is_public, view_count DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON profiles(is_premium);
CREATE INDEX IF NOT EXISTS idx_profiles_is_verified ON profiles(is_verified);

-- Add indexes for social links
CREATE INDEX IF NOT EXISTS idx_social_links_user_id_visible ON social_links(user_id, is_visible);
CREATE INDEX IF NOT EXISTS idx_social_links_sort_order ON social_links(user_id, sort_order);

-- Add indexes for music tracks
CREATE INDEX IF NOT EXISTS idx_music_tracks_user_id_visible ON music_tracks(user_id, is_visible);
CREATE INDEX IF NOT EXISTS idx_music_tracks_sort_order ON music_tracks(user_id, sort_order);

-- Add indexes for analytics
CREATE INDEX IF NOT EXISTS idx_analytics_events_profile_id_created_at ON analytics_events(profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);

-- Add indexes for file uploads
CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON file_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_created_at ON file_uploads(created_at DESC);

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_profiles_public_premium_verified ON profiles(is_public, is_premium, is_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_public_views_created ON profiles(is_public, view_count DESC, created_at DESC);

-- Optimize the profiles table for better performance
ANALYZE profiles;
ANALYZE social_links;
ANALYZE music_tracks;
ANALYZE analytics_events;
ANALYZE file_uploads;

-- Create a materialized view for popular profiles (optional - for very high traffic)
-- This can be refreshed periodically to cache popular profile data
CREATE MATERIALIZED VIEW IF NOT EXISTS popular_profiles AS
SELECT 
  id,
  username,
  display_name,
  avatar_url,
  view_count,
  is_premium,
  is_verified,
  created_at
FROM profiles 
WHERE is_public = true 
  AND username IS NOT NULL 
  AND username != ''
ORDER BY view_count DESC, created_at DESC
LIMIT 100;

-- Create index on the materialized view
CREATE INDEX IF NOT EXISTS idx_popular_profiles_view_count ON popular_profiles(view_count DESC);

-- Function to refresh the materialized view (call this periodically)
CREATE OR REPLACE FUNCTION refresh_popular_profiles()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW popular_profiles;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT ON popular_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_popular_profiles() TO authenticated;

-- Add comments for documentation
COMMENT ON INDEX idx_profiles_username_lower IS 'Optimizes username lookups (case-insensitive)';
COMMENT ON INDEX idx_profiles_is_public_created_at IS 'Optimizes public profile listings by creation date';
COMMENT ON INDEX idx_profiles_is_public_view_count IS 'Optimizes public profile listings by view count';
COMMENT ON INDEX idx_profiles_public_premium_verified IS 'Optimizes filtered profile queries';
COMMENT ON MATERIALIZED VIEW popular_profiles IS 'Cached view of most popular profiles for faster loading';
