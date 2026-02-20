
-- Create the demo_calendar table
CREATE TABLE public.demo_calendar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  gear_category TEXT NOT NULL CHECK (gear_category IN ('snowboards', 'skis', 'surfboards', 'mountain-bikes')),
  event_date DATE,
  event_time TIME,
  location TEXT,
  equipment_available TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users NOT NULL DEFAULT auth.uid()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.demo_calendar ENABLE ROW LEVEL SECURITY;

-- Create policies for demo_calendar
CREATE POLICY "Anyone can view demo events" 
  ON public.demo_calendar 
  FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create demo events" 
  ON public.demo_calendar 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own demo events" 
  ON public.demo_calendar 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own demo events" 
  ON public.demo_calendar 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = created_by);

-- Create trigger to update updated_at column
CREATE TRIGGER update_demo_calendar_updated_at
  BEFORE UPDATE ON public.demo_calendar
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
;
