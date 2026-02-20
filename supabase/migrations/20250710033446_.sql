-- Create a table for tracking downloaded and processed images
CREATE TABLE public.processed_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_url TEXT NOT NULL,
  processed_url TEXT NOT NULL,
  source_table TEXT NOT NULL,
  source_column TEXT NOT NULL,
  source_record_id UUID,
  original_size INTEGER,
  processed_size INTEGER,
  original_width INTEGER,
  original_height INTEGER,
  processed_width INTEGER,
  processed_height INTEGER,
  original_format TEXT,
  processed_format TEXT,
  was_resized BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.processed_images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage processed_images" 
ON public.processed_images 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can read processed_images" 
ON public.processed_images 
FOR SELECT 
USING (true);

-- Create storage bucket for processed images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('processed-images', 'processed-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for processed images
CREATE POLICY "Anyone can view processed images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'processed-images');

CREATE POLICY "Service role can upload processed images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'processed-images');

CREATE POLICY "Service role can update processed images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'processed-images');

CREATE POLICY "Service role can delete processed images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'processed-images');;
