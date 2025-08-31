-- Create File Uploads Table and Functions
-- This bypasses the need for Supabase storage buckets

-- 1. Create the file_uploads table
CREATE TABLE IF NOT EXISTS file_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  file_data TEXT NOT NULL, -- Base64 encoded file data
  bucket_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON file_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_filename ON file_uploads(filename);
CREATE INDEX IF NOT EXISTS idx_file_uploads_created_at ON file_uploads(created_at);

-- 3. Create RLS policies for security
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

-- Users can only see their own files
CREATE POLICY "Users can view own files" ON file_uploads
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own files
CREATE POLICY "Users can insert own files" ON file_uploads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own files
CREATE POLICY "Users can update own files" ON file_uploads
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own files
CREATE POLICY "Users can delete own files" ON file_uploads
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Create function to create the table (for the API to use)
CREATE OR REPLACE FUNCTION create_file_uploads_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function is already created above, so just return
  RETURN;
END;
$$;

-- 5. Grant permissions
GRANT ALL ON file_uploads TO authenticated;
GRANT EXECUTE ON FUNCTION create_file_uploads_table TO authenticated;

-- 6. Verify the table was created
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'file_uploads';

-- 7. Show the table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'file_uploads'
ORDER BY ordinal_position;
