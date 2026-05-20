-- Fix product snippet metadata and Walden Surfboards primary image sources.
-- Update requested item names and last-verified timestamps used by metadata/snippets.
UPDATE equipment
SET
  name = 'Atomic Maverick 88 CTI Skis, Boots, Poles; Adult; multiple lengths available',
  updated_at = '2026-05-19T00:00:00Z'
WHERE id = 'ca05cd1a-fdb2-4907-b0b3-8e8bf4ea759a';

UPDATE equipment
SET
  name = $$South Bay Board Co. Ruccus 7’0″, 7'6"$$,
  updated_at = '2026-05-19T00:00:00Z'
WHERE id = 'eae3273e-fd61-4e44-82f4-7b80ac6eff79';

UPDATE equipment_images
SET
  image_url = 'https://images.pexels.com/photos/2370006/pexels-photo-2370006.jpeg',
  is_primary = TRUE
WHERE equipment_id IN (
  '20b8c12b-28e6-4f5a-9116-32b5ec9ddc9c',
  'c30503f3-593e-4304-b3aa-449a67db1b96',
  '5209dff2-b8c1-4c90-b9ca-bd3ab839de64',
  'f909424e-8b99-452a-97ab-9324858c27a3'
)
  AND display_order = 0
  AND is_primary = TRUE;
