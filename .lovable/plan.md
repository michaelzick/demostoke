

## Admin Toggle to Hide/Show User and Their Gear Site-Wide

### Overview

Add an `is_hidden` column to the `profiles` table. When an admin toggles a user to "hidden", that user and all their gear disappear from every public-facing area: map, explore, search, featured, trending, recent, and profile pages. The toggle appears on the user profile page only when the viewer is an admin.

### Database Changes

**1. Add `is_hidden` column to `profiles`**

```sql
ALTER TABLE profiles ADD COLUMN is_hidden boolean NOT NULL DEFAULT false;
```

**2. Update `public_profiles` view to exclude hidden users**

Recreate the view with an added `WHERE is_hidden = false` clause. This automatically hides users from:
- `useUserLocations` (map markers on Explore)
- `useUserProfileBySlug` (profile page lookup)
- `useUserProfile` (profile page lookup by ID)

**3. Update `get_trending_equipment` DB function**

Add a JOIN to `profiles` and filter out `is_hidden = true` users so their gear never appears in trending.

### Frontend Query Changes

All equipment queries that join `profiles` need an added filter: `.eq('profiles.is_hidden', false)` (or equivalent). Since Supabase PostgREST doesn't support filtering on joined tables with `.eq()` in all cases, the approach is to filter after fetch or use an inner join pattern.

The most reliable approach: since `equipmentDataService.ts` already joins `profiles`, we add a post-fetch filter. Same for `featuredGearService.ts`, `useRecentEquipment.ts`, and `useTrendingEquipment.ts`.

However, a cleaner database-level approach: **create a `visible_equipment` view** that excludes hidden users' equipment. But this adds complexity. Instead, the simplest reliable approach is:

- **`equipmentDataService.ts`**: Add `.eq('profiles.is_hidden', false)` — since we already use `profiles!equipment_user_id_fkey`, PostgREST can filter on the joined table if we use `!inner` join syntax.
- **`featuredGearService.ts`**: Same approach with `!inner` join.
- **`useRecentEquipment.ts`**: Same approach.
- **`useTrendingEquipment.ts`**: Handled by the updated DB function.
- **`useEquipmentBySlug.ts`**: Add a check — if the owner profile `is_hidden` and the viewer is not admin/owner, return null.
- **`searchService.ts`**: Uses `getEquipmentData()` which flows through `equipmentDataService.ts`, so it's already covered.

### Equipment Query Pattern

Change the join from:
```
profiles!equipment_user_id_fkey (name, avatar_url)
```
to:
```
profiles!inner!equipment_user_id_fkey (name, avatar_url, is_hidden)
```
Then add `.eq('profiles.is_hidden', false)` to the query. The `!inner` keyword ensures rows without a matching profile are excluded, and the `.eq` filter on the joined table filters out hidden users.

### Files to Change

| File | Change |
|------|--------|
| **Database migration** | Add `is_hidden` column, recreate `public_profiles` view with `WHERE NOT is_hidden`, update `get_trending_equipment` function |
| `src/services/equipment/equipmentDataService.ts` | Change profiles join to `!inner`, add `.eq('profiles.is_hidden', false)` |
| `src/services/featuredGearService.ts` | Same inner join + filter on the featured equipment query |
| `src/hooks/useRecentEquipment.ts` | Same inner join + filter |
| `src/hooks/useTrendingEquipment.ts` | The DB function handles it; also add filter on the detail fetch query |
| `src/hooks/useEquipmentBySlug.ts` | Fetch `is_hidden` from profiles join; if hidden and viewer is not admin/owner, return null |
| `src/pages/RealUserProfilePage.tsx` | Add admin visibility toggle UI; import `useIsAdmin`; show toggle when admin is viewing another user's profile |
| `src/hooks/useUserEquipment.ts` | When `visibleOnly = true`, also check that the owner is not hidden (add profiles join) |

### Admin Toggle UI on Profile Page

On `RealUserProfilePage.tsx`, when an admin views any user's profile:

- Show a banner/card at the top with a `Switch` toggle labeled "Visible on Site"
- Current state reads from `profiles.is_hidden` (fetched via direct `profiles` table query for admin)
- Toggling calls `supabase.from('profiles').update({ is_hidden: !currentValue }).eq('id', profileId)`
- Admins already have UPDATE permission on all profiles via the existing RLS policy "Admins can update any profile"
- Show a toast confirming the change
- Invalidate relevant query caches (`userLocations`, `featuredEquipment`, `recentEquipment`, `trendingEquipment`)

### What Gets Hidden When Toggle Is Off

| Area | Mechanism |
|------|-----------|
| Explore map markers | `useUserLocations` queries `public_profiles` view (excludes hidden) |
| Explore list/hybrid | Same as above |
| Search results (gear) | `searchService` -> `equipmentDataService` (inner join filters hidden) |
| Search results (map pins) | `useUserLocations` (excludes hidden) |
| Featured gear (homepage) | `featuredGearService` (inner join filters hidden) |
| Trending gear (homepage) | `get_trending_equipment` DB function (excludes hidden) |
| Recent gear (homepage) | `useRecentEquipment` (inner join filters hidden) |
| User profile page | `useUserProfileBySlug` queries `public_profiles` (excludes hidden) — returns 404 for non-admins |
| Equipment detail page | `useEquipmentBySlug` checks `is_hidden` — returns null for non-admins |
| User's equipment on profile | `useUserEquipment` with `visibleOnly` filters hidden owners |

### Edge Cases

- **Admin viewing hidden profile**: Admin can still see the profile (needs a direct `profiles` table query fallback when `public_profiles` returns null and viewer is admin)
- **Owner viewing own hidden profile**: Owner can still see their own profile (the `isOwnProfile` path uses `useProfileQuery` which queries `profiles` directly)
- **Equipment detail page for hidden user's gear**: Returns 404 for public visitors; admin/owner can still access

