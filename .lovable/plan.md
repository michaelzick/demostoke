

## Broken Image URL Scanner - Admin Utility

### Overview
Create an edge function and admin component to find and remove broken gear image URLs from the database. The utility will scan all `equipment_images` records, test each URL for accessibility, and allow admins to delete broken URLs individually or in batch.

---

### Phase 1: Edge Function

**File: `supabase/functions/scan-broken-images/index.ts`**

Create an edge function that:
1. Requires admin authentication (using the existing `is_admin()` RPC pattern from `convert-image-to-webp`)
2. Fetches all records from `equipment_images` joined with `equipment` and `profiles`
3. Tests each image URL for multiple failure conditions:
   - HTTP 404/403/500 errors
   - Connection timeouts (5 second limit)
   - SSL/TLS errors
   - CORS/redirect failures
   - Invalid content-type (not an image)
   - Empty responses
4. Returns a list of broken URLs with gear details

**Edge Cases Handled:**
- Rate limiting from external servers (retry with backoff)
- URLs with special characters (proper encoding)
- Relative URLs (skip as they're internal)
- Already-deleted equipment (orphaned images)

**Configuration in `supabase/config.toml`:**
```toml
[functions.scan-broken-images]
verify_jwt = false
```

---

### Phase 2: Admin Component

**File: `src/components/admin/BrokenImageScannerSection.tsx`**

UI Component featuring:

1. **Scan Button** with progress indicator
   - Shows "Scanning X of Y images..." during scan
   - Progress bar showing percentage complete

2. **Results Table** with columns:
   | Column | Description |
   |--------|-------------|
   | Gear Name | Clickable link opening detail page in new tab |
   | Category | Badge showing gear category |
   | Broken URL | Clickable link opening URL in new tab |
   | Total Images | Count of all images for this gear item |
   | Error Reason | Why the URL is broken |
   | Actions | Trash icon to delete individual URL |

3. **Batch Actions**
   - "Delete All Broken URLs" button with confirmation dialog
   - Shows progress during batch deletion

4. **Admin-Only Access**
   - Uses `useIsAdmin()` hook to verify admin status
   - Shows "Access Denied" if not admin

---

### Phase 3: Integration

**File: `src/pages/AdminPage.tsx`**

Add the new component to the Tools tab:
```typescript
import BrokenImageScannerSection from "@/components/admin/BrokenImageScannerSection";

// In TabsContent value="tools"
<BrokenImageScannerSection />
```

---

### Technical Implementation Details

**Edge Function Structure:**
```typescript
// scan-broken-images/index.ts
serve(async (req) => {
  // 1. CORS preflight handling
  // 2. Admin authentication check via is_admin() RPC
  // 3. Fetch all equipment_images with joined data
  // 4. Test each URL in parallel batches (10 at a time to avoid overload)
  // 5. Return broken URLs with details
});
```

**URL Testing Logic:**
```typescript
async function testImageUrl(url: string): Promise<{ broken: boolean; reason: string }> {
  // Skip internal/relative URLs
  if (url.startsWith('/') || url.includes('supabase.co/storage')) {
    return { broken: false, reason: '' };
  }
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      method: 'HEAD', // Only fetch headers, not full image
      signal: controller.signal,
      headers: { 'User-Agent': 'DemoStoke-ImageChecker/1.0' }
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      return { broken: true, reason: `HTTP ${response.status}` };
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.startsWith('image/')) {
      return { broken: true, reason: 'Not an image' };
    }
    
    return { broken: false, reason: '' };
  } catch (error) {
    return { broken: true, reason: error.message || 'Connection failed' };
  }
}
```

**Component State Management:**
```typescript
interface BrokenImage {
  imageId: string;
  imageUrl: string;
  equipmentId: string;
  gearName: string;
  category: string;
  ownerName: string;
  totalImages: number;
  errorReason: string;
}

const [isScanning, setIsScanning] = useState(false);
const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 });
const [brokenImages, setBrokenImages] = useState<BrokenImage[]>([]);
const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
const [isDeletingAll, setIsDeletingAll] = useState(false);
```

---

### Files Created/Modified

| Action | File |
|--------|------|
| CREATE | `supabase/functions/scan-broken-images/index.ts` |
| CREATE | `src/components/admin/BrokenImageScannerSection.tsx` |
| MODIFY | `supabase/config.toml` (add function config) |
| MODIFY | `src/pages/AdminPage.tsx` (add component import + usage) |

---

### Error Handling

1. **Network Errors**: Caught and displayed with specific error messages
2. **Auth Errors**: 401/403 responses handled gracefully with toast notification
3. **Partial Failures**: If some URLs fail to delete, show which ones succeeded/failed
4. **Edge Function Timeout**: Batch processing with chunked responses if needed

---

### Security Considerations

1. Admin-only access enforced at both:
   - Edge function level (via `is_admin()` RPC)
   - Frontend level (via `useIsAdmin()` hook)
2. Only deletes from `equipment_images` table (no storage deletion needed for external URLs)
3. Audit logging for all deletions via existing `log_security_event` function

