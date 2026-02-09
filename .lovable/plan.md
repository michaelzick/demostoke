

## Updated Plan: About Field + Required Category for Retail Stores

### Overview
Add an optional "About" field to the manual user creation form. When the role is "retail-store", show a required gear category dropdown. The form cannot be submitted until a category is selected for retail store users. Also fix the existing build errors.

---

### Changes

#### 1. Fix Build Errors (`supabase/functions/scan-broken-images/index.ts`)

- **Line 257**: Remove `as ImageRecord[]` cast. Update the `ImageRecord` interface so `equipment` is `{ id: string; name: string; category: string; user_id: string; }[] | null` (array, matching the Supabase join return type). Access `equipment[0]` when reading joined data.
- **Line 139**: Change `supabase` parameter type to `any` in `getImageCountForEquipment`.

#### 2. Add `about` and `gearCategory` to UserFormData (`src/hooks/user-creation/types.ts`)

```typescript
export interface UserFormData {
  // ...existing fields
  about: string;
  gearCategory: string; // '' | 'surfboards' | 'snowboards' | 'skis' | 'mountain-bikes'
}
```

#### 3. Update Form State (`src/hooks/user-creation/useUserCreationForm.ts`)

Add `about: ''` and `gearCategory: ''` to initial state and reset.

#### 4. Update Validation (`src/hooks/user-creation/useUserCreationValidation.ts`)

Add conditional validation: if `formData.role === 'retail-store'`, require `formData.gearCategory` to be non-empty.

```typescript
const isFormValid = useMemo((): boolean => {
  const baseValid = !!(formData.name && formData.email && 
    formData.password && formData.password.length >= 6 && 
    formData.role && captchaToken);
  
  if (formData.role === 'retail-store') {
    return baseValid && !!formData.gearCategory;
  }
  return baseValid;
}, [formData.name, formData.email, formData.password, formData.role, formData.gearCategory, captchaToken]);
```

#### 5. Update Submission (`src/hooks/user-creation/useUserCreationSubmission.ts`)

- Include `about` in the profile data.
- When `formData.role === 'retail-store'` and `gearCategory` is set, include `avatar_url` and `hero_image_url` from this static mapping:

| Category | Avatar URL | Hero Image URL |
|----------|-----------|---------------|
| Surfboards | `.../73de4049-.../profile-1752863282257.png` | `unsplash/photo-1502680390469-...` |
| Snowboards | `.../c5b450a8-.../profile-1752636842828.png` | `unsplash/photo-1590461283969-...` |
| Skis | `.../7ef925ac-.../profile-1769637319540.png` | `unsplash/photo-1509791413599-...` |
| Mountain Bikes | `.../ad2ad153-.../profile-1752637760487.png` | `unsplash/photo-1506316940527-...` |

#### 6. Update Contact Fields Component (`src/components/admin/UserContactFields.tsx`)

- Add `about`, `gearCategory`, and `role` to props.
- Add a Textarea for the optional "About" field.
- Conditionally render a gear category Select dropdown (with a required indicator) when role is `retail-store`. Options: Surfboards, Snowboards, Skis, Mountain Bikes.

#### 7. Update ManualUserCreationSection (`src/components/admin/ManualUserCreationSection.tsx`)

Pass `formData.role` to `UserContactFields` so it can conditionally show the category dropdown.

---

### Files Modified

| Action | File |
|--------|------|
| FIX | `supabase/functions/scan-broken-images/index.ts` |
| MODIFY | `src/hooks/user-creation/types.ts` |
| MODIFY | `src/hooks/user-creation/useUserCreationForm.ts` |
| MODIFY | `src/hooks/user-creation/useUserCreationValidation.ts` |
| MODIFY | `src/hooks/user-creation/useUserCreationSubmission.ts` |
| MODIFY | `src/components/admin/UserContactFields.tsx` |
| MODIFY | `src/components/admin/ManualUserCreationSection.tsx` |

---

### Edge Cases

1. **Role changes after category selection**: If admin selects a category then switches role away from "retail-store", the `gearCategory` value persists in state but is ignored during submission and validation (only enforced when role is retail-store).
2. **Role changes to retail-store**: Form becomes invalid until a category is selected, preventing premature submission.
3. **No category selected for retail-store**: Submit button stays disabled and a validation toast fires if somehow triggered.
4. **About field**: Always optional, works for all roles.
5. **Category cleared on reset**: Both `about` and `gearCategory` reset to empty string when form resets after successful creation.

