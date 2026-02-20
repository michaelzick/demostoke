-- Create downloaded_images table
CREATE TABLE public.downloaded_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_url TEXT NOT NULL,
  downloaded_url TEXT NOT NULL,
  source_table TEXT NOT NULL,
  source_column TEXT NOT NULL,
  source_record_id UUID,
  original_size INTEGER,
  downloaded_size INTEGER,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.downloaded_images ENABLE ROW LEVEL SECURITY;

-- Create policies for downloaded_images
CREATE POLICY "Anyone can read downloaded_images" 
ON public.downloaded_images 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage downloaded_images" 
ON public.downloaded_images 
FOR ALL 
USING (is_admin(auth.uid()));

-- Create storage bucket for downloaded images
INSERT INTO storage.buckets (id, name, public) VALUES ('downloaded-images', 'downloaded-images', true);

-- Create policies for downloaded-images bucket
CREATE POLICY "Anyone can view downloaded images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'downloaded-images');

CREATE POLICY "Admins can upload downloaded images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'downloaded-images' AND is_admin(auth.uid()));

CREATE POLICY "Admins can update downloaded images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'downloaded-images' AND is_admin(auth.uid()));

CREATE POLICY "Admins can delete downloaded images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'downloaded-images' AND is_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_downloaded_images_updated_at
BEFORE UPDATE ON public.downloaded_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();;
