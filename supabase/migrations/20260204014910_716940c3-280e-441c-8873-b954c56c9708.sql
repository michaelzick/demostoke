-- Create function to call edge function on new equipment
CREATE OR REPLACE FUNCTION public.notify_new_equipment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  supabase_url text;
  service_role_key text;
BEGIN
  -- Get the Supabase URL and service role key from environment
  supabase_url := 'https://qtlhqsqanbxgfbcjigrl.supabase.co';
  
  -- Call edge function via pg_net to auto-assign images
  -- The edge function will use service role key internally
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/auto-assign-gear-images',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'equipment_id', NEW.id,
      'equipment_name', NEW.name,
      'category', NEW.category
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new equipment (fires after insert)
DROP TRIGGER IF EXISTS on_equipment_created ON public.equipment;
CREATE TRIGGER on_equipment_created
  AFTER INSERT ON public.equipment
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_equipment();