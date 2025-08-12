import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function splitValues(row: string): string[] {
  const vals: string[] = [];
  let cur = '';
  let inStr = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === "'") {
      // handle escaped '' inside string
      if (inStr && row[i + 1] === "'") {
        cur += "''";
        i++;
        continue;
      }
      inStr = !inStr;
      cur += ch;
      continue;
    }
    if (ch === ',' && !inStr) {
      vals.push(cur.trim());
      cur = '';
      continue;
    }
    cur += ch;
  }
  if (cur.trim().length) vals.push(cur.trim());
  return vals;
}

function unquote(val: string): string {
  const t = val.trim();
  if (t.startsWith("'") && t.endsWith("'")) {
    return t.slice(1, -1).replace(/''/g, "'");
  }
  return t;
}

function coerce(val: string): any {
  const t = val.trim();
  if (/^NULL$/i.test(t)) return null;
  if (/^true$/i.test(t)) return true;
  if (/^false$/i.test(t)) return false;
  if (/^gen_random_uuid\(\)$/i.test(t)) return crypto.randomUUID();
  if (t.startsWith("'") && t.endsWith("'")) return unquote(t);
  const num = Number(t);
  return Number.isNaN(num) ? null : num;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sql } = await req.json();
    if (typeof sql !== 'string' || !sql.toLowerCase().includes('insert into public.equipment')) {
      return new Response(JSON.stringify({ error: 'Invalid SQL payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Authenticated client (to check admin)
    const authClient = createClient(supabaseUrl, anon, {
      global: { headers: { Authorization: req.headers.get('Authorization') || '' } }
    });
    const { data: isAdmin, error: adminErr } = await authClient.rpc('is_admin');
    if (adminErr || !isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin privileges required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse SQL (single-row INSERT expected)
    const colsMatch = sql.match(/insert\s+into\s+public\.equipment\s*\(([^)]+)\)/i);
    const valuesMatch = sql.match(/values\s*\(([\s\S]*)\)\s*;?$/i);
    if (!colsMatch || !valuesMatch) {
      return new Response(JSON.stringify({ error: 'Unable to parse SQL' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const columns = colsMatch[1].split(',').map((c) => c.trim().replace(/"/g, ''));
    const rawRow = valuesMatch[1].trim();
    const values = splitValues(rawRow).map(coerce);

    if (columns.length !== values.length) {
      return new Response(JSON.stringify({ error: 'Column/value count mismatch' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const row: Record<string, any> = {};
    columns.forEach((col, i) => { row[col] = values[i]; });

    // Use service role to insert
    const adminClient = createClient(supabaseUrl, service);
    const { error: insertErr } = await adminClient.from('equipment').insert(row);
    if (insertErr) {
      return new Response(JSON.stringify({ error: insertErr.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ inserted: 1 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('insert-equipment-from-sql error:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Unexpected error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
