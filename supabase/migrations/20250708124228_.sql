-- Create webp_images table to store converted WebP images
CREATE TABLE public.webp_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_url TEXT NOT NULL,
  webp_url TEXT NOT NULL,
  source_table TEXT NOT NULL,
  source_column TEXT NOT NULL,
  source_record_id UUID,
  original_size INTEGER,
  webp_size INTEGER,
  original_width INTEGER,
  original_height INTEGER,
  webp_width INTEGER,
  webp_height INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create temp_images table for temporary storage during processing
CREATE TABLE public.temp_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_url TEXT NOT NULL,
  temp_file_path TEXT,
  status TEXT DEFAULT 'downloading',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webp_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temp_images ENABLE ROW LEVEL SECURITY;

-- Create policies for webp_images
CREATE POLICY "Admins can manage webp_images" 
ON public.webp_images 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can read webp_images" 
ON public.webp_images 
FOR SELECT 
USING (true);

-- Create policies for temp_images  
CREATE POLICY "Admins can manage temp_images" 
ON public.temp_images 
FOR ALL 
USING (is_admin(auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_webp_images_original_url ON public.webp_images(original_url);
CREATE INDEX idx_webp_images_source ON public.webp_images(source_table, source_column);
CREATE INDEX idx_temp_images_url ON public.temp_images(original_url);
CREATE INDEX idx_temp_images_status ON public.temp_images(status);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_webp_images_updated_at
BEFORE UPDATE ON public.webp_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for webp images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('webp-images', 'webp-images', true);

-- Create storage policies for webp-images bucket
CREATE POLICY "Anyone can view webp images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'webp-images');

CREATE POLICY "Admins can upload webp images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'webp-images' AND is_admin(auth.uid()));

CREATE POLICY "Admins can update webp images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'webp-images' AND is_admin(auth.uid()));

CREATE POLICY "Admins can delete webp images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'webp-images' AND is_admin(auth.uid()));;
