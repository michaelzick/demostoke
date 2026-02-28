

## Add Owner/Admin Gear Actions to Explore and Search Pages

### What Changes

Add the same visibility toggle, edit, and delete action icons that appear on user profile gear cards to the gear cards on `/explore` and `/search` pages. These actions will only be visible to the gear owner or admins.

### Approach

The two card components involved are:
- **CompactEquipmentCard** -- used in HybridView (hybrid mode on both pages) and already supports `showActions`, `onDelete`, `onVisibilityToggle` props. Just need to wire them up.
- **EquipmentCard** -- used in list mode on both pages. Currently only shows an "Update" button for owners. Needs the same visibility/delete actions added.

### Files to Change

**1. `src/components/EquipmentCard.tsx`**
- Import `Eye`, `EyeOff`, `Trash2` icons and `Separator`
- Import `useDeleteEquipment` and `useUpdateEquipmentVisibility` from `useUserEquipment`
- Add delete handler with confirmation dialog
- Add visibility toggle handler
- Show visibility/edit/delete icon row (matching CompactEquipmentCard style) for owners and admins, below a separator in the card footer

**2. `src/components/HybridView.tsx`**
- Import `useAuth` from auth context, `useIsAdmin` from useUserRole
- Import `useDeleteEquipment` and `useUpdateEquipmentVisibility` from useUserEquipment
- Add delete and visibility toggle handlers with toast notifications
- Pass `showActions`, `isAdmin`, `currentUserId`, `onDelete`, `onVisibilityToggle` props to each `CompactEquipmentCard`

**3. `src/pages/ExplorePage.tsx`** (list view)
- The EquipmentCard already receives `showAdminControls` -- no additional props needed since EquipmentCard will self-manage owner/admin actions internally using its existing `useAuth` and `useIsAdmin` hooks.

**4. `src/pages/SearchResultsPage.tsx`** (list view)
- Same as ExplorePage -- EquipmentCard handles it internally.

### Technical Details

- Both card types already import `useAuth` and `useIsAdmin` -- the owner/admin check logic (`equipment.owner.id === user.id || isAdmin`) is reused
- Delete uses `window.confirm()` for consistency with the existing CompactEquipmentCard pattern
- After delete/visibility mutations succeed, `queryClient.invalidateQueries` in `useUserEquipment` hooks handles cache invalidation; the explore/search pages will need a page-level re-fetch since they use a different data loading approach -- we will trigger a toast and rely on the user refreshing or navigating. Alternatively, we can call the equipment data reload function.
- The action row (eye/edit/trash icons) appears below a separator, matching the existing CompactEquipmentCard design

