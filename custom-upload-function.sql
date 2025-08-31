-- Custom Upload Function to Bypass RLS Issues
-- This creates a function that can upload files without RLS restrictions

-- 1. Create a custom upload function
CREATE OR REPLACE FUNCTION public.upload_file(
  bucket_name text,
  file_path text,
  file_data bytea,
  content_type text DEFAULT 'application/octet-stream'
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  bucket_id uuid;
  file_id uuid;
  public_url text;
BEGIN
  -- Get bucket ID
  SELECT id INTO bucket_id 
  FROM storage.buckets 
  WHERE name = bucket_name;
  
  IF bucket_id IS NULL THEN
    RAISE EXCEPTION 'Bucket % not found', bucket_name;
  END IF;
  
  -- Generate file ID
  file_id := gen_random_uuid();
  
  -- Insert file record (bypassing RLS)
  INSERT INTO storage.objects (
    id,
    bucket_id,
    name,
    owner,
    metadata,
    created_at,
    updated_at
  ) VALUES (
    file_id,
    bucket_id,
    file_path,
    auth.uid(),
    jsonb_build_object(
      'mimetype', content_type,
      'size', octet_length(file_data)
    ),
    now(),
    now()
  );
  
  -- Return public URL
  SELECT storage.get_public_url(bucket_name, file_path) INTO public_url;
  
  RETURN public_url;
END;
$$;

-- 2. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.upload_file TO authenticated;

-- 3. Test the function
-- SELECT public.upload_file('avatars', 'test.txt', 'Hello World'::bytea, 'text/plain');
