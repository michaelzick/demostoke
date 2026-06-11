-- Restore the guest viewer access that the FleetOps source project provided in
-- legacy migration 00009_guest_viewer_seed.sql.
--
-- The prefixed-schema import (20260608130000_import_fleetops_prefixed_schema.sql)
-- recreated the tables, RLS policies, and helper functions in the main DemoStoke
-- project, but it did NOT carry over the guest role and shop-viewer rows. As a
-- result, the guest@demostoke.com account authenticates successfully yet resolves
-- no `guest` role and no shop, so AuthContext reports canViewShopDashboard = false
-- and the dashboard ProtectedRoute renders the 404 ("not available for this
-- account") page right after login.
--
-- This migration is idempotent (ON CONFLICT DO NOTHING) and is keyed off the
-- guest account's email rather than a hard-coded id, so it self-heals even if the
-- guest auth user was recreated with a different id during the data migration.
--
-- The guest@demostoke.com auth user must already exist in the main project's
-- Supabase Auth. If it does not, both statements are safe no-ops.

-- 1. Grant the read-only guest role.
INSERT INTO public.fleetops_user_roles (user_id, role)
SELECT u.id, 'guest'::public.fleetops_app_role
FROM auth.users u
WHERE u.email = 'guest@demostoke.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. Map the guest to every admin-owned shop (the FleetOps demo shop). Admin
--    identity is resolved through public.fleetops_is_admin(), which honors both
--    the main DemoStoke is_admin() function and fleetops_user_roles, so the
--    mapping works regardless of how the admin was provisioned in the main
--    project.
INSERT INTO public.fleetops_shop_viewers (viewer_user_id, shop_id)
SELECT u.id, s.id
FROM auth.users u
CROSS JOIN public.fleetops_shops s
WHERE u.email = 'guest@demostoke.com'
  AND public.fleetops_is_admin(s.owner_id)
ON CONFLICT (viewer_user_id, shop_id) DO NOTHING;
