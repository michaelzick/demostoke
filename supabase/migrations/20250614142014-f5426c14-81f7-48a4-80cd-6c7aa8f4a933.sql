
-- Enable RLS on profiles table if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies that don't already exist
DO $$
BEGIN
    -- Allow users to insert their own profile
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile') THEN
        CREATE POLICY "Users can insert their own profile" 
          ON public.profiles 
          FOR INSERT 
          WITH CHECK (auth.uid() = id);
    END IF;

    -- Allow users to update their own profile
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
        CREATE POLICY "Users can update their own profile" 
          ON public.profiles 
          FOR UPDATE 
          USING (auth.uid() = id);
    END IF;

    -- Allow public read access to profiles (for viewing other users' public profiles)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public can view profiles') THEN
        CREATE POLICY "Public can view profiles" 
          ON public.profiles 
          FOR SELECT 
          TO anon, authenticated 
          USING (true);
    END IF;
END $$;
