

## Disable Auto-Image Agent (Without Deleting)

### How It Works Today

A PostgreSQL trigger (`on_equipment_created`) fires on every `INSERT` into the `equipment` table. It calls the `notify_new_equipment()` function, which sends an HTTP request to the `auto-assign-gear-images` edge function. That function searches Google Images and inserts up to 3 images into `equipment_images`.

### Plan

**Single database migration** -- make the trigger function a no-op by replacing its body with an early `RETURN NEW`. This keeps the trigger, the function, and the edge function all intact so they can be re-enabled later, but no HTTP call is made when gear is created.

```sql
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
```

No frontend code changes needed. The edge function `auto-assign-gear-images` remains deployed but will simply never be called by the trigger.

### Files Changed

| File | Change |
|------|--------|
| Database migration | Replace `notify_new_equipment()` body with a no-op |

