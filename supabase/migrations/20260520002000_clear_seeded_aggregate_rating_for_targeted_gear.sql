-- Clear seeded aggregate rating fields for targeted pages.
-- Use this after removing synthetic review metadata so unrated items
-- can remain as authentic zero-review products while SEO can apply
-- a zero-review aggregateRating fallback in metadata rendering.
UPDATE equipment
SET
  rating = 0,
  review_count = 0
WHERE id IN (
  'ca05cd1a-fdb2-4907-b0b3-8e8bf4ea759a',
  'eae3273e-fd61-4e44-82f4-7b80ac6eff79'
)
  AND (rating > 0 OR review_count > 0);
