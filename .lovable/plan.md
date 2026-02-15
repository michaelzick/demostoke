

## Update Gear Category Visibility and Validation

### Changes

**1. Show Gear Category for Builder and Retail Store only (`src/components/admin/UserContactFields.tsx`)**
- Change the conditional from `role === 'retail-store'` to `role === 'retail-store' || role === 'builder'`
- Keep it positioned above the About field (per previous plan)

**2. Update validation (`src/hooks/user-creation/useUserCreationValidation.ts`)**
- Require `gearCategory` when role is `'retail-store'` or `'builder'`, but not for `'private-party'`

### Technical Details

| File | Change |
|------|--------|
| `src/components/admin/UserContactFields.tsx` | Render Gear Category when `role === 'retail-store' \|\| role === 'builder'`; move block above About |
| `src/hooks/user-creation/useUserCreationValidation.ts` | Require `gearCategory` for both `retail-store` and `builder` roles |
| `src/hooks/user-creation/useUserCreationForm.ts` | Default `role` to `'retail-store'` |

