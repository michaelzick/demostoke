
## Fix Admin User Creation: Bypass Captcha via Edge Function

### Why This Is the Right Approach

`supabase.auth.signUp()` is the public auth endpoint — the same one captcha protects. Supabase has no per-endpoint captcha toggle. The only way to create users server-side without captcha is to use `supabase.auth.admin.createUser()`, which requires the **service role key**. Since the service role key must never be in the browser, this call must live in an edge function.

### What Changes

**New edge function: `supabase/functions/admin-create-user/index.ts`**

This edge function:
1. Verifies the caller is an admin (checks `is_admin()` via the anon client + the caller's `Authorization` header)
2. Geocodes the address if provided (calls the existing geocoding utility or a simple fetch to the geocoding API)
3. Calls `supabase.auth.admin.createUser()` with `{ email, password, user_metadata: { name }, email_confirm: true }` — this skips captcha entirely and can also auto-confirm the email
4. Waits briefly then upserts the profile row (name, website, phone, address, about, location_lat, location_lng, avatar_url, hero_image_url)
5. Upserts the `user_roles` row (role, display_role)
6. Returns `{ user_id }` on success or an error object

**`src/hooks/user-creation/useUserCreationSubmission.ts`**

Replace the `supabase.auth.signUp()` block and all the subsequent profile/role steps with a single `fetch` call to the new edge function, passing the full form data and the caller's auth token. The return value `user_id` is used the same way as before.

### Technical Details

| Element | Detail |
|---------|--------|
| Edge function auth check | Uses caller's `Authorization` header + `is_admin()` RPC — only admins can call it |
| `admin.createUser` option | `email_confirm: true` auto-confirms the email so the new user doesn't need to click a link |
| Geocoding in the edge function | Simple `fetch` to the Nominatim/geocoding API — same logic already used client-side |
| Category asset images | The `categoryAssets` map moves into the edge function so it stays server-side |
| Error handling | Edge function returns structured JSON errors; the hook maps them to toast messages as before |
| No new secrets needed | `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_URL` are already configured |

### Files Changed

| File | Change |
|------|--------|
| `supabase/functions/admin-create-user/index.ts` | **New** — full user creation logic using admin API |
| `src/hooks/user-creation/useUserCreationSubmission.ts` | Replace `signUp` + profile/role steps with a single `fetch` to the new edge function |

No other files need to change. The hook's return type, the form component, and the UUID modal all stay the same.
