-- Create a security function to prevent privilege escalation attacks
-- This trigger ensures that users cannot modify their own 'role' field to gain unauthorized privileges

CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent changes to the 'role' field by non-admins
  -- Only admins should be able to change user roles (user, admin, moderator)
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    IF NOT public.is_admin(auth.uid()) THEN
      RAISE EXCEPTION 'Only administrators can modify role assignments. Users can only update display_role.';
    END IF;
  END IF;
  
  -- Prevent changes to user_id (this should never be modified after creation)
  IF OLD.user_id IS DISTINCT FROM NEW.user_id THEN
    RAISE EXCEPTION 'Cannot change user_id of a role assignment';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to enforce role update restrictions
-- This fires BEFORE any UPDATE operation on user_roles table
DROP TRIGGER IF EXISTS enforce_role_update_restrictions ON public.user_roles;

CREATE TRIGGER enforce_role_update_restrictions
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_role_escalation();

-- Add helpful comment explaining the security measure
COMMENT ON FUNCTION public.prevent_role_escalation() IS 
'Security function that prevents privilege escalation by blocking non-admin users from modifying the role field in user_roles table. Users can still update display_role for their profile customization.';