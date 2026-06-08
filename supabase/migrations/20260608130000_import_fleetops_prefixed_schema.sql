CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'fleetops_app_role'
  ) THEN
    CREATE TYPE public.fleetops_app_role AS ENUM ('shop', 'admin', 'guest');
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.fleetops_shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  logo_url text,
  website_url text,
  contact_email text,
  contact_phone text,
  location jsonb,
  widget_config jsonb DEFAULT '{}'::jsonb,
  stripe_account_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_fleetops_shops_owner_unique
  ON public.fleetops_shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_fleetops_shops_owner
  ON public.fleetops_shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_fleetops_shops_slug
  ON public.fleetops_shops(slug);

CREATE TABLE IF NOT EXISTS public.fleetops_user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.fleetops_app_role NOT NULL,
  assigned_by uuid,
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_fleetops_user_roles_user_id
  ON public.fleetops_user_roles(user_id);

CREATE TABLE IF NOT EXISTS public.fleetops_shop_viewers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_user_id uuid NOT NULL,
  shop_id uuid NOT NULL REFERENCES public.fleetops_shops(id) ON DELETE CASCADE,
  UNIQUE (viewer_user_id, shop_id)
);

CREATE INDEX IF NOT EXISTS idx_fleetops_shop_viewers_viewer
  ON public.fleetops_shop_viewers(viewer_user_id);

