-- Create missing design_system_profiles entries for existing users
INSERT INTO public.design_system_profiles (user_id, display_name, avatar_url)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', au.email) as display_name,
  'https://api.dicebear.com/6.x/avataaars/svg?seed=' || au.id as avatar_url
FROM auth.users au
LEFT JOIN public.design_system_profiles dsp ON au.id = dsp.user_id
WHERE dsp.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;;
