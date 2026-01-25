

## Codebase Cleanup Execution Plan (Revised)

### Overview
This plan removes ~590 lines of dead code and 7 unused npm dependencies to reduce maintenance burden and bundle size.

---

### Phase 1: Database Cleanup

**1.1 Remove orphaned function**
Execute SQL migration to drop `refresh_performance_views()` which references non-existent materialized views.

```sql
DROP FUNCTION IF EXISTS public.refresh_performance_views();
```

**1.2 Keep equipment_views table** (for now)
- Table has 0 rows but RLS policies are in place
- Keep for potential future analytics use
- Can be removed later if detailed view tracking is not needed

---

### Phase 2: Edge Function Cleanup

**Delete `supabase/functions/scrape-gear-from-url/` directory**
- File: `supabase/functions/scrape-gear-from-url/index.ts` (~145 lines)
- This function is superseded by `extract-gear-from-html` 
- The `rental-discovery-agent` has its own inline scraping
- No frontend code calls this function

---

### Phase 3: Component Cleanup

**Delete unused UI components only**

| File | Lines |
|------|-------|
| `src/components/ui/menubar.tsx` | ~235 |
| `src/components/ui/context-menu.tsx` | ~199 |
| `src/components/ui/toggle-group.tsx` | ~60 |

**KEEP**: `src/components/CustomerWaiverForm.tsx` (per user request)

---

### Phase 4: Dependency Cleanup

**Remove from package.json:**

| Package | Reason |
|---------|--------|
| `playwright` | No test files exist in the project |
| `rehype-sanitize` | Project uses `dompurify` instead |
| `@types/dompurify` | DOMPurify v3 has built-in types |
| `caniuse-lite` | Should be transitive, not explicit |
| `@radix-ui/react-menubar` | UI component being deleted |
| `@radix-ui/react-context-menu` | UI component being deleted |
| `@radix-ui/react-toggle-group` | UI component being deleted |

---

### Files Changed Summary

| Action | File |
|--------|------|
| DELETE | `supabase/functions/scrape-gear-from-url/index.ts` |
| DELETE | `src/components/ui/menubar.tsx` |
| DELETE | `src/components/ui/context-menu.tsx` |
| DELETE | `src/components/ui/toggle-group.tsx` |
| MODIFY | `package.json` (remove 7 dependencies) |
| SQL | Drop `refresh_performance_views()` function |

### Impact
- **~590 lines of code removed**
- **7 npm packages removed** (smaller bundle, fewer security surface)
- **1 orphaned database function removed**
- **Zero breaking changes** (all removed code is unused)

