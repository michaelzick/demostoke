-- Track external feed origin on equipment rows so sync operations can upsert
-- instead of duplicating records on each run.

ALTER TABLE public.equipment
  ADD COLUMN IF NOT EXISTS external_source_provider text,
  ADD COLUMN IF NOT EXISTS external_source_endpoint_url text,
  ADD COLUMN IF NOT EXISTS external_source_shop_slug text,
  ADD COLUMN IF NOT EXISTS external_source_item_id text,
  ADD COLUMN IF NOT EXISTS external_source_synced_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS idx_equipment_external_source_unique
  ON public.equipment (user_id, external_source_provider, external_source_item_id);

COMMENT ON COLUMN public.equipment.external_source_provider IS
  'External provider identifier (e.g. demostoke_widget) for synced inventory.';

COMMENT ON COLUMN public.equipment.external_source_endpoint_url IS
  'Origin endpoint URL used to sync this equipment row.';

COMMENT ON COLUMN public.equipment.external_source_shop_slug IS
  'External shop slug for synced inventory.';

COMMENT ON COLUMN public.equipment.external_source_item_id IS
  'External provider item id used for idempotent upserts.';

COMMENT ON COLUMN public.equipment.external_source_synced_at IS
  'Timestamp of the most recent successful external sync for this row.';
