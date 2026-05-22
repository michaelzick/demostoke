-- Allow regular signups to succeed by permitting users to insert their own default role
CREATE POLICY "Users can assign themselves default role" ON public.user_roles
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND role = 'user'
);
