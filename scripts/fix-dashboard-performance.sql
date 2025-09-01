-- DASHBOARD PERFORMANCE FIX - This will make your dashboard load fast!
-- The issue is missing profile columns and inefficient queries

-- 1. First, let's see what columns are actually missing from profiles
DO $$
DECLARE
    missing_columns TEXT[] := ARRAY[]::TEXT[];
    required_columns TEXT[] := ARRAY[
        'theme', 'is_premium', 'is_verified', 'role', 'featured_badge_id',
        'discord_id', 'discord_username', 'discord_authorized', 'spotify_connected',
        'spotify_username', 'card_outline_color', 'card_glow_color', 'card_glow_intensity',
        'background_blur', 'font_family', 'font_size', 'font_color', 'hover_effects',
        'parallax_effects', 'particle_effects', 'reveal_enabled', 'reveal_title',
        'reveal_message', 'reveal_button', 'custom_css', 'custom_js',
        'advanced_animations', 'custom_fonts', 'background_opacity', 'card_border_radius',
        'card_background', 'font_weight', 'letter_spacing', 'text_shadows',
        'gradient_text', 'smooth_transitions'
    ];
    col TEXT;
BEGIN
    RAISE NOTICE 'Checking for missing profile columns...';
    
    FOREACH col IN ARRAY required_columns
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = col
        ) THEN
            missing_columns := array_append(missing_columns, col);
            RAISE NOTICE 'Missing column: %', col;
        END IF;
    END LOOP;
    
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE NOTICE 'Found % missing columns', array_length(missing_columns, 1);
    ELSE
        RAISE NOTICE 'All required columns exist!';
    END IF;
END $$;

-- 2. Add any missing columns with proper defaults
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS theme VARCHAR(20) DEFAULT 'dark',
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user',
ADD COLUMN IF NOT EXISTS featured_badge_id UUID,
ADD COLUMN IF NOT EXISTS discord_id TEXT,
ADD COLUMN IF NOT EXISTS discord_username TEXT,
ADD COLUMN IF NOT EXISTS discord_authorized BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS spotify_connected BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS spotify_username TEXT,
ADD COLUMN IF NOT EXISTS card_outline_color VARCHAR(7) DEFAULT '#ef4444',
ADD COLUMN IF NOT EXISTS card_glow_color VARCHAR(7) DEFAULT '#ef4444',
ADD COLUMN IF NOT EXISTS card_glow_intensity DECIMAL(3,2) DEFAULT 0.5,
ADD COLUMN IF NOT EXISTS background_blur INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS font_family VARCHAR(50) DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS font_size VARCHAR(10) DEFAULT '16px',
ADD COLUMN IF NOT EXISTS font_color VARCHAR(7) DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS hover_effects BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS parallax_effects BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS particle_effects BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS reveal_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS reveal_title TEXT DEFAULT 'Reveal Page',
ADD COLUMN IF NOT EXISTS reveal_message TEXT DEFAULT 'This is a reveal page',
ADD COLUMN IF NOT EXISTS reveal_button TEXT DEFAULT 'Reveal',
ADD COLUMN IF NOT EXISTS custom_css TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS custom_js TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS advanced_animations BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS custom_fonts BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS background_opacity DECIMAL(3,2) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS card_border_radius INTEGER DEFAULT 12,
ADD COLUMN IF NOT EXISTS card_background VARCHAR(7) DEFAULT '#1f2937',
ADD COLUMN IF NOT EXISTS font_weight VARCHAR(20) DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS letter_spacing DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS text_shadows BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS gradient_text BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS smooth_transitions BOOLEAN DEFAULT true;

