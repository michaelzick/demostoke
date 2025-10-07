-- Remove the deprecated access_token column from figma_connections table
-- This completes the security migration to use Vault exclusively for storing Figma tokens

-- First, remove the check constraint that references the access_token column
ALTER TABLE public.figma_connections 
DROP CONSTRAINT IF EXISTS check_token_storage;

-- Drop the plain text access_token column entirely
-- All tokens should now be stored exclusively in Vault via vault_secret_id
ALTER TABLE public.figma_connections 
DROP COLUMN IF EXISTS access_token;

-- Add a NOT NULL constraint on vault_secret_id to ensure all connections use Vault
-- This enforces secure storage of Figma tokens
ALTER TABLE public.figma_connections 
ALTER COLUMN vault_secret_id SET NOT NULL;

-- Update table comment to reflect the security improvement
COMMENT ON TABLE public.figma_connections IS 
'Stores Figma OAuth connections for users. Access tokens are securely stored in Supabase Vault and referenced by vault_secret_id. Use store_figma_token_encrypted() to create/update connections and get_figma_token_decrypted() to retrieve tokens.';

COMMENT ON COLUMN public.figma_connections.vault_secret_id IS 
'Reference to the encrypted Figma access token in Supabase Vault. Required for all connections.';