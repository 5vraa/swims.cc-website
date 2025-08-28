-- Add reveal page settings to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reveal_type VARCHAR(20) DEFAULT 'none' CHECK (reveal_type IN ('none', 'age', 'content', 'nsfw', 'custom'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reveal_title TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reveal_description TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reveal_min_age INTEGER DEFAULT 18;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reveal_custom_message TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- Create analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for analytics
CREATE INDEX IF NOT EXISTS idx_analytics_events_profile_id ON analytics_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- Enable RLS on analytics_events
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for analytics_events
CREATE POLICY "Users can view their own analytics" ON analytics_events
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert analytics events" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(profile_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET view_count = view_count + 1 
  WHERE id = profile_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment like count
CREATE OR REPLACE FUNCTION increment_like_count(profile_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET like_count = like_count + 1 
  WHERE id = profile_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
