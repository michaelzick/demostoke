

## Fix: Paginate Equipment Query to Fetch All Items

### Problem

The Supabase PostgREST server has a `max_rows` default of 1000. The `.limit(5000)` in the client SDK is ignored when it exceeds this server-side cap. With 1104 equipment items, 104 items are silently dropped -- including the Maurice Cole Dirty Dingo and Torq Longboard (Epoxy) from Rider Shack.

### Solution

Replace the single query in `equipmentDataService.ts` with a paginated fetch loop using `.range()`. This fetches data in batches of 1000 until no more rows are returned, then combines all results.

### File to Change

**`src/services/equipment/equipmentDataService.ts`**

Replace the single `.select().eq().eq().limit(5000)` query with a pagination loop:

```text
const PAGE_SIZE = 1000;
let allData = [];
let from = 0;
let hasMore = true;

while (hasMore) {
  const { data, error } = await supabase
    .from("equipment")
    .select(`*, profiles!equipment_user_id_fkey (name, avatar_url)`)
    .eq("status", "available")
    .eq("visible_on_map", true)
    .range(from, from + PAGE_SIZE - 1);

  if (error) throw error;
  allData.push(...(data || []));
  hasMore = (data?.length || 0) === PAGE_SIZE;
  from += PAGE_SIZE;
}
```

The rest of the function (hidden user filtering, image fetching, conversion) remains unchanged -- it just operates on the complete `allData` array instead of the truncated `data`.

### Why Not Change `max_rows` in Supabase?

Changing the PostgREST `max_rows` setting requires access to the Supabase dashboard project settings, and increasing it globally could affect other queries. Pagination in the client code is the safer, more portable fix.

### Impact

- All 1104+ equipment items will now be fetched and displayed
- The 2 missing Rider Shack surfboards (and ~19 other missing surfboards) will appear
- No changes needed to any other files -- only the data fetching logic in `equipmentDataService.ts`

