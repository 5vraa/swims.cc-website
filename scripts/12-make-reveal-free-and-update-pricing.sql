-- Make reveal page free for all users and update pricing structure
-- This script removes premium restrictions from reveal page and updates user permissions

-- 1. Make reveal page free for all users
UPDATE profiles 
SET 
  reveal_enabled = TRUE,
  is_premium = FALSE
WHERE reveal_enabled = FALSE;

-- 2. Add new free appearance features
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS custom_css TEXT,
ADD COLUMN IF NOT EXISTS custom_js TEXT,
ADD COLUMN IF NOT EXISTS advanced_animations BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS custom_fonts BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS gradient_backgrounds BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS particle_effects BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS premium_themes BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS custom_domain BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS advanced_analytics BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS priority_support BOOLEAN DEFAULT FALSE;

-- 3. Set default values for new appearance features
UPDATE profiles 
SET 
  custom_css = '',
  custom_js = '',
  advanced_animations = TRUE,
  custom_fonts = TRUE,
  gradient_backgrounds = TRUE,
  particle_effects = TRUE,
  premium_themes = FALSE,
  custom_domain = FALSE,
  advanced_analytics = FALSE,
  priority_support = FALSE
WHERE custom_css IS NULL;

-- 4. Create a new table for premium features
CREATE TABLE IF NOT EXISTS premium_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create premium features for existing users (if they had premium)
INSERT INTO premium_features (user_id, feature_name, is_active, expires_at)
SELECT 
  id,
  'premium_themes',
  is_premium,
  CASE WHEN is_premium THEN NOW() + INTERVAL '1 year' ELSE NULL END
FROM profiles 
WHERE is_premium = TRUE
ON CONFLICT DO NOTHING;

