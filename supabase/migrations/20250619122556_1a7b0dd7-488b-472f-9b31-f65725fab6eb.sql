
-- Check the current structure of the profiles table
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if there are any triggers on the profiles table
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles' AND event_object_schema = 'public';

-- Check for any constraints (simplified query)
SELECT tc.constraint_name, tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_name = 'profiles' AND tc.table_schema = 'public';
;
