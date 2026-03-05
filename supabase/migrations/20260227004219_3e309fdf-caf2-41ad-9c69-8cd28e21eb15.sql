CREATE OR REPLACE FUNCTION public.notify_new_equipment()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  -- Auto-image agent disabled (kept for future re-enablement)
  RETURN NEW;
END;
$$;