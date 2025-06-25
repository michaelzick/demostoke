
-- Consolidate Firewire Seaside models (5 items → 1)
UPDATE equipment 
SET size = '5''4", 5''7", 5''8", 5''9", 5''11"',
    description = COALESCE(NULLIF(description, ''), 'High-performance surfboard with multiple size options'),
    updated_at = now()
WHERE name = 'Firewire Seaside' 
  AND user_id = (SELECT id FROM profiles WHERE name = 'Huntington Surf and Sport')
  AND id = (
    SELECT id FROM equipment 
    WHERE name = 'Firewire Seaside' 
      AND user_id = (SELECT id FROM profiles WHERE name = 'Huntington Surf and Sport')
    ORDER BY created_at ASC 
    LIMIT 1
  );

-- Delete duplicate Firewire Seaside items
DELETE FROM equipment 
WHERE name = 'Firewire Seaside' 
  AND user_id = (SELECT id FROM profiles WHERE name = 'Huntington Surf and Sport')
  AND id != (
    SELECT id FROM equipment 
    WHERE name = 'Firewire Seaside' 
      AND user_id = (SELECT id FROM profiles WHERE name = 'Huntington Surf and Sport')
    ORDER BY created_at ASC 
    LIMIT 1
  );

-- Consolidate Firewire Sweet Potato models (4 items → 1)
UPDATE equipment 
SET size = '5''2", 5''6", 5''8", 6''0"',
    description = COALESCE(NULLIF(description, ''), 'High-performance surfboard with multiple size options'),
    updated_at = now()
WHERE name = 'Firewire Sweet Potato' 
  AND user_id = (SELECT id FROM profiles WHERE name = 'Huntington Surf and Sport')
  AND id = (
    SELECT id FROM equipment 
    WHERE name = 'Firewire Sweet Potato' 
      AND user_id = (SELECT id FROM profiles WHERE name = 'Huntington Surf and Sport')
    ORDER BY created_at ASC 
    LIMIT 1
  );

-- Delete duplicate Firewire Sweet Potato items
DELETE FROM equipment 
WHERE name = 'Firewire Sweet Potato' 
  AND user_id = (SELECT id FROM profiles WHERE name = 'Huntington Surf and Sport')
  AND id != (
    SELECT id FROM equipment 
    WHERE name = 'Firewire Sweet Potato' 
      AND user_id = (SELECT id FROM profiles WHERE name = 'Huntington Surf and Sport')
    ORDER BY created_at ASC 
    LIMIT 1
  );

-- Consolidate Firewire Boss Up models (3 items → 1)
UPDATE equipment 
SET size = '6''6", 6''8", 7''0"',
    description = COALESCE(NULLIF(description, ''), 'High-performance surfboard with multiple size options'),
    updated_at = now()
WHERE name = 'Firewire Boss Up' 
  AND user_id = (SELECT id FROM profiles WHERE name = 'Huntington Surf and Sport')
  AND id = (
    SELECT id FROM equipment 
    WHERE name = 'Firewire Boss Up' 
      AND user_id = (SELECT id FROM profiles WHERE name = 'Huntington Surf and Sport')
    ORDER BY created_at ASC 
    LIMIT 1
  );

-- Delete duplicate Firewire Boss Up items
DELETE FROM equipment 
WHERE name = 'Firewire Boss Up' 
  AND user_id = (SELECT id FROM profiles WHERE name = 'Huntington Surf and Sport')
  AND id != (
    SELECT id FROM equipment 
    WHERE name = 'Firewire Boss Up' 
      AND user_id = (SELECT id FROM profiles WHERE name = 'Huntington Surf and Sport')
    ORDER BY created_at ASC 
    LIMIT 1
  );

-- Consolidate Firewire Dominator 2.0 models (3 items → 1)
UPDATE equipment 
SET size = '6''1", 6''6", 6''8"',
    description = COALESCE(NULLIF(description, ''), 'High-performance surfboard with multiple size options'),
    updated_at = now()
WHERE name = 'Firewire Dominator 2.0' 
  AND user_id = (SELECT id FROM profiles WHERE name = 'Huntington Surf and Sport')
  AND id = (
    SELECT id FROM equipment 
    WHERE name = 'Firewire Dominator 2.0' 
      AND user_id = (SELECT id FROM profiles WHERE name = 'Huntington Surf and Sport')
    ORDER BY created_at ASC 
    LIMIT 1
  );

-- Delete duplicate Firewire Dominator 2.0 items
DELETE FROM equipment 
WHERE name = 'Firewire Dominator 2.0' 
  AND user_id = (SELECT id FROM profiles WHERE name = 'Huntington Surf and Sport')
  AND id != (
    SELECT id FROM equipment 
    WHERE name = 'Firewire Dominator 2.0' 
      AND user_id = (SELECT id FROM profiles WHERE name = 'Huntington Surf and Sport')
    ORDER BY created_at ASC 
    LIMIT 1
  );

