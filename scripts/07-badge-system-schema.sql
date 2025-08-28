-- Badge System Database Schema

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  assigned_by UUID,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for badges
CREATE POLICY "Badges are viewable by everyone" ON badges
  FOR SELECT USING (is_active = true);

-- RLS Policies for user_badges
CREATE POLICY "User badges are viewable by everyone" ON user_badges
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage user badges" ON user_badges
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default badges
INSERT INTO badges (name, display_name, description, color, icon) VALUES
  ('owner', 'Owner', 'Platform owner and founder', '#ff0000', 'crown'),
  ('developer', 'Developer', 'Core platform developer', '#00ff00', 'code'),
  ('premium', 'Premium', 'Premium subscriber', '#ffd700', 'star'),
  ('verified', 'Verified', 'Verified account', '#1da1f2', 'check-circle'),
  ('early_supporter', 'Early Supporter', 'Early platform supporter', '#9146ff', 'heart'),
  ('content_creator', 'Content Creator', 'Recognized content creator', '#ff6b6b', 'video'),
  ('beta_tester', 'Beta Tester', 'Beta testing participant', '#4ecdc4', 'flask'),
  ('moderator', 'Moderator', 'Community moderator', '#ff9f43', 'shield')
ON CONFLICT (name) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
