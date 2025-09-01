-- Minimal Database Schema Update for Discord OAuth Application
-- Run this in your Supabase SQL editor to add missing features

-- 1. Add missing columns to existing profiles table ONLY
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS theme VARCHAR(20) DEFAULT 'dark',
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user',
ADD COLUMN IF NOT EXISTS featured_badge_id UUID,
ADD COLUMN IF NOT EXISTS email TEXT,
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
ADD COLUMN IF NOT EXISTS gradient_backgrounds BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS premium_themes BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS custom_domain BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS advanced_analytics BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS priority_support BOOLEAN DEFAULT false;

-- 2. Add unique constraint on discord_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_discord_id_key'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_discord_id_key UNIQUE (discord_id);
  END IF;
END $$;

-- 3. Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 52428800, ARRAY['image/*']),
  ('backgrounds', 'backgrounds', true, 52428800, ARRAY['image/*']),
  ('music', 'music', true, 104857600, ARRAY['audio/*']),
  ('uploads', 'uploads', true, 104857600, ARRAY['image/*', 'audio/*', 'video/*'])
ON CONFLICT (id) DO NOTHING;

-- 4. Verify setup
SELECT 'Minimal schema update completed successfully!' as status;