-- 6. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_premium_features_user_id ON premium_features(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_features_feature_name ON premium_features(feature_name);
CREATE INDEX IF NOT EXISTS idx_profiles_reveal_enabled ON profiles(reveal_enabled);

-- 7. Create a function to check if user has access to a premium feature
CREATE OR REPLACE FUNCTION check_premium_feature(user_uuid UUID, feature VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM premium_features 
    WHERE user_id = user_uuid 
      AND feature_name = feature 
      AND is_active = TRUE 
      AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create a function to grant premium feature access
CREATE OR REPLACE FUNCTION grant_premium_feature(user_uuid UUID, feature VARCHAR, duration_days INTEGER DEFAULT 365)
RETURNS VOID AS $$
BEGIN
  INSERT INTO premium_features (user_id, feature_name, is_active, expires_at)
  VALUES (user_uuid, feature, TRUE, NOW() + (duration_days || ' days')::INTERVAL)
  ON CONFLICT (user_id, feature_name) 
  DO UPDATE SET 
    is_active = TRUE,
    expires_at = NOW() + (duration_days || ' days')::INTERVAL,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create a function to revoke premium feature access
CREATE OR REPLACE FUNCTION revoke_premium_feature(user_uuid UUID, feature VARCHAR)
RETURNS VOID AS $$
BEGIN
  UPDATE premium_features 
  SET is_active = FALSE, updated_at = NOW()
  WHERE user_id = user_uuid AND feature_name = feature;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Update RLS policies for premium features
ALTER TABLE premium_features ENABLE ROW LEVEL SECURITY;

-- Users can view their own premium features
CREATE POLICY "Users can view own premium features" ON premium_features
  FOR SELECT USING (auth.uid() = user_id);

-- Only admins can modify premium features
CREATE POLICY "Only admins can modify premium features" ON premium_features
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- 11. Create a view for easy access to user's premium status
CREATE OR REPLACE VIEW user_premium_status AS
SELECT 
  p.id,
  p.username,
  p.display_name,
  p.is_premium,
  p.reveal_enabled,
  p.advanced_animations,
  p.custom_fonts,
  p.gradient_backgrounds,
  p.particle_effects,
  p.premium_themes,
  p.custom_domain,
  p.advanced_analytics,
  p.priority_support,
  CASE WHEN p.is_premium THEN 'Premium' ELSE 'Free' END as subscription_tier
FROM profiles p;

-- 12. Grant permissions
GRANT SELECT ON user_premium_status TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON premium_features TO authenticated;

-- 13. Create a trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_premium_features_updated_at
  BEFORE UPDATE ON premium_features
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 14. Insert some sample premium features for testing
INSERT INTO premium_features (user_id, feature_name, is_active, expires_at)
SELECT 
  id,
  'custom_domain',
  FALSE,
  NULL
FROM profiles 
LIMIT 5
ON CONFLICT DO NOTHING;

-- 15. Create a function to get user's available features
CREATE OR REPLACE FUNCTION get_user_features(user_uuid UUID)
RETURNS TABLE(
  feature_name VARCHAR,
  is_available BOOLEAN,
  is_premium BOOLEAN,
  expires_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.feature_name,
    f.is_active as is_available,
    TRUE as is_premium,
    f.expires_at
  FROM premium_features f
  WHERE f.user_id = user_uuid
  
  UNION ALL
  
  SELECT 
    'reveal_page'::VARCHAR,
    TRUE,
    FALSE,
    NULL::TIMESTAMP WITH TIME ZONE
  
  UNION ALL
  
  SELECT 
    'basic_appearance'::VARCHAR,
    TRUE,
    FALSE,
    NULL::TIMESTAMP WITH TIME ZONE
  
  UNION ALL
  
  SELECT 
    'advanced_animations'::VARCHAR,
    TRUE,
    FALSE,
    NULL::TIMESTAMP WITH TIME ZONE
  
  UNION ALL
  
  SELECT 
    'custom_fonts'::VARCHAR,
    TRUE,
    FALSE,
    NULL::TIMESTAMP WITH TIME ZONE
  
  UNION ALL
  
  SELECT 
    'gradient_backgrounds'::VARCHAR,
    TRUE,
    FALSE,
    NULL::TIMESTAMP WITH TIME ZONE
  
  UNION ALL
  
  SELECT 
    'particle_effects'::VARCHAR,
    TRUE,
    FALSE,
    NULL::TIMESTAMP WITH TIME ZONE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_features(UUID) TO authenticated;

-- 17. Create a summary view of all features
CREATE OR REPLACE VIEW feature_summary AS
SELECT 
  'Free Features' as category,
  ARRAY[
    'reveal_page',
    'basic_appearance', 
    'advanced_animations',
    'custom_fonts',
    'gradient_backgrounds',
    'particle_effects'
  ] as features

UNION ALL

SELECT 
  'Premium Features' as category,
  ARRAY[
    'premium_themes',
    'custom_domain',
    'advanced_analytics',
    'priority_support'
  ] as features;

-- 18. Grant permissions on the summary view
GRANT SELECT ON feature_summary TO authenticated;

-- 19. Create a function to check if user can access a specific feature
CREATE OR REPLACE FUNCTION can_access_feature(user_uuid UUID, feature VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  is_free_feature BOOLEAN;
  has_premium_access BOOLEAN;
BEGIN
  -- Check if it's a free feature
  is_free_feature := feature IN (
    'reveal_page', 'basic_appearance', 'advanced_animations', 
    'custom_fonts', 'gradient_backgrounds', 'particle_effects'
  );
  
  IF is_free_feature THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user has premium access to this feature
  SELECT EXISTS (
    SELECT 1 FROM premium_features 
    WHERE user_id = user_uuid 
      AND feature_name = feature 
      AND is_active = TRUE 
      AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO has_premium_access;
  
  RETURN has_premium_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 20. Grant execute permission
GRANT EXECUTE ON FUNCTION can_access_feature(UUID, VARCHAR) TO authenticated;

-- Summary of changes:
-- 1. Made reveal page free for all users
-- 2. Added new free appearance features (animations, fonts, gradients, particles)
-- 3. Created premium features table for paid features
-- 4. Added functions to manage premium features
-- 5. Created views for easy access to feature status
-- 6. Set up proper RLS policies
-- 7. Added helper functions for feature checking

-- To apply these changes, run this script in your Supabase SQL editor
-- All users will now have access to the reveal page and basic appearance features for free
-- Premium features are now properly separated and can be managed through the premium_features table
