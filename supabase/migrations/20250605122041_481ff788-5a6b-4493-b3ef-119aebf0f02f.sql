
-- Create a storage bucket for videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  true,
  104857600, -- 100MB limit, adjust as needed
  ARRAY['video/mp4', 'video/webm', 'video/ogg']
);

-- Create policy to allow public access to videos
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

-- Create policy to allow authenticated users to upload videos
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'videos' AND auth.role() = 'authenticated');

-- Create policy to allow authenticated users to update videos
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
USING (bucket_id = 'videos' AND auth.role() = 'authenticated');

-- Create policy to allow authenticated users to delete videos
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
USING (bucket_id = 'videos' AND auth.role() = 'authenticated');
;
