

## Two Features: Post-Creation UUID Modal + User Directory Table

### Feature 1: Show UUID Modal After User Creation

After a new user is successfully created, a dialog will appear displaying the new user's UUID with a copy-to-clipboard button. The UUID comes from `authData.user.id` returned by Supabase during signup.

**Changes:**
- **`src/hooks/user-creation/useUserCreationSubmission.ts`** -- Change `createUser` to return the new user's UUID string (or `null` on failure) instead of `void`.
- **`src/hooks/user-creation/index.ts`** -- Update `createUser` wrapper to capture and return the UUID from submission.
- **`src/components/admin/ManualUserCreationSection.tsx`** -- Add state for `createdUserId`. After `createUser()` resolves, set it. Render a Dialog that shows the UUID in a read-only input with a "Copy" button. Dialog dismissal clears the state.

### Feature 2: Searchable User Directory Table

A new card in the User Management tab showing all profiles in a sortable, searchable table with Name and UUID columns.

**Changes:**
- **New file: `src/components/admin/UserDirectorySection.tsx`** -- A Card component that:
  - Fetches all rows from `profiles` table (id, name)
  - Provides a search input filtering by name
  - Displays a table with two columns: **Name** (sortable A-Z / Z-A) and **UUID** (with a copy-to-clipboard icon button)
  - Uses existing UI components (Card, Input, Table, Button)
- **`src/pages/AdminPage.tsx`** -- Import and render `UserDirectorySection` in the "users" tab content, below `UserManagementSection`.

### Technical Details

| File | Change |
|------|--------|
| `src/hooks/user-creation/useUserCreationSubmission.ts` | Return `string \| null` (user UUID) from `createUser` |
| `src/hooks/user-creation/index.ts` | Propagate returned UUID |
| `src/components/admin/ManualUserCreationSection.tsx` | Add UUID modal dialog with copy button |
| `src/components/admin/UserDirectorySection.tsx` | New component: searchable, sortable profiles table with copy UUID |
| `src/pages/AdminPage.tsx` | Add `UserDirectorySection` to users tab |

