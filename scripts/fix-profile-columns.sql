-- Fix Profile Columns Script
-- This ensures all profiles have the required columns for the dashboard to work

-- 1. Add any missing columns to existing profiles
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

-- 2. Update existing profiles with default values for required fields
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

-- 3. Ensure all profiles have a username (required for the app to work)
UPDATE public.profiles 
SET username = COALESCE(username, 'user-' || id::text)
WHERE username IS NULL OR username = '';

-- 4. Ensure all profiles have display_name
UPDATE public.profiles 
SET display_name = COALESCE(display_name, username)
WHERE display_name IS NULL OR display_name = '';

-- 5. Ensure all profiles have is_public set
UPDATE public.profiles 
SET is_public = COALESCE(is_public, true)
WHERE is_public IS NULL;

-- 6. Show what was fixed
SELECT 
  'Profile columns fixed successfully!' as status,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN theme IS NOT NULL THEN 1 END) as profiles_with_theme,
  COUNT(CASE WHEN is_premium IS NOT NULL THEN 1 END) as profiles_with_premium,
  COUNT(CASE WHEN role IS NOT NULL THEN 1 END) as profiles_with_role
FROM public.profiles;
