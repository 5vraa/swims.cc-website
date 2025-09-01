-- FAST PERFORMANCE FIX - Run this to make your site much faster!
-- This adds critical indexes and optimizations that will immediately improve speed

-- 1. CRITICAL INDEXES for fast queries (these will make the biggest difference)
CREATE INDEX IF NOT EXISTS idx_profiles_username_fast ON public.profiles (username);
CREATE INDEX IF NOT EXISTS idx_profiles_public_fast ON public.profiles (is_public, view_count DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_discord_fast ON public.profiles (discord_id) WHERE discord_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_premium_fast ON public.profiles (is_premium, is_public) WHERE is_public = true;

-- 2. FAST INDEXES for social links and music
CREATE INDEX IF NOT EXISTS idx_social_links_profile_fast ON public.social_links (profile_id, is_visible, order_index);
CREATE INDEX IF NOT EXISTS idx_music_tracks_profile_fast ON public.music_tracks (profile_id, is_visible, order_index);
CREATE INDEX IF NOT EXISTS idx_user_badges_profile_fast ON public.user_badges (profile_id);

-- 3. COMPOSITE INDEXES for complex queries (these are game-changers)
CREATE INDEX IF NOT EXISTS idx_profiles_explore_fast ON public.profiles (is_public, is_premium, is_verified, view_count DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_search_fast ON public.profiles (is_public, lower(username), lower(display_name));

-- 4. FAST MATERIALIZED VIEW for homepage (this will make your homepage load instantly)
DROP MATERIALIZED VIEW IF EXISTS public.popular_profiles_fast;
CREATE MATERIALIZED VIEW public.popular_profiles_fast AS
SELECT 
  p.id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.bio,
  p.is_premium,
  p.is_verified,
  p.view_count,
  p.created_at,
  p.role,
  -- Fast counts using subqueries
  (SELECT COUNT(*) FROM public.social_links sl WHERE sl.profile_id = p.id AND sl.is_visible = true) as social_count,
  (SELECT COUNT(*) FROM public.music_tracks mt WHERE mt.profile_id = p.id AND mt.is_visible = true) as music_count,
  (SELECT COUNT(*) FROM public.user_badges ub WHERE ub.profile_id = p.id) as badge_count
FROM public.profiles p
WHERE p.is_public = true AND p.username IS NOT NULL
ORDER BY p.view_count DESC, p.created_at DESC
LIMIT 100;

-- 5. FAST INDEXES on the materialized view
CREATE INDEX IF NOT EXISTS idx_popular_profiles_fast_views ON public.popular_profiles_fast (view_count DESC);
CREATE INDEX IF NOT EXISTS idx_popular_profiles_fast_username ON public.popular_profiles_fast (username);

-- 6. FAST FUNCTION to refresh the view (run this periodically)
CREATE OR REPLACE FUNCTION refresh_popular_profiles_fast()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.popular_profiles_fast;
END;
$$ LANGUAGE plpgsql;

-- 7. FAST FUNCTION to get profile with all data in ONE query
CREATE OR REPLACE FUNCTION get_profile_fast(profile_username TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'profile', to_jsonb(p.*),
    'social_links', COALESCE(sl_data, '[]'::jsonb),
    'music_tracks', COALESCE(mt_data, '[]'::jsonb),
    'badges', COALESCE(b_data, '[]'::jsonb)
  ) INTO result
  FROM public.profiles p
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(to_jsonb(sl.*) ORDER BY sl.order_index) as sl_data
    FROM public.social_links sl 
    WHERE sl.profile_id = p.id AND sl.is_visible = true
  ) sl ON true
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(to_jsonb(mt.*) ORDER BY mt.order_index) as mt_data
    FROM public.music_tracks mt 
    WHERE mt.profile_id = p.id AND mt.is_visible = true
  ) mt ON true
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', b.id,
        'name', b.name,
        'display_name', b.display_name,
        'description', b.description,
        'color', b.color,
        'icon', b.icon,
        'assigned_at', ub.assigned_at
      )
    ) as b_data
    FROM public.user_badges ub
    JOIN public.badges b ON ub.badge_id = b.id
    WHERE ub.profile_id = p.id
  ) b ON true
  WHERE p.username = profile_username AND p.is_public = true;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 8. FAST FUNCTION to increment view count (non-blocking)
CREATE OR REPLACE FUNCTION increment_view_count_fast(profile_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles 
  SET view_count = COALESCE(view_count, 0) + 1 
  WHERE id = profile_id;
END;
$$ LANGUAGE plpgsql;

-- 9. GRANT permissions for the new objects
GRANT SELECT ON public.popular_profiles_fast TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_popular_profiles_fast() TO authenticated;
GRANT EXECUTE ON FUNCTION get_profile_fast(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_view_count_fast(UUID) TO authenticated;

-- 10. ANALYZE tables for better query planning
ANALYZE public.profiles;
ANALYZE public.social_links;
ANALYZE public.music_tracks;
ANALYZE public.user_badges;
ANALYZE public.badges;

-- 11. Show performance improvement status
SELECT 
  '🚀 FAST PERFORMANCE FIX COMPLETED!' as status,
  'Your site should now be MUCH faster!' as message,
  COUNT(*) as total_indexes_created,
  'Run refresh_popular_profiles_fast() periodically to keep homepage fast' as tip
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE '%_fast';