-- 3. Update existing profiles with default values for required fields
UPDATE public.profiles 
SET 
  theme = COALESCE(theme, 'dark'),
  is_premium = COALESCE(is_premium, false),
  is_verified = COALESCE(is_verified, false),
  role = COALESCE(role, 'user'),
  card_outline_color = COALESCE(card_outline_color, '#ef4444'),
  card_glow_color = COALESCE(card_glow_color, '#ef4444'),
  card_glow_intensity = COALESCE(card_glow_intensity, 0.5),
  background_blur = COALESCE(background_blur, 0),
  font_family = COALESCE(font_family, 'Inter'),
  font_size = COALESCE(font_size, '16px'),
  font_color = COALESCE(font_color, '#ffffff'),
  hover_effects = COALESCE(hover_effects, true),
  parallax_effects = COALESCE(parallax_effects, true),
  particle_effects = COALESCE(particle_effects, true),
  reveal_enabled = COALESCE(reveal_enabled, true),
  reveal_title = COALESCE(reveal_title, 'Reveal Page'),
  reveal_message = COALESCE(reveal_message, 'This is a reveal page'),
  reveal_button = COALESCE(reveal_button, 'Reveal'),
  background_opacity = COALESCE(background_opacity, 1.0),
  card_border_radius = COALESCE(card_border_radius, 12),
  card_background = COALESCE(card_background, '#1f2937'),
  font_weight = COALESCE(font_weight, 'normal'),
  letter_spacing = COALESCE(letter_spacing, 0.0),
  text_shadows = COALESCE(text_shadows, false),
  gradient_text = COALESCE(gradient_text, false),
  smooth_transitions = COALESCE(smooth_transitions, true)
WHERE 
  theme IS NULL 
  OR is_premium IS NULL 
  OR is_verified IS NULL 
  OR role IS NULL
  OR card_outline_color IS NULL
  OR card_glow_color IS NULL
  OR card_glow_intensity IS NULL
  OR background_blur IS NULL
  OR font_family IS NULL
  OR font_size IS NULL
  OR font_color IS NULL
  OR hover_effects IS NULL
  OR parallax_effects IS NULL
  OR particle_effects IS NULL
  OR reveal_enabled IS NULL
  OR reveal_title IS NULL
  OR reveal_message IS NULL
  OR reveal_button IS NULL
  OR background_opacity IS NULL
  OR card_border_radius IS NULL
  OR card_background IS NULL
  OR font_weight IS NULL
  OR letter_spacing IS NULL
  OR text_shadows IS NULL
  OR gradient_text IS NULL
  OR smooth_transitions IS NULL;

-- 4. Ensure all profiles have required basic fields
UPDATE public.profiles 
SET 
  username = COALESCE(username, 'user-' || id::text),
  display_name = COALESCE(display_name, username),
  is_public = COALESCE(is_public, true),
  background_color = COALESCE(background_color, '#000000')
WHERE 
  username IS NULL OR username = '' OR
  display_name IS NULL OR display_name = '' OR
  is_public IS NULL OR
  background_color IS NULL;

-- 5. Create FAST INDEX for dashboard profile loading
CREATE INDEX IF NOT EXISTS idx_dashboard_profile_fast ON public.profiles (id, username, display_name, email, discord_id, is_public, background_color);

-- 6. Create FAST FUNCTION to get dashboard profile data in ONE query
CREATE OR REPLACE FUNCTION get_dashboard_profile_fast(user_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT to_jsonb(p.*) INTO result
  FROM public.profiles p
  WHERE p.id = user_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 7. Grant permissions
GRANT EXECUTE ON FUNCTION get_dashboard_profile_fast(UUID) TO authenticated;

-- 8. Show what was fixed
SELECT 
  '🚀 DASHBOARD PERFORMANCE FIX COMPLETED!' as status,
  'Your dashboard should now load fast!' as message,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN theme IS NOT NULL THEN 1 END) as profiles_with_theme,
  COUNT(CASE WHEN is_premium IS NOT NULL THEN 1 END) as profiles_with_premium,
  COUNT(CASE WHEN role IS NOT NULL THEN 1 END) as profiles_with_role
FROM public.profiles;