-- Consolidate Firewire S-Boss models (3 items → 1)
UPDATE equipment 
SET size = '5''10", 6''0", 6''2"',
    description = COALESCE(NULLIF(description, ''), 'High-performance surfboard with multiple size options'),
    updated_at = now()
WHERE name = 'Firewire S-Boss' 
  AND user_id = (SELECT id FROM profiles WHERE name = 'Huntington Surf and Sport')
  AND id = (
    SELECT id FROM equipment 
    WHERE name = 'Firewire S-Boss' 
      AND user_id = (SELECT id FROM profiles WHERE name = 'Huntington Surf and Sport')
    ORDER BY created_at ASC 
    LIMIT 1
  );

-- Delete duplicate Firewire S-Boss items
DELETE FROM equipment 
WHERE name = 'Firewire S-Boss' 
  AND user_id = (SELECT id FROM profiles WHERE name = 'Huntington Surf and Sport')
  AND id != (
    SELECT id FROM equipment 
    WHERE name = 'Firewire S-Boss' 
      AND user_id = (SELECT id FROM profiles WHERE name = 'Huntington Surf and Sport')
    ORDER BY created_at ASC 
    LIMIT 1
  );

-- Consolidate Firewire Mash Up models (2 items → 1)
UPDATE equipment 
SET size = '5''8", 6''4"',
    description = COALESCE(NULLIF(description, ''), 'High-performance surfboard with multiple size options'),
    updated_at = now()
WHERE name = 'Firewire Mash Up' 
  AND user_id = (SELECT id FROM profiles WHERE name = 'Huntington Surf and Sport')
  AND id = (
    SELECT id FROM equipment 
    WHERE name = 'Firewire Mash Up' 
      AND user_id = (SELECT id FROM profiles WHERE name = 'Huntington Surf and Sport')
    ORDER BY created_at ASC 
    LIMIT 1
  );

-- Delete duplicate Firewire Mash Up items
DELETE FROM equipment 
WHERE name = 'Firewire Mash Up' 
  AND user_id = (SELECT id FROM profiles WHERE name = 'Huntington Surf and Sport')
  AND id != (
    SELECT id FROM equipment 
    WHERE name = 'Firewire Mash Up' 
      AND user_id = (SELECT id FROM profiles WHERE name = 'Huntington Surf and Sport')
    ORDER BY created_at ASC 
    LIMIT 1
  );

-- Consolidate Firewire Taylor Jensen models (2 items → 1)
UPDATE equipment 
SET size = '9''0", 9''3"',
    description = COALESCE(NULLIF(description, ''), 'High-performance surfboard with multiple size options'),
    updated_at = now()
WHERE name = 'Firewire Taylor Jensen' 
  AND user_id = (SELECT id FROM profiles WHERE name = 'Huntington Surf and Sport')
  AND id = (
    SELECT id FROM equipment 
    WHERE name = 'Firewire Taylor Jensen' 
      AND user_id = (SELECT id FROM profiles WHERE name = 'Huntington Surf and Sport')
    ORDER BY created_at ASC 
    LIMIT 1
  );

-- Delete duplicate Firewire Taylor Jensen items
DELETE FROM equipment 
WHERE name = 'Firewire Taylor Jensen' 
  AND user_id = (SELECT id FROM profiles WHERE name = 'Huntington Surf and Sport')
  AND id != (
    SELECT id FROM equipment 
    WHERE name = 'Firewire Taylor Jensen' 
      AND user_id = (SELECT id FROM profiles WHERE name = 'Huntington Surf and Sport')
    ORDER BY created_at ASC 
    LIMIT 1
  );

-- Consolidate STCY Lab Rat models (2 items → 1)
UPDATE equipment 
SET size = '6''1", 6''2"',
    description = COALESCE(NULLIF(description, ''), 'High-performance surfboard with multiple size options'),
    updated_at = now()
WHERE name = 'STCY Lab Rat' 
  AND user_id = (SELECT id FROM profiles WHERE name = 'Huntington Surf and Sport')
  AND id = (
    SELECT id FROM equipment 
    WHERE name = 'STCY Lab Rat' 
      AND user_id = (SELECT id FROM profiles WHERE name = 'Huntington Surf and Sport')
    ORDER BY created_at ASC 
    LIMIT 1
  );

-- Delete duplicate STCY Lab Rat items
DELETE FROM equipment 
WHERE name = 'STCY Lab Rat' 
  AND user_id = (SELECT id FROM profiles WHERE name = 'Huntington Surf and Sport')
  AND id != (
    SELECT id FROM equipment 
    WHERE name = 'STCY Lab Rat' 
      AND user_id = (SELECT id FROM profiles WHERE name = 'Huntington Surf and Sport')
    ORDER BY created_at ASC 
    LIMIT 1
  );
