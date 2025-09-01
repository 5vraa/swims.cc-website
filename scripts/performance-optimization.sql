-- Performance Optimization Script
-- Based on your actual database structure from complete-database-setup.sql

-- 1. Create additional indexes for profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_display_name_lower ON public.profiles (lower(display_name));
CREATE INDEX IF NOT EXISTS idx_profiles_discord_id ON public.profiles (discord_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON public.profiles (is_premium);
CREATE INDEX IF NOT EXISTS idx_profiles_is_verified ON public.profiles (is_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);

-- 2. Create additional indexes for social_links table
CREATE INDEX IF NOT EXISTS idx_social_links_user_id ON public.social_links (user_id);
CREATE INDEX IF NOT EXISTS idx_social_links_is_visible ON public.social_links (is_visible);
CREATE INDEX IF NOT EXISTS idx_social_links_sort_order ON public.social_links (sort_order);

-- 3. Create additional indexes for music_tracks table
CREATE INDEX IF NOT EXISTS idx_music_tracks_user_id ON public.music_tracks (user_id);
CREATE INDEX IF NOT EXISTS idx_music_tracks_is_visible ON public.music_tracks (is_visible);
CREATE INDEX IF NOT EXISTS idx_music_tracks_order_index ON public.music_tracks (order_index);

-- 4. Create additional indexes for user_badges table
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON public.user_badges (badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON public.user_badges (earned_at);

-- 5. Create additional indexes for analytics_events table
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events (event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events (created_at);

-- 6. Create a materialized view for popular profiles (cached)
DROP MATERIALIZED VIEW IF EXISTS popular_profiles;
CREATE MATERIALIZED VIEW popular_profiles AS
SELECT 
  p.id,
  p.user_id,
  p.username,
  p.display_name,
  p.bio,
  p.avatar_url,
  p.background_color,
  p.background_image_url,
  p.theme,
  p.is_public,
  p.is_premium,
  p.is_verified,
  p.role,
  p.view_count,
  p.featured_badge_id,
  p.email,
  p.discord_id,
  p.discord_username,
  p.discord_authorized,
  p.spotify_connected,
  p.spotify_username,
  p.card_outline_color,
  p.card_glow_color,
  p.card_glow_intensity,
  p.background_blur,
  p.font_family,
  p.font_size,
  p.font_color,
  p.hover_effects,
  p.parallax_effects,
  p.particle_effects,
  p.reveal_enabled,
  p.reveal_title,
  p.reveal_message,
  p.reveal_button,
  p.created_at,
  p.updated_at,
  -- Count social links
  (SELECT COUNT(*) FROM public.social_links sl WHERE sl.profile_id = p.id AND sl.is_visible = true) as social_links_count,
  -- Count music tracks
  (SELECT COUNT(*) FROM public.music_tracks mt WHERE mt.profile_id = p.id AND mt.is_visible = true) as music_tracks_count,
  -- Count badges
  (SELECT COUNT(*) FROM public.user_badges ub WHERE ub.user_id = p.user_id) as badges_count
FROM public.profiles p
WHERE p.is_public = true
ORDER BY p.view_count DESC, p.created_at DESC;

-- 7. Create indexes on materialized view
CREATE INDEX IF NOT EXISTS idx_popular_profiles_view_count ON popular_profiles (view_count DESC);
CREATE INDEX IF NOT EXISTS idx_popular_profiles_created_at ON popular_profiles (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_popular_profiles_username ON popular_profiles (username);

-- 8. Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_popular_profiles()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW popular_profiles;
END;
$$ LANGUAGE plpgsql;

-- 9. Create a function to increment view count efficiently
CREATE OR REPLACE FUNCTION increment_profile_view_count(profile_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles 
  SET view_count = view_count + 1 
  WHERE id = profile_id;
END;
$$ LANGUAGE plpgsql;

-- 10. Create a function to get profile with related data efficiently
CREATE OR REPLACE FUNCTION get_profile_with_data(profile_username TEXT)
RETURNS TABLE (
  profile_data JSONB,
  social_links JSONB,
  music_tracks JSONB,
  badges JSONB
) AS $$
DECLARE
  profile_record RECORD;
  social_links_data JSONB;
  music_tracks_data JSONB;
  badges_data JSONB;
BEGIN
  -- Get profile data
  SELECT to_jsonb(p.*) INTO profile_record
  FROM public.profiles p
  WHERE p.username = profile_username AND p.is_public = true;
  
  IF profile_record IS NULL THEN
    RETURN;
  END IF;
  
  -- Get social links
  SELECT jsonb_agg(to_jsonb(sl.*)) INTO social_links_data
  FROM public.social_links sl
  WHERE sl.profile_id = profile_record.id AND sl.is_visible = true
  ORDER BY sl.sort_order;
  
  -- Get music tracks
  SELECT jsonb_agg(to_jsonb(mt.*)) INTO music_tracks_data
  FROM public.music_tracks mt
  WHERE mt.profile_id = profile_record.id AND mt.is_visible = true
  ORDER BY mt.order_index;
  
  -- Get badges
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', b.id,
      'name', b.name,
      'description', b.description,
      'icon_url', b.icon_url,
      'color', b.color,
      'is_premium', b.is_premium,
      'is_verified', b.is_verified,
      'earned_at', ub.earned_at
    )
  ) INTO badges_data
  FROM public.user_badges ub
  JOIN public.badges b ON ub.badge_id = b.id
  WHERE ub.user_id = profile_record.user_id;
  
  -- Return all data
  RETURN QUERY SELECT 
    to_jsonb(profile_record.*),
    COALESCE(social_links_data, '[]'::jsonb),
    COALESCE(music_tracks_data, '[]'::jsonb),
    COALESCE(badges_data, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- 11. Grant permissions
GRANT SELECT ON popular_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_popular_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION increment_profile_view_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_profile_with_data(TEXT) TO authenticated;

-- 12. Create a scheduled job to refresh materialized view (if using pg_cron)
-- This would need to be set up in Supabase dashboard or via SQL
-- SELECT cron.schedule('refresh-popular-profiles', '0 */6 * * *', 'SELECT refresh_popular_profiles();');

-- 13. Optimize existing queries by adding partial indexes
CREATE INDEX IF NOT EXISTS idx_profiles_public_recent ON public.profiles (created_at DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_profiles_premium ON public.profiles (is_premium, created_at DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON public.profiles (is_verified, created_at DESC) WHERE is_public = true;

-- 14. Add statistics for better query planning
ANALYZE public.profiles;
ANALYZE public.social_links;
ANALYZE public.music_tracks;
ANALYZE public.user_badges;
ANALYZE public.badges;
ANALYZE public.analytics_events;

-- 15. Verify setup
SELECT 'Performance optimization completed successfully!' as status;