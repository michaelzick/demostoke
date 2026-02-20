-- Migrate any existing plain text tokens to vault
SELECT public.migrate_figma_tokens_to_vault();

-- Make access_token nullable since all tokens should be in vault
ALTER TABLE public.figma_connections 
ALTER COLUMN access_token DROP NOT NULL;

-- Clear any remaining plain text tokens (they're now in vault)
UPDATE public.figma_connections 
SET access_token = NULL 
WHERE vault_secret_id IS NOT NULL;

-- Add a check to prevent storing both plain text and vault tokens
ALTER TABLE public.figma_connections
ADD CONSTRAINT check_token_storage 
CHECK (
  (access_token IS NULL AND vault_secret_id IS NOT NULL) OR
  (access_token IS NOT NULL AND vault_secret_id IS NULL)
);

-- Add a helpful comment
COMMENT ON COLUMN public.figma_connections.access_token IS 'Deprecated: Use vault_secret_id instead. This column exists only for backward compatibility and should always be NULL.';

COMMENT ON TABLE public.figma_connections IS 'Stores Figma OAuth connections. Tokens are stored securely in Vault via vault_secret_id. Use store_figma_token_encrypted() and get_figma_token_decrypted() functions to manage tokens.';;
