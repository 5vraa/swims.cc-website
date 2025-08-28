-- Add admin role to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'));

-- Create admin_logs table for tracking admin actions
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create changelog entries table
CREATE TABLE IF NOT EXISTS changelog_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  version VARCHAR(20),
  type VARCHAR(20) DEFAULT 'feature' CHECK (type IN ('feature', 'bugfix', 'improvement', 'security')),
  is_published BOOLEAN DEFAULT false,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create redeem codes table
CREATE TABLE IF NOT EXISTS redeem_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) DEFAULT 'premium' CHECK (type IN ('premium', 'storage', 'custom')),
  value JSONB DEFAULT '{}',
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create code redemptions table
CREATE TABLE IF NOT EXISTS code_redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code_id UUID REFERENCES redeem_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET
);

-- Enable RLS on new tables
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE changelog_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE redeem_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_logs
CREATE POLICY "Admins can view all admin logs" ON admin_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
  );

CREATE POLICY "Admins can insert admin logs" ON admin_logs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
  );

-- RLS Policies for changelog_entries
CREATE POLICY "Everyone can view published changelog entries" ON changelog_entries
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage all changelog entries" ON changelog_entries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
  );

-- RLS Policies for redeem_codes
CREATE POLICY "Admins can manage redeem codes" ON redeem_codes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
  );

-- RLS Policies for code_redemptions
CREATE POLICY "Users can view their own redemptions" ON code_redemptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own redemptions" ON code_redemptions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all redemptions" ON code_redemptions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_changelog_entries_published ON changelog_entries(is_published);
CREATE INDEX IF NOT EXISTS idx_redeem_codes_code ON redeem_codes(code);
CREATE INDEX IF NOT EXISTS idx_redeem_codes_active ON redeem_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_code_redemptions_user_id ON code_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_code_redemptions_code_id ON code_redemptions(code_id);
