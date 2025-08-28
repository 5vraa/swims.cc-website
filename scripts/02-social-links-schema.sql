-- Create social_links table
CREATE TABLE IF NOT EXISTS social_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(100) NOT NULL,
  url TEXT NOT NULL,
  icon VARCHAR(50), -- Icon name or custom icon URL
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS social_links_user_id_idx ON social_links(user_id);
CREATE INDEX IF NOT EXISTS social_links_position_idx ON social_links(user_id, position);

-- Enable RLS
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own social links" ON social_links
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own social links" ON social_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social links" ON social_links
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own social links" ON social_links
  FOR DELETE USING (auth.uid() = user_id);

-- Allow public to view active social links for profile pages
CREATE POLICY "Public can view active social links" ON social_links
  FOR SELECT USING (is_active = true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_social_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_social_links_updated_at
  BEFORE UPDATE ON social_links
  FOR EACH ROW
  EXECUTE FUNCTION update_social_links_updated_at();
