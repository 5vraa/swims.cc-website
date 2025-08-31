-- Fix Database Issues Script
-- Based on your actual database structure

-- 1. Add missing user_id column to link profiles to auth users
DO $$ 
BEGIN
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'user_id') THEN
        ALTER TABLE profiles ADD COLUMN user_id UUID;
        
        -- Create index for better performance
        CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
        
        -- Add foreign key constraint to auth.users if possible
        BEGIN
            ALTER TABLE profiles ADD CONSTRAINT fk_profiles_user_id 
            FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        EXCEPTION
            WHEN others THEN
                -- If foreign key fails, just log it
                RAISE NOTICE 'Could not add foreign key constraint: %', SQLERRM;
        END;
    END IF;
END $$;

-- 2. Update existing profiles to link them to auth users
-- This will set user_id = id for existing profiles (temporary fix)
UPDATE profiles 
SET user_id = id 
WHERE user_id IS NULL;

-- 3. Show the updated table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 4. Show sample profiles to verify
SELECT id, username, user_id, is_public, role FROM profiles LIMIT 5;
