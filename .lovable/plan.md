

## Codebase Cleanup Plan (Revised)

### Phase 1: Database Cleanup

**1.1 Remove orphaned function**
Drop the `refresh_performance_views()` function that references non-existent materialized views (`mv_trending_equipment`, `mv_equipment_stats`).

**1.2 Evaluate equipment_views table**
The `equipment_views` table has 0 rows. View tracking now uses the denormalized `view_count` column on the `equipment` table directly. Options:
- Remove the table if detailed view analytics are not needed
- Keep if planning to add "who viewed what, when" analytics later

---

### Phase 2: Edge Function Cleanup

**Delete `supabase/functions/scrape-gear-from-url/`**
- This function is superseded by `extract-gear-from-html` which the admin UI uses
- The `rental-discovery-agent` also has its own inline scraping
- No frontend code calls this function

---

### Phase 3: Component Cleanup

**3.1 Delete duplicate CustomerWaiverForm**
Remove `src/components/CustomerWaiverForm.tsx` (253 lines)
- The active version is at `src/components/waiver/CustomerWaiverForm.tsx`
- All imports use the waiver/ directory version

**3.2 Delete unused UI components**
| Component | Lines | Status |
|-----------|-------|--------|
| `src/components/ui/menubar.tsx` | ~200 | No imports found in codebase |
| `src/components/ui/context-menu.tsx` | ~200 | No imports found in codebase |
| `src/components/ui/toggle-group.tsx` | ~60 | No imports found in codebase |

---

### Phase 4: Dependency Cleanup

**Remove unused npm packages from package.json:**

| Package | Reason |
|---------|--------|
| `playwright` | No test files exist in the project |
| `rehype-sanitize` | Project uses `dompurify` instead |
| `@types/dompurify` | DOMPurify v3 has built-in TypeScript types |
| `caniuse-lite` | Should be a transitive dependency, not explicit |
| `@radix-ui/react-menubar` | UI component not used |
| `@radix-ui/react-context-menu` | UI component not used |
| `@radix-ui/react-toggle-group` | UI component not used |

---

### Summary

| Category | Items | Estimated Lines Removed |
|----------|-------|------------------------|
| Database | 1 orphaned function | - |
| Edge Functions | 1 superseded function | ~145 lines |
| Components | 4 unused files | ~700 lines |
| Dependencies | 7 npm packages | Smaller bundle size |

**Total cleanup: ~845 lines of dead code removed, 7 unused dependencies removed**

