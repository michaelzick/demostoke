-- Migrate figma_connections to use Supabase Vault for encrypted token storage

-- Add new column to store vault secret ID instead of plain text token
ALTER TABLE public.figma_connections 
ADD COLUMN IF NOT EXISTS vault_secret_id UUID;

-- Create a function to migrate existing tokens to Vault (one-time migration)
-- This function will be called manually or automatically during deployment
CREATE OR REPLACE FUNCTION public.migrate_figma_tokens_to_vault()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  connection_record RECORD;
  secret_id UUID;
BEGIN
  -- Loop through all connections that have a plain text token but no vault_secret_id
  FOR connection_record IN 
    SELECT id, user_id, access_token 
    FROM public.figma_connections 
    WHERE access_token IS NOT NULL 
    AND vault_secret_id IS NULL
  LOOP
    -- Store the token in vault
    SELECT vault.create_secret(
      connection_record.access_token,
      'figma_access_token_' || connection_record.user_id::text,
      'Encrypted Figma API access token'
    ) INTO secret_id;
    
    -- Update the connection record with the vault secret ID
    UPDATE public.figma_connections
    SET vault_secret_id = secret_id
    WHERE id = connection_record.id;
  END LOOP;
END;
$$;

-- Create helper function to store encrypted Figma token
CREATE OR REPLACE FUNCTION public.store_figma_token_encrypted(
  p_user_id UUID,
  p_access_token TEXT,
  p_user_info JSONB,
  p_team_id TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  v_secret_id UUID;
  v_connection_id UUID;
  v_existing_secret_id UUID;
BEGIN
  -- Check if connection already exists
  SELECT id, vault_secret_id INTO v_connection_id, v_existing_secret_id
  FROM public.figma_connections
  WHERE user_id = p_user_id;
  
  IF v_existing_secret_id IS NOT NULL THEN
    -- Update existing vault secret
    PERFORM vault.update_secret(v_existing_secret_id, p_access_token);
    v_secret_id := v_existing_secret_id;
  ELSE
    -- Create new vault secret
    SELECT vault.create_secret(
      p_access_token,
      'figma_access_token_' || p_user_id::text,
      'Encrypted Figma API access token'
    ) INTO v_secret_id;
  END IF;
  
  -- Upsert connection record
  INSERT INTO public.figma_connections (user_id, vault_secret_id, user_info, team_id, access_token)
  VALUES (p_user_id, v_secret_id, p_user_info, p_team_id, NULL)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    vault_secret_id = v_secret_id,
    user_info = p_user_info,
    team_id = COALESCE(p_team_id, figma_connections.team_id),
    access_token = NULL,  -- Clear plain text token
    updated_at = now()
  RETURNING id INTO v_connection_id;
  
  RETURN v_connection_id;
END;
$$;

-- Create helper function to retrieve decrypted Figma token
CREATE OR REPLACE FUNCTION public.get_figma_token_decrypted(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  v_secret_id UUID;
  v_decrypted_secret TEXT;
BEGIN
  -- Get the vault secret ID for this user
  SELECT vault_secret_id INTO v_secret_id
  FROM public.figma_connections
  WHERE user_id = p_user_id;
  
  IF v_secret_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Retrieve and decrypt the token from vault
  SELECT decrypted_secret INTO v_decrypted_secret
  FROM vault.decrypted_secrets
  WHERE id = v_secret_id;
  
  RETURN v_decrypted_secret;
END;
$$;

-- Create helper function to delete encrypted Figma token
CREATE OR REPLACE FUNCTION public.delete_figma_token_encrypted(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  v_secret_id UUID;
BEGIN
  -- Get the vault secret ID for this user
  SELECT vault_secret_id INTO v_secret_id
  FROM public.figma_connections
  WHERE user_id = p_user_id;
  
  -- Delete the connection record (cascade will handle related records)
  DELETE FROM public.figma_connections
  WHERE user_id = p_user_id;
  
  -- Delete the vault secret if it exists
  IF v_secret_id IS NOT NULL THEN
    PERFORM vault.delete_secret(v_secret_id);
  END IF;
END;
$$;

-- Add comment to document the security improvement
COMMENT ON COLUMN public.figma_connections.vault_secret_id IS 
'References encrypted access token stored in Supabase Vault for security compliance';

COMMENT ON COLUMN public.figma_connections.access_token IS 
'DEPRECATED: Plain text token storage. Use vault_secret_id instead. Will be removed in future migration.';

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.store_figma_token_encrypted TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_figma_token_decrypted TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_figma_token_encrypted TO authenticated;;
