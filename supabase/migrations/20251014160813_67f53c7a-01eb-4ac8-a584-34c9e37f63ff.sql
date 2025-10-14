-- Drop the processed_images table
-- This table was only used by the unused download-resize-image edge function
-- The processed-images storage bucket remains intact with its image files
DROP TABLE IF EXISTS public.processed_images CASCADE;