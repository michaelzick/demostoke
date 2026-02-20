-- Update equipment_images validation function with search_path
CREATE OR REPLACE FUNCTION validate_https_url_equipment_images()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Only check image_url since this is for equipment_images table
  IF NEW.image_url IS NOT NULL THEN
    IF NEW.image_url NOT LIKE 'https://%' AND NEW.image_url NOT LIKE '/%' THEN
      RAISE EXCEPTION 'Image URLs must use HTTPS or be relative paths';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update profiles validation function with search_path
CREATE OR REPLACE FUNCTION validate_https_url_profiles()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
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
$$;;
