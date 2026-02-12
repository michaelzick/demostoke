

## Delete User: Cal Coast Adventures (d61dcdcf-f034-4008-83e5-222735e6b2ef)

### Problem
Foreign key constraints prevent deleting this user because child records exist in other tables.

### Records Found

| Table | Records |
|-------|---------|
| user_roles | 1 |
| design_system_profiles | 1 |
| All other tables | 0 |

### Fix

Run a SQL migration to delete the dependent records, then delete the user from `auth.users`:

```sql
-- Step 1: Delete child records
DELETE FROM user_roles WHERE user_id = 'd61dcdcf-f034-4008-83e5-222735e6b2ef';
DELETE FROM design_system_profiles WHERE user_id = 'd61dcdcf-f034-4008-83e5-222735e6b2ef';

-- Step 2: Delete the auth user (this also removes any profile via trigger/cascade)
DELETE FROM auth.users WHERE id = 'd61dcdcf-f034-4008-83e5-222735e6b2ef';
```

### Files Modified

No code changes -- data deletion only (SQL migration).

