

## Filter HTTPS-Only Images from Google Image Search

### Problem
The Google Custom Search API doesn't have a native parameter to restrict results to HTTPS-only URLs. Currently, HTTP images can appear in search results, which poses security concerns and may cause mixed content warnings.

### Solution
Filter out HTTP URLs at the edge function level before returning results to the frontend. This ensures HTTP images never appear in the admin image selection modal.

---

### Technical Changes

**File: `supabase/functions/google-image-search/index.ts`**

Add HTTPS filtering after fetching results from Google API:

```typescript
// After mapping the results from Google API, filter for HTTPS only
const httpsResults = results.filter(result => 
  result.url.startsWith('https://') && 
  result.thumbnail.startsWith('https://')
);
```

The filter will be applied before returning results, ensuring:
- Main image URL must be HTTPS
- Thumbnail URL must also be HTTPS
- Both conditions must be met for an image to be included

---

### Implementation Details

**Location**: Lines 75-84 in `google-image-search/index.ts`

**Current code**:
```typescript
results.push(
  ...(data.items || []).map((item: any) => ({
    url: item.link,
    thumbnail: item.image?.thumbnailLink || item.link,
    title: item.title,
    source: item.displayLink || 'Unknown',
    width: item.image?.width,
    height: item.image?.height,
  }))
);
```

**Updated code**:
```typescript
const pageResults = (data.items || []).map((item: any) => ({
  url: item.link,
  thumbnail: item.image?.thumbnailLink || item.link,
  title: item.title,
  source: item.displayLink || 'Unknown',
  width: item.image?.width,
  height: item.image?.height,
}));

// Filter for HTTPS-only URLs (both main image and thumbnail)
const httpsResults = pageResults.filter((result: SearchResult) => 
  result.url.startsWith('https://') && 
  result.thumbnail.startsWith('https://')
);

results.push(...httpsResults);
```

---

### Files Modified

| Action | File |
|--------|------|
| MODIFY | `supabase/functions/google-image-search/index.ts` |

---

### Benefits

1. **Security**: Only secure HTTPS images are returned
2. **No mixed content warnings**: Prevents browser security warnings
3. **Consistent with auto-assign agent**: Matches the same HTTPS-only criteria used by the auto-image agent
4. **Single source of truth**: Filtering at API level means all consumers get HTTPS-only results

---

### Edge Cases Handled

- If an image URL is HTTPS but thumbnail is HTTP, the image is excluded
- If all results are HTTP, an empty array is returned (existing "No Images Found" toast will display)
- The filter is applied per-page during pagination to maintain accurate counts