CREATE TABLE IF NOT EXISTS public.fleetops_equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.fleetops_shops(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  subcategory text,
  description text,
  price_per_day numeric(10,2) NOT NULL,
  price_per_hour numeric(10,2),
  price_per_week numeric(10,2),
  damage_deposit numeric(10,2),
  image_url text,
  rating numeric(3,2) DEFAULT 0,
  review_count integer DEFAULT 0,
  status text DEFAULT 'available'::text,
  is_featured boolean DEFAULT false,
  visible boolean DEFAULT true,
  location jsonb,
  specifications jsonb DEFAULT '{}'::jsonb,
  availability jsonb DEFAULT '{"available": true}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fleetops_equipment_category
  ON public.fleetops_equipment(category);
CREATE INDEX IF NOT EXISTS idx_fleetops_equipment_shop
  ON public.fleetops_equipment(shop_id);

CREATE TABLE IF NOT EXISTS public.fleetops_equipment_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid NOT NULL REFERENCES public.fleetops_equipment(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fleetops_equipment_images_equip
  ON public.fleetops_equipment_images(equipment_id);

CREATE TABLE IF NOT EXISTS public.fleetops_pricing_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid NOT NULL REFERENCES public.fleetops_equipment(id) ON DELETE CASCADE,
  duration text NOT NULL,
  price numeric(10,2) NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fleetops_pricing_options_equip
  ON public.fleetops_pricing_options(equipment_id);

CREATE TABLE IF NOT EXISTS public.fleetops_add_ons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.fleetops_shops(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  image_url text,
  price_per_day numeric(10,2) NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fleetops_add_ons_shop
  ON public.fleetops_add_ons(shop_id);

CREATE TABLE IF NOT EXISTS public.fleetops_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.fleetops_shops(id) ON DELETE CASCADE,
  equipment_id uuid NOT NULL REFERENCES public.fleetops_equipment(id),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  num_days integer NOT NULL,
  base_price numeric(10,2) NOT NULL,
  add_ons_price numeric(10,2) DEFAULT 0,
  damage_deposit numeric(10,2) DEFAULT 0,
  service_fee numeric(10,2) DEFAULT 0,
  total_price numeric(10,2) NOT NULL,
  status text DEFAULT 'pending'::text,
  stripe_payment_intent_id text,
  stripe_charge_id text,
  add_ons_snapshot jsonb DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  stripe_refund_id text,
  refunded_at timestamp with time zone
);

CREATE INDEX IF NOT EXISTS idx_fleetops_bookings_dates
  ON public.fleetops_bookings(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_fleetops_bookings_equipment
  ON public.fleetops_bookings(equipment_id);
CREATE INDEX IF NOT EXISTS idx_fleetops_bookings_shop
  ON public.fleetops_bookings(shop_id);

CREATE TABLE IF NOT EXISTS public.fleetops_pos_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.fleetops_shops(id) ON DELETE CASCADE,
  provider text NOT NULL,
  is_connected boolean DEFAULT false,
  credentials jsonb DEFAULT '{}'::jsonb,
  last_sync_at timestamp with time zone,
  field_mapping jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fleetops_pos_connections_shop
  ON public.fleetops_pos_connections(shop_id);

CREATE TABLE IF NOT EXISTS public.fleetops_lightspeed_inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.fleetops_shops(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  pos_connection_id uuid NOT NULL REFERENCES public.fleetops_pos_connections(id) ON DELETE CASCADE,
  mock_shop_id text NOT NULL,
  item_id text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  manufacturer text,
  price numeric(10,2) NOT NULL,
  image_url text NOT NULL,
  location jsonb DEFAULT '{}'::jsonb,
  booking_story text NOT NULL DEFAULT ''::text,
  raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (pos_connection_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_fleetops_lightspeed_inventory_items_mock_shop
  ON public.fleetops_lightspeed_inventory_items(shop_id, mock_shop_id);
CREATE INDEX IF NOT EXISTS idx_fleetops_lightspeed_inventory_items_owner
  ON public.fleetops_lightspeed_inventory_items(owner_id);
CREATE INDEX IF NOT EXISTS idx_fleetops_lightspeed_inventory_items_shop
  ON public.fleetops_lightspeed_inventory_items(shop_id);

CREATE TABLE IF NOT EXISTS public.fleetops_booqable_inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.fleetops_shops(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  pos_connection_id uuid NOT NULL REFERENCES public.fleetops_pos_connections(id) ON DELETE CASCADE,
  mock_shop_id text NOT NULL,
  product_id text NOT NULL,
  name text NOT NULL,
  base_price_in_cents integer NOT NULL,
  photo_url text NOT NULL,
  product_type text NOT NULL DEFAULT 'rental'::text,
  group_name text NOT NULL,
  description text,
  sku text,
  location jsonb DEFAULT '{}'::jsonb,
  booking_story text NOT NULL DEFAULT ''::text,
  raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (pos_connection_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_fleetops_booqable_inventory_items_mock_shop
  ON public.fleetops_booqable_inventory_items(shop_id, mock_shop_id);
CREATE INDEX IF NOT EXISTS idx_fleetops_booqable_inventory_items_owner
  ON public.fleetops_booqable_inventory_items(owner_id);
CREATE INDEX IF NOT EXISTS idx_fleetops_booqable_inventory_items_shop
  ON public.fleetops_booqable_inventory_items(shop_id);

CREATE TABLE IF NOT EXISTS public.fleetops_pos_inventory_seed_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL CHECK (source = ANY (ARRAY['cron'::text, 'manual'::text])),
  status text NOT NULL CHECK (status = ANY (ARRAY['running'::text, 'success'::text, 'error'::text])),
  target_shop_id uuid REFERENCES public.fleetops_shops(id) ON DELETE SET NULL,
  target_owner_id uuid,
  lightspeed_pos_connection_id uuid REFERENCES public.fleetops_pos_connections(id) ON DELETE SET NULL,
  booqable_pos_connection_id uuid REFERENCES public.fleetops_pos_connections(id) ON DELETE SET NULL,
  mock_shop_id text,
  generated_sequence integer NOT NULL,
  lightspeed_item_id text,
  booqable_product_id text,
  lightspeed_inventory_item_id uuid REFERENCES public.fleetops_lightspeed_inventory_items(id) ON DELETE SET NULL,
  booqable_inventory_item_id uuid REFERENCES public.fleetops_booqable_inventory_items(id) ON DELETE SET NULL,
  verification_counts jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_message text,
  raw_result jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_fleetops_pos_inventory_seed_runs_sequence
  ON public.fleetops_pos_inventory_seed_runs(generated_sequence);
CREATE INDEX IF NOT EXISTS idx_fleetops_pos_inventory_seed_runs_status_created
  ON public.fleetops_pos_inventory_seed_runs(status, created_at DESC);

CREATE OR REPLACE FUNCTION public.fleetops_is_admin(
  target_user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT COALESCE(public.is_admin(target_user_id), false)
    OR EXISTS (
      SELECT 1
      FROM public.fleetops_user_roles ur
      WHERE ur.user_id = target_user_id
        AND ur.role = 'admin'::public.fleetops_app_role
    );
$$;

CREATE OR REPLACE FUNCTION public.fleetops_is_shop_viewer(
  target_shop_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.fleetops_shop_viewers sv
    WHERE sv.viewer_user_id = auth.uid()
      AND sv.shop_id = target_shop_id
  );
$$;

CREATE OR REPLACE FUNCTION public.fleetops_set_pos_inventory_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_fleetops_lightspeed_inventory_items_updated_at
  ON public.fleetops_lightspeed_inventory_items;
CREATE TRIGGER set_fleetops_lightspeed_inventory_items_updated_at
BEFORE UPDATE ON public.fleetops_lightspeed_inventory_items
FOR EACH ROW
EXECUTE FUNCTION public.fleetops_set_pos_inventory_updated_at();

DROP TRIGGER IF EXISTS set_fleetops_booqable_inventory_items_updated_at
  ON public.fleetops_booqable_inventory_items;
CREATE TRIGGER set_fleetops_booqable_inventory_items_updated_at
BEFORE UPDATE ON public.fleetops_booqable_inventory_items
FOR EACH ROW
EXECUTE FUNCTION public.fleetops_set_pos_inventory_updated_at();

GRANT EXECUTE ON FUNCTION public.fleetops_is_admin(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fleetops_is_shop_viewer(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fleetops_set_pos_inventory_updated_at() TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fleetops_shops TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fleetops_user_roles TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fleetops_shop_viewers TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fleetops_equipment TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fleetops_equipment_images TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fleetops_pricing_options TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fleetops_add_ons TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fleetops_bookings TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fleetops_pos_connections TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fleetops_lightspeed_inventory_items TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fleetops_booqable_inventory_items TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fleetops_pos_inventory_seed_runs TO authenticated, service_role;

ALTER TABLE public.fleetops_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleetops_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleetops_shop_viewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleetops_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleetops_equipment_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleetops_pricing_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleetops_add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleetops_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleetops_pos_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleetops_lightspeed_inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleetops_booqable_inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleetops_pos_inventory_seed_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "FleetOps admins can view roles" ON public.fleetops_user_roles;
CREATE POLICY "FleetOps admins can view roles"
ON public.fleetops_user_roles
FOR SELECT
USING (auth.uid() = user_id OR public.fleetops_is_admin());

DROP POLICY IF EXISTS "FleetOps admins can manage roles" ON public.fleetops_user_roles;
CREATE POLICY "FleetOps admins can manage roles"
ON public.fleetops_user_roles
FOR ALL
USING (public.fleetops_is_admin())
WITH CHECK (public.fleetops_is_admin());

DROP POLICY IF EXISTS "FleetOps admins can manage shop viewers" ON public.fleetops_shop_viewers;
CREATE POLICY "FleetOps admins can manage shop viewers"
ON public.fleetops_shop_viewers
FOR ALL
USING (public.fleetops_is_admin())
WITH CHECK (public.fleetops_is_admin());

DROP POLICY IF EXISTS "FleetOps viewers can read own viewer rows" ON public.fleetops_shop_viewers;
CREATE POLICY "FleetOps viewers can read own viewer rows"
ON public.fleetops_shop_viewers
FOR SELECT
USING (auth.uid() = viewer_user_id OR public.fleetops_is_admin());

DROP POLICY IF EXISTS "FleetOps shop access" ON public.fleetops_shops;
CREATE POLICY "FleetOps shop access"
ON public.fleetops_shops
FOR SELECT
USING (auth.uid() = owner_id OR public.fleetops_is_shop_viewer(id) OR public.fleetops_is_admin());

DROP POLICY IF EXISTS "FleetOps shop owners can insert shops" ON public.fleetops_shops;
CREATE POLICY "FleetOps shop owners can insert shops"
ON public.fleetops_shops
FOR INSERT
WITH CHECK (auth.uid() = owner_id OR public.fleetops_is_admin());

DROP POLICY IF EXISTS "FleetOps shop owners can update shops" ON public.fleetops_shops;
CREATE POLICY "FleetOps shop owners can update shops"
ON public.fleetops_shops
FOR UPDATE
USING (auth.uid() = owner_id OR public.fleetops_is_admin())
WITH CHECK (auth.uid() = owner_id OR public.fleetops_is_admin());

DROP POLICY IF EXISTS "FleetOps shop scoped add ons access" ON public.fleetops_add_ons;
CREATE POLICY "FleetOps shop scoped add ons access"
ON public.fleetops_add_ons
FOR SELECT
USING (
  shop_id IN (SELECT s.id FROM public.fleetops_shops s WHERE s.owner_id = auth.uid())
  OR shop_id IN (SELECT sv.shop_id FROM public.fleetops_shop_viewers sv WHERE sv.viewer_user_id = auth.uid())
  OR public.fleetops_is_admin()
);

DROP POLICY IF EXISTS "FleetOps shop owners manage add ons" ON public.fleetops_add_ons;
CREATE POLICY "FleetOps shop owners manage add ons"
ON public.fleetops_add_ons
FOR ALL
USING (
  shop_id IN (SELECT s.id FROM public.fleetops_shops s WHERE s.owner_id = auth.uid())
  OR public.fleetops_is_admin()
)
WITH CHECK (
  shop_id IN (SELECT s.id FROM public.fleetops_shops s WHERE s.owner_id = auth.uid())
  OR public.fleetops_is_admin()
);

DROP POLICY IF EXISTS "FleetOps shop scoped equipment access" ON public.fleetops_equipment;
CREATE POLICY "FleetOps shop scoped equipment access"
ON public.fleetops_equipment
FOR SELECT
USING (
  shop_id IN (SELECT s.id FROM public.fleetops_shops s WHERE s.owner_id = auth.uid())
  OR shop_id IN (SELECT sv.shop_id FROM public.fleetops_shop_viewers sv WHERE sv.viewer_user_id = auth.uid())
  OR public.fleetops_is_admin()
);

DROP POLICY IF EXISTS "FleetOps shop owners manage equipment" ON public.fleetops_equipment;
CREATE POLICY "FleetOps shop owners manage equipment"
ON public.fleetops_equipment
FOR ALL
USING (
  shop_id IN (SELECT s.id FROM public.fleetops_shops s WHERE s.owner_id = auth.uid())
  OR public.fleetops_is_admin()
)
WITH CHECK (
  shop_id IN (SELECT s.id FROM public.fleetops_shops s WHERE s.owner_id = auth.uid())
  OR public.fleetops_is_admin()
);

DROP POLICY IF EXISTS "FleetOps shop scoped image access" ON public.fleetops_equipment_images;
CREATE POLICY "FleetOps shop scoped image access"
ON public.fleetops_equipment_images
FOR SELECT
USING (
  equipment_id IN (
    SELECT e.id
    FROM public.fleetops_equipment e
    JOIN public.fleetops_shops s ON s.id = e.shop_id
    WHERE s.owner_id = auth.uid()
  )
  OR equipment_id IN (
    SELECT e.id
    FROM public.fleetops_equipment e
    JOIN public.fleetops_shop_viewers sv ON sv.shop_id = e.shop_id
    WHERE sv.viewer_user_id = auth.uid()
  )
  OR public.fleetops_is_admin()
);

DROP POLICY IF EXISTS "FleetOps shop owners manage images" ON public.fleetops_equipment_images;
CREATE POLICY "FleetOps shop owners manage images"
ON public.fleetops_equipment_images
FOR ALL
USING (
  equipment_id IN (
    SELECT e.id
    FROM public.fleetops_equipment e
    JOIN public.fleetops_shops s ON s.id = e.shop_id
    WHERE s.owner_id = auth.uid()
  )
  OR public.fleetops_is_admin()
)
WITH CHECK (
  equipment_id IN (
    SELECT e.id
    FROM public.fleetops_equipment e
    JOIN public.fleetops_shops s ON s.id = e.shop_id
    WHERE s.owner_id = auth.uid()
  )
  OR public.fleetops_is_admin()
);

DROP POLICY IF EXISTS "FleetOps shop scoped pricing access" ON public.fleetops_pricing_options;
CREATE POLICY "FleetOps shop scoped pricing access"
ON public.fleetops_pricing_options
FOR SELECT
USING (
  equipment_id IN (
    SELECT e.id
    FROM public.fleetops_equipment e
    JOIN public.fleetops_shops s ON s.id = e.shop_id
    WHERE s.owner_id = auth.uid()
  )
  OR equipment_id IN (
    SELECT e.id
    FROM public.fleetops_equipment e
    JOIN public.fleetops_shop_viewers sv ON sv.shop_id = e.shop_id
    WHERE sv.viewer_user_id = auth.uid()
  )
  OR public.fleetops_is_admin()
);

DROP POLICY IF EXISTS "FleetOps shop owners manage pricing" ON public.fleetops_pricing_options;
CREATE POLICY "FleetOps shop owners manage pricing"
ON public.fleetops_pricing_options
FOR ALL
USING (
  equipment_id IN (
    SELECT e.id
    FROM public.fleetops_equipment e
    JOIN public.fleetops_shops s ON s.id = e.shop_id
    WHERE s.owner_id = auth.uid()
  )
  OR public.fleetops_is_admin()
)
WITH CHECK (
  equipment_id IN (
    SELECT e.id
    FROM public.fleetops_equipment e
    JOIN public.fleetops_shops s ON s.id = e.shop_id
    WHERE s.owner_id = auth.uid()
  )
  OR public.fleetops_is_admin()
);

DROP POLICY IF EXISTS "FleetOps shop scoped booking access" ON public.fleetops_bookings;
CREATE POLICY "FleetOps shop scoped booking access"
ON public.fleetops_bookings
FOR SELECT
USING (
  shop_id IN (SELECT s.id FROM public.fleetops_shops s WHERE s.owner_id = auth.uid())
  OR shop_id IN (SELECT sv.shop_id FROM public.fleetops_shop_viewers sv WHERE sv.viewer_user_id = auth.uid())
  OR public.fleetops_is_admin()
);

DROP POLICY IF EXISTS "FleetOps shop owners update bookings" ON public.fleetops_bookings;
CREATE POLICY "FleetOps shop owners update bookings"
ON public.fleetops_bookings
FOR UPDATE
USING (
  shop_id IN (SELECT s.id FROM public.fleetops_shops s WHERE s.owner_id = auth.uid())
  OR public.fleetops_is_admin()
)
WITH CHECK (
  shop_id IN (SELECT s.id FROM public.fleetops_shops s WHERE s.owner_id = auth.uid())
  OR public.fleetops_is_admin()
);

DROP POLICY IF EXISTS "FleetOps shop scoped pos connections access" ON public.fleetops_pos_connections;
CREATE POLICY "FleetOps shop scoped pos connections access"
ON public.fleetops_pos_connections
FOR SELECT
USING (
  shop_id IN (SELECT s.id FROM public.fleetops_shops s WHERE s.owner_id = auth.uid())
  OR shop_id IN (SELECT sv.shop_id FROM public.fleetops_shop_viewers sv WHERE sv.viewer_user_id = auth.uid())
  OR public.fleetops_is_admin()
);

DROP POLICY IF EXISTS "FleetOps shop owners manage pos connections" ON public.fleetops_pos_connections;
CREATE POLICY "FleetOps shop owners manage pos connections"
ON public.fleetops_pos_connections
FOR ALL
USING (
  shop_id IN (SELECT s.id FROM public.fleetops_shops s WHERE s.owner_id = auth.uid())
  OR public.fleetops_is_admin()
)
WITH CHECK (
  shop_id IN (SELECT s.id FROM public.fleetops_shops s WHERE s.owner_id = auth.uid())
  OR public.fleetops_is_admin()
);

DROP POLICY IF EXISTS "FleetOps shop owners view lightspeed inventory items" ON public.fleetops_lightspeed_inventory_items;
CREATE POLICY "FleetOps shop owners view lightspeed inventory items"
ON public.fleetops_lightspeed_inventory_items
FOR SELECT
USING (auth.uid() = owner_id OR public.fleetops_is_admin());

DROP POLICY IF EXISTS "FleetOps shop owners view booqable inventory items" ON public.fleetops_booqable_inventory_items;
CREATE POLICY "FleetOps shop owners view booqable inventory items"
ON public.fleetops_booqable_inventory_items
FOR SELECT
USING (auth.uid() = owner_id OR public.fleetops_is_admin());

DROP POLICY IF EXISTS "FleetOps shop owners view pos inventory seed runs" ON public.fleetops_pos_inventory_seed_runs;
CREATE POLICY "FleetOps shop owners view pos inventory seed runs"
ON public.fleetops_pos_inventory_seed_runs
FOR SELECT
USING (auth.uid() = target_owner_id OR public.fleetops_is_admin());

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('fleetops-equipment-images', 'fleetops-equipment-images', true),
  ('fleetops-shop-logos', 'fleetops-shop-logos', true)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    public = EXCLUDED.public;

DROP POLICY IF EXISTS "FleetOps public read equipment images" ON storage.objects;
CREATE POLICY "FleetOps public read equipment images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'fleetops-equipment-images');

DROP POLICY IF EXISTS "FleetOps public read shop logos" ON storage.objects;
CREATE POLICY "FleetOps public read shop logos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'fleetops-shop-logos');

DROP POLICY IF EXISTS "FleetOps shop owners upload equipment images" ON storage.objects;
CREATE POLICY "FleetOps shop owners upload equipment images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'fleetops-equipment-images'
  AND auth.role() = 'authenticated'
  AND (
    split_part(name, '/', 1) IN (
      SELECT s.id::text
      FROM public.fleetops_shops s
      WHERE s.owner_id = auth.uid()
    )
    OR public.fleetops_is_admin()
  )
);

DROP POLICY IF EXISTS "FleetOps shop owners upload shop logos" ON storage.objects;
CREATE POLICY "FleetOps shop owners upload shop logos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'fleetops-shop-logos'
  AND auth.role() = 'authenticated'
  AND (
    split_part(name, '/', 1) IN (
      SELECT s.id::text
      FROM public.fleetops_shops s
      WHERE s.owner_id = auth.uid()
    )
    OR public.fleetops_is_admin()
  )
);

DO $$
DECLARE
  v_job_id bigint;
BEGIN
  SELECT jobid
  INTO v_job_id
  FROM cron.job
  WHERE jobname = 'fleetops-pos-inventory-seed-2am-pt'
  LIMIT 1;

  IF v_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(v_job_id);
  END IF;
END;
$$;

UPDATE public.fleetops_pos_inventory_seed_config
SET enabled = false,
    fleetops_function_url = 'https://qtlhqsqanbxgfbcjigrl.supabase.co/functions/v1/fleetops-seed-pos-inventory',
    updated_at = now()
WHERE id = true;

DROP FUNCTION IF EXISTS public.trigger_fleetops_pos_inventory_seed_cron(boolean);
