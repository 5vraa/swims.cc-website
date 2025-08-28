-- Add any missing indexes for performance
CREATE INDEX IF NOT EXISTS profiles_username_public_idx ON profiles(username, is_public);
CREATE INDEX IF NOT EXISTS profiles_is_public_idx ON profiles(is_public);

-- Add analytics table for tracking profile views and link clicks
CREATE TABLE IF NOT EXISTS profile_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  event_type VARCHAR(50) NOT NULL, -- 'profile_view', 'link_click', 'music_play'
  event_data JSONB, -- Additional data like link_id, track_id, etc.
  visitor_ip INET,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for analytics
CREATE INDEX IF NOT EXISTS profile_analytics_profile_id_idx ON profile_analytics(profile_id);
CREATE INDEX IF NOT EXISTS profile_analytics_event_type_idx ON profile_analytics(event_type);
CREATE INDEX IF NOT EXISTS profile_analytics_created_at_idx ON profile_analytics(created_at);

-- Enable RLS for analytics
ALTER TABLE profile_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for analytics
CREATE POLICY "Users can view their own analytics" ON profile_analytics
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert analytics" ON profile_analytics
  FOR INSERT WITH CHECK (true);

-- Add function to get profile analytics summary
CREATE OR REPLACE FUNCTION get_profile_analytics_summary(profile_uuid UUID)
RETURNS TABLE (
  total_views BIGINT,
  total_link_clicks BIGINT,
  total_music_plays BIGINT,
  views_this_month BIGINT,
  top_referrers JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM profile_analytics WHERE profile_id = profile_uuid AND event_type = 'profile_view'),
    (SELECT COUNT(*) FROM profile_analytics WHERE profile_id = profile_uuid AND event_type = 'link_click'),
    (SELECT COUNT(*) FROM profile_analytics WHERE profile_id = profile_uuid AND event_type = 'music_play'),
    (SELECT COUNT(*) FROM profile_analytics WHERE profile_id = profile_uuid AND event_type = 'profile_view' AND created_at >= date_trunc('month', NOW())),
    (SELECT COALESCE(json_agg(json_build_object('referrer', referrer, 'count', count)), '[]'::jsonb)
     FROM (
       SELECT referrer, COUNT(*) as count
       FROM profile_analytics 
       WHERE profile_id = profile_uuid AND referrer IS NOT NULL
       GROUP BY referrer
       ORDER BY count DESC
       LIMIT 10
     ) t);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add updated_at triggers for any missing tables
DO $$
BEGIN
  -- Check if trigger exists for social_links
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_social_links_updated_at'
  ) THEN
    CREATE TRIGGER update_social_links_updated_at
      BEFORE UPDATE ON social_links
      FOR EACH ROW
      EXECUTE FUNCTION update_social_links_updated_at();
  END IF;
END $$;

-- Ensure all storage policies are in place
DO $$
BEGIN
  -- Create uploads bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('uploads', 'uploads', true)
  ON CONFLICT (id) DO NOTHING;
  
  -- Ensure all storage policies exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload their own files'
  ) THEN
    CREATE POLICY "Users can upload their own files" ON storage.objects
      FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can view their own files'
  ) THEN
    CREATE POLICY "Users can view their own files" ON storage.objects
      FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public can view uploaded files'
  ) THEN
    CREATE POLICY "Public can view uploaded files" ON storage.objects
      FOR SELECT USING (bucket_id = 'uploads');
  END IF;
END $$;
