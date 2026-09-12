import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { HttpError } from "./http.ts";

/** Verify the caller before paid requests or writes. The returned client honors RLS. */
export async function authenticate(req: Request, admin = false) {
  const authorization = req.headers.get("Authorization");
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);
  if (!match) throw new HttpError(401, "Unauthorized");
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: { headers: { Authorization: `Bearer ${match[1]}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
  const { data, error } = await supabase.auth.getUser(match[1]);
  if (error || !data?.user) throw new HttpError(401, "Unauthorized");
  if (admin) {
    const { data: role, error: roleError } = await supabase.from("user_roles")
      .select("id").eq("user_id", data.user.id).eq("role", "admin").limit(1)
      .maybeSingle();
    if (roleError || !role) throw new HttpError(403, "Forbidden");
  }
  return { user: data.user, supabase };
}
