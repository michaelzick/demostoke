-- Create jpeg_images table to store converted JPEG images
CREATE TABLE public.jpeg_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_url TEXT NOT NULL,
  jpeg_url TEXT NOT NULL,
  source_table TEXT NOT NULL,
  source_column TEXT NOT NULL,
  source_record_id UUID,
  original_size INTEGER,
  jpeg_size INTEGER,
  original_width INTEGER,
  original_height INTEGER,
  jpeg_width INTEGER,
  jpeg_height INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.jpeg_images ENABLE ROW LEVEL SECURITY;

-- Create policies for jpeg_images
CREATE POLICY "Admins can manage jpeg_images" 
ON public.jpeg_images 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can read jpeg_images" 
ON public.jpeg_images 
FOR SELECT 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_jpeg_images_original_url ON public.jpeg_images(original_url);
CREATE INDEX idx_jpeg_images_source ON public.jpeg_images(source_table, source_column);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_jpeg_images_updated_at
BEFORE UPDATE ON public.jpeg_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for jpeg images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('jpeg-images', 'jpeg-images', true);

-- Create storage policies for jpeg-images bucket
CREATE POLICY "Anyone can view jpeg images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'jpeg-images');

CREATE POLICY "Admins can upload jpeg images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'jpeg-images' AND is_admin(auth.uid()));

CREATE POLICY "Admins can update jpeg images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'jpeg-images' AND is_admin(auth.uid()));

CREATE POLICY "Admins can delete jpeg images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'jpeg-images' AND is_admin(auth.uid()));