-- Add missing columns to profiles table for profile edit functionality
-- This script adds all the columns that the profile edit page is trying to select

-- Add missing columns with default values
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS border_radius INTEGER DEFAULT 8,
ADD COLUMN IF NOT EXISTS shadow_intensity DECIMAL(3,2) DEFAULT 0.5,
ADD COLUMN IF NOT EXISTS animation_speed DECIMAL(3,2) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS spotify_connected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS card_outline_color VARCHAR(7) DEFAULT '#ef4444',
ADD COLUMN IF NOT EXISTS card_glow_color VARCHAR(7) DEFAULT '#ef4444',
ADD COLUMN IF NOT EXISTS card_glow_intensity DECIMAL(3,2) DEFAULT 0.5,
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reveal_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reveal_title VARCHAR(255) DEFAULT 'Welcome to my profile!',
ADD COLUMN IF NOT EXISTS reveal_message TEXT DEFAULT 'Click to reveal my full profile and discover more about me.',
ADD COLUMN IF NOT EXISTS reveal_button VARCHAR(100) DEFAULT 'Reveal Profile';

-- Update existing profiles with default values for new columns
UPDATE profiles 
SET 
  border_radius = 8,
  shadow_intensity = 0.5,
  animation_speed = 1.0,
  spotify_connected = FALSE,
  card_outline_color = '#ef4444',
  card_glow_color = '#ef4444',
  card_glow_intensity = 0.5,
  is_premium = FALSE,
  reveal_enabled = FALSE,
  reveal_title = 'Welcome to my profile!',
  reveal_message = 'Click to reveal my full profile and discover more about me.',
  reveal_button = 'Reveal Profile'
WHERE 
  border_radius IS NULL 
  OR shadow_intensity IS NULL 
  OR animation_speed IS NULL 
  OR spotify_connected IS NULL
  OR card_outline_color IS NULL
  OR card_glow_color IS NULL
  OR card_glow_intensity IS NULL
  OR is_premium IS NULL
  OR reveal_enabled IS NULL
  OR reveal_title IS NULL
  OR reveal_message IS NULL
  OR reveal_button IS NULL;

-- Verify the columns were added
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN (
    'border_radius', 'shadow_intensity', 'animation_speed', 'spotify_connected',
    'card_outline_color', 'card_glow_color', 'card_glow_intensity', 'is_premium',
    'reveal_enabled', 'reveal_title', 'reveal_message', 'reveal_button'
  )
ORDER BY column_name;
