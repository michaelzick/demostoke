-- Drop existing triggers
DROP TRIGGER IF EXISTS enforce_https_equipment_images ON equipment_images;
DROP TRIGGER IF EXISTS enforce_https_profiles ON profiles;

-- Drop the buggy function that tried to handle multiple tables
DROP FUNCTION IF EXISTS validate_https_url();

-- Create equipment_images-specific validation function
CREATE OR REPLACE FUNCTION validate_https_url_equipment_images()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check image_url since this is for equipment_images table
  IF NEW.image_url IS NOT NULL THEN
    IF NEW.image_url NOT LIKE 'https://%' AND NEW.image_url NOT LIKE '/%' THEN
      RAISE EXCEPTION 'Image URLs must use HTTPS or be relative paths';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create profiles-specific validation function
CREATE OR REPLACE FUNCTION validate_https_url_profiles()
RETURNS TRIGGER AS $$
BEGIN
  -- Check avatar_url
  IF NEW.avatar_url IS NOT NULL THEN
    IF NEW.avatar_url NOT LIKE 'https://%' AND NEW.avatar_url NOT LIKE '/%' THEN
      RAISE EXCEPTION 'Avatar URLs must use HTTPS or be relative paths';
    END IF;
  END IF;
  
  -- Check hero_image_url
  IF NEW.hero_image_url IS NOT NULL THEN
    IF NEW.hero_image_url NOT LIKE 'https://%' AND NEW.hero_image_url NOT LIKE '/%' THEN
      RAISE EXCEPTION 'Hero image URLs must use HTTPS or be relative paths';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate triggers with new functions
CREATE TRIGGER enforce_https_equipment_images
  BEFORE INSERT OR UPDATE ON equipment_images
  FOR EACH ROW EXECUTE FUNCTION validate_https_url_equipment_images();

CREATE TRIGGER enforce_https_profiles
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION validate_https_url_profiles();;
