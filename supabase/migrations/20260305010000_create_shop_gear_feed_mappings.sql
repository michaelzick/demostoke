-- Map a local profile (shop owner account) to a demostoke-widget shop gear feed endpoint.
-- This lets DemoStoke load external shop inventory in the same Equipment card shape.

CREATE TABLE IF NOT EXISTS public.shop_gear_feed_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'demostoke_widget',
  endpoint_url text NOT NULL,
  shop_slug text NOT NULL,
  include_hidden boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT shop_gear_feed_mappings_provider_check
    CHECK (provider IN ('demostoke_widget'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_shop_gear_feed_mappings_profile_provider
  ON public.shop_gear_feed_mappings (profile_id, provider);

CREATE INDEX IF NOT EXISTS idx_shop_gear_feed_mappings_is_active
  ON public.shop_gear_feed_mappings (is_active)
  WHERE is_active = true;

ALTER TABLE public.shop_gear_feed_mappings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'shop_gear_feed_mappings'
      AND policyname = 'Public can read active shop gear feed mappings'
  ) THEN
    CREATE POLICY "Public can read active shop gear feed mappings"
      ON public.shop_gear_feed_mappings
      FOR SELECT
      TO anon, authenticated
      USING (is_active = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'shop_gear_feed_mappings'
      AND policyname = 'Users can read own shop gear feed mappings'
  ) THEN
    CREATE POLICY "Users can read own shop gear feed mappings"
      ON public.shop_gear_feed_mappings
      FOR SELECT
      TO authenticated
      USING (profile_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'shop_gear_feed_mappings'
      AND policyname = 'Users can insert own shop gear feed mappings'
  ) THEN
    CREATE POLICY "Users can insert own shop gear feed mappings"
      ON public.shop_gear_feed_mappings
      FOR INSERT
      TO authenticated
      WITH CHECK (profile_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'shop_gear_feed_mappings'
      AND policyname = 'Users can update own shop gear feed mappings'
  ) THEN
    CREATE POLICY "Users can update own shop gear feed mappings"
      ON public.shop_gear_feed_mappings
      FOR UPDATE
      TO authenticated
      USING (profile_id = auth.uid())
      WITH CHECK (profile_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'shop_gear_feed_mappings'
      AND policyname = 'Users can delete own shop gear feed mappings'
  ) THEN
    CREATE POLICY "Users can delete own shop gear feed mappings"
      ON public.shop_gear_feed_mappings
      FOR DELETE
      TO authenticated
      USING (profile_id = auth.uid());
  END IF;
END
$$;

DROP TRIGGER IF EXISTS update_shop_gear_feed_mappings_updated_at ON public.shop_gear_feed_mappings;
CREATE TRIGGER update_shop_gear_feed_mappings_updated_at
  BEFORE UPDATE ON public.shop_gear_feed_mappings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.shop_gear_feed_mappings IS
  'Per-shop mapping to an external demostoke-widget shop-gear-feed endpoint.';

COMMENT ON COLUMN public.shop_gear_feed_mappings.profile_id IS
  'Local DemoStoke profile that should own/display this external feed gear.';

COMMENT ON COLUMN public.shop_gear_feed_mappings.endpoint_url IS
  'Full URL to the demostoke-widget shop-gear-feed endpoint.';

COMMENT ON COLUMN public.shop_gear_feed_mappings.shop_slug IS
  'Widget shop slug passed as the `shop` query parameter.';
