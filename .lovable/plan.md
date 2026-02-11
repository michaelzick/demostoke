

## Fix Broken Avatar URL for Degree 33 Surfboards

### Problem
The profile for user `99cb20fa-1cac-4b87-802b-5375386d7d21` (Degree 33 Surfboards) has a broken avatar URL pointing to a non-existent file in storage (`profile-images/60a077c1-.../profile-1752637620038.png`). This user was created before the category assets feature was implemented.

### Investigation Results

| Item | Status | Details |
|------|--------|---------|
| Equipment | Working | 12 items exist and display correctly on the profile page |
| Hero image | Working | Unsplash surfboard hero image displays correctly |
| Avatar | Broken | URL points to non-existent file in storage, shows fallback "D" letter |
| About | Working | Full about text present in DB and displays in sidebar |
| Phone | Working | (800) 920-2363 present in DB |
| Address | Working | Carlsbad, CA address present in DB with geocoded coordinates |
| Website | Working | degree33surfboards.com present in DB |

### Fix

Run a single SQL update to set the correct surfboard category avatar URL:

```sql
UPDATE profiles 
SET avatar_url = 'https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/profile-images/73de4049-7ffd-45cd-868b-c2d0076107b3/profile-1752863282257.png'
WHERE id = '99cb20fa-1cac-4b87-802b-5375386d7d21';
```

This sets the avatar to the same surfboard category avatar used by the new user creation form.

### Files Modified

No code changes needed -- this is a data fix only (SQL migration).

