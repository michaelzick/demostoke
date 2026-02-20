-- Add favorite_equipment column to profiles table
ALTER TABLE profiles 
ADD COLUMN favorite_equipment jsonb DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN profiles.favorite_equipment IS 'Array of objects with equipment_id and favorited_at timestamp, e.g., [{"equipment_id": "uuid", "favorited_at": "2024-01-01T00:00:00Z"}]';;
