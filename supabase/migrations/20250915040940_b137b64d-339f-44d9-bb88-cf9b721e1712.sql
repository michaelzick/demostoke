-- Update all HTTP image URLs to HTTPS in equipment_images table
UPDATE equipment_images 
SET image_url = REPLACE(image_url, 'http://', 'https://') 
WHERE image_url LIKE 'http://%';

-- Update all HTTP image URLs to HTTPS in profiles table (if any)
UPDATE profiles 
SET avatar_url = REPLACE(avatar_url, 'http://', 'https://') 
WHERE avatar_url LIKE 'http://%';

-- Create a function to validate HTTPS URLs for future inserts
CREATE OR REPLACE FUNCTION validate_https_url()
RETURNS TRIGGER AS $$
BEGIN
  -- Check image_url in equipment_images
  IF TG_TABLE_NAME = 'equipment_images' AND NEW.image_url IS NOT NULL THEN
    IF NEW.image_url NOT LIKE 'https://%' AND NEW.image_url NOT LIKE '/%' THEN
      RAISE EXCEPTION 'Image URLs must use HTTPS or be relative paths';
    END IF;
  END IF;
  
  -- Check avatar_url in profiles
  IF TG_TABLE_NAME = 'profiles' AND NEW.avatar_url IS NOT NULL THEN
    IF NEW.avatar_url NOT LIKE 'https://%' AND NEW.avatar_url NOT LIKE '/%' THEN
      RAISE EXCEPTION 'Avatar URLs must use HTTPS or be relative paths';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to enforce HTTPS validation
CREATE TRIGGER enforce_https_equipment_images
  BEFORE INSERT OR UPDATE ON equipment_images
  FOR EACH ROW EXECUTE FUNCTION validate_https_url();

CREATE TRIGGER enforce_https_profiles
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION validate_https_url();