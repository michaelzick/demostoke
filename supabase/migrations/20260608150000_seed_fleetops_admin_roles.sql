-- Restore the admin (and shop-owner) roles that the FleetOps source project
-- provided via legacy migrations 00007_secure_roles_admin_checkout_rls.sql and
-- the manual bootstrap_first_admin.sql script.
--
-- The prefixed-schema import (20260608130000_import_fleetops_prefixed_schema.sql)
-- recreated the tables, RLS policies, and helper functions in the main DemoStoke
-- project, but it did NOT carry over ANY public.fleetops_user_roles rows. The
-- companion guest seed (20260608140000_seed_fleetops_guest_viewer.sql) restored
-- only the `guest` role. As a result the main admin account authenticates
-- successfully yet resolves no roles, so AuthContext reports isAdmin = false and
-- canViewShopDashboard = false, and the dashboard ProtectedRoute renders the 404
-- ("not available for this account") page right after login -- the same symptom
-- the guest account hit before its seed was restored.
--
-- AuthContext.fetchRolesForUser reads public.fleetops_user_roles directly (it does
-- not call public.fleetops_is_admin()), so the admin must have an explicit `admin`
-- row in that table for the app to grant admin access. In the source project the
-- demo-shop owner also held the `shop` role (legacy 00007 backfilled `shop` for
-- every shop owner), which is what gave the admin access to the shop dashboard in
-- addition to the admin console. Restoring both roles reproduces the exact
-- pre-migration login experience (lands on "/", full nav).
--
-- This migration is idempotent (ON CONFLICT DO NOTHING) and self-heals even if the
-- admin auth user was recreated with a different id during the data migration,
-- because admin identity is resolved through public.fleetops_is_admin(), which
-- honors both the main DemoStoke is_admin() function and fleetops_user_roles. All
-- statements are safe no-ops when their preconditions are absent.

-- 1. Grant the `admin` role to every user the main DemoStoke project already
--    recognizes as an admin. This is the same source of truth the guest seed
--    relied on (public.fleetops_is_admin(s.owner_id)) when it mapped the guest to
--    the admin-owned demo shop, so it reliably resolves the main admin account
--    without hard-coding an email.
INSERT INTO public.fleetops_user_roles (user_id, role)
SELECT u.id, 'admin'::public.fleetops_app_role
FROM auth.users u
WHERE public.fleetops_is_admin(u.id)
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. Restore the `shop` role for every shop owner, mirroring legacy migration
--    00007_secure_roles_admin_checkout_rls.sql. This re-grants the admin access to
--    the demo shop's dashboard (Equipment, Bookings, etc.) and simultaneously
--    repairs any other shop owners that were locked out by the empty role import.
INSERT INTO public.fleetops_user_roles (user_id, role)
SELECT DISTINCT s.owner_id, 'shop'::public.fleetops_app_role
FROM public.fleetops_shops s
ON CONFLICT (user_id, role) DO NOTHING;
