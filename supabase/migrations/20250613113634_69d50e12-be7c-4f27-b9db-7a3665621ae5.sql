
-- Create a table for equipment reviews
CREATE TABLE public.equipment_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for reviews
ALTER TABLE public.equipment_reviews ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to view reviews
CREATE POLICY "Anyone can view reviews" 
  ON public.equipment_reviews 
  FOR SELECT 
  USING (true);

-- Policy to allow authenticated users to create reviews
CREATE POLICY "Authenticated users can create reviews" 
  ON public.equipment_reviews 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

-- Policy to allow users to update their own reviews
CREATE POLICY "Users can update their own reviews" 
  ON public.equipment_reviews 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = reviewer_id);

-- Policy to allow users to delete their own reviews
CREATE POLICY "Users can delete their own reviews" 
  ON public.equipment_reviews 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = reviewer_id);

-- Add indexes for performance
CREATE INDEX idx_equipment_reviews_equipment_id ON public.equipment_reviews(equipment_id);
CREATE INDEX idx_equipment_reviews_reviewer_id ON public.equipment_reviews(reviewer_id);

-- Add trigger to update the updated_at column
CREATE TRIGGER update_equipment_reviews_updated_at
  BEFORE UPDATE ON public.equipment_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add member_since column to profiles table if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS member_since TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Update existing profiles to have member_since set to their created_at date
UPDATE public.profiles 
SET member_since = created_at 
WHERE member_since IS NULL;
;
