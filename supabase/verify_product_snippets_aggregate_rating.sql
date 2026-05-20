-- Verify targeted gear rows have truthful zero-review metadata.
SELECT
  id,
  name,
  rating,
  review_count,
  updated_at
FROM public.equipment
WHERE id IN (
  'ca05cd1a-fdb2-4907-b0b3-8e8bf4ea759a',
  'eae3273e-fd61-4e44-82f4-7b80ac6eff79'
)
ORDER BY id;

-- Verify no synthetic review rows exist for the same items.
SELECT
  e.id AS equipment_id,
  COUNT(er.id) AS review_rows
FROM public.equipment e
LEFT JOIN public.equipment_reviews er
  ON er.equipment_id = e.id
WHERE e.id IN (
  'ca05cd1a-fdb2-4907-b0b3-8e8bf4ea759a',
  'eae3273e-fd61-4e44-82f4-7b80ac6eff79'
)
GROUP BY e.id
ORDER BY e.id;
