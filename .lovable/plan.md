

## Auto-Image Agent for New Gear

### Overview
Build an automated AI agent that detects when new gear is added to the `equipment` table and automatically assigns 3 high-quality images from Google Image Search. The agent will replicate the manual admin workflow of editing gear, searching for images, and saving them.

---

### Build Errors Fix (Required First)

Before implementing the new feature, I need to fix the TypeScript errors in `scan-broken-images/index.ts`:

**Error 1**: Type casting issue at line 257 - The Supabase join returns `equipment` as an array, but the interface expects an object.

**Error 2**: `getImageCountForEquipment` function parameter typing issue.

**Fix**: Remove the explicit type cast and handle the array structure from the Supabase join properly. The equipment field from a foreign key join is returned as an array (even for single relations), so we need to access `equipment[0]` instead of `equipment`.

---

### Phase 1: Database Trigger Detection

**Approach**: Use a PostgreSQL database trigger combined with `pg_net` to call an edge function whenever a new equipment record is inserted.

**SQL Migration**:
```sql
-- Create function to call edge function on new equipment
CREATE OR REPLACE FUNCTION public.notify_new_equipment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only trigger if no images are associated yet
  -- Call edge function via pg_net
  PERFORM net.http_post(
    url := 'https://qtlhqsqanbxgfbcjigrl.supabase.co/functions/v1/auto-assign-gear-images',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
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

-- Create trigger for new equipment
CREATE TRIGGER on_equipment_created
  AFTER INSERT ON public.equipment
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_equipment();
```

---

### Phase 2: Edge Function - auto-assign-gear-images

**File**: `supabase/functions/auto-assign-gear-images/index.ts`

**Workflow**:

1. **Receive Trigger Payload**
   - Equipment ID, name, and category from the database trigger

2. **Check Existing Images**
   - Query `equipment_images` table to verify no images exist yet
   - Skip if images already assigned (prevents duplicates on manual edits)

3. **Search Google Images**
   - Call existing `google-image-search` edge function internally
   - Search query: `"{equipment_name} {category} product"`
   - Request 30 results to have enough candidates

4. **Filter & Validate Images**
   - Filter for HTTPS URLs only (reject http://)
   - Filter for dimensions >= 1000x1000 (use reported width/height from API)
   - Validate URLs are accessible (HEAD request check)
   - Stop after finding 3 valid images

5. **Assign Images to Equipment**
   - Insert into `equipment_images` table with:
     - `equipment_id`: The new gear ID
     - `image_url`: The validated HTTPS URL
     - `display_order`: 0, 1, 2
     - `is_primary`: true for first image only

6. **Logging**
   - Log success/failure to console for debugging
   - Use `log_security_event` RPC for audit trail

**Key Technical Considerations**:

```typescript
// Image filtering logic
const validImages = searchResults.filter(img => {
  // Must be HTTPS
  if (!img.url.startsWith('https://')) return false;
  
  // Must be 1000x1000 or larger
  if (!img.width || !img.height) return false;
  if (img.width < 1000 || img.height < 1000) return false;
  
  return true;
});

// Take only first 3 valid images
const imagesToAssign = validImages.slice(0, 3);
```

---

### Phase 3: Configuration

**File**: `supabase/config.toml`
```toml
[functions.auto-assign-gear-images]
verify_jwt = false  # Called by database trigger, not user
```

---

### Files to Create/Modify

| Action | File |
|--------|------|
| FIX | `supabase/functions/scan-broken-images/index.ts` (type errors) |
| CREATE | `supabase/functions/auto-assign-gear-images/index.ts` |
| MODIFY | `supabase/config.toml` (add function config) |
| MIGRATION | Database trigger for equipment inserts |

---

### Edge Cases Handled

1. **Equipment created with images already** - Check `equipment_images` count before proceeding
2. **No valid images found** - Log warning, equipment remains without images
3. **Google API rate limits** - Already handled by existing function with pagination
4. **Broken image URLs** - Validate with HEAD request before saving
5. **Duplicate runs** - Idempotent check prevents double-assignment
6. **Network timeouts** - Abort controller with 5s timeout on validation

---

### Security Considerations

1. Edge function uses service role key (no user auth needed - triggered by DB)
2. Only processes new inserts, not updates
3. Validates all URLs before database insertion
4. Uses HTTPS-only URLs (HTTP rejected)

---

### Flow Diagram

```text
User/Admin adds gear
        |
        v
Equipment INSERT
        |
        v
DB Trigger fires --> pg_net.http_post()
                            |
                            v
             auto-assign-gear-images function
                            |
                            v
            Check if images already exist
                   |
           [No images] --> Call google-image-search
                                   |
                                   v
                    Filter: HTTPS + 1000x1000+
                                   |
                                   v
                    Validate URLs (HEAD request)
                                   |
                                   v
                    Insert 3 images to equipment_images
                                   |
                                   v
                           Complete
```

