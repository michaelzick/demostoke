import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { geocodeAddress } from "@/utils/geocoding";

const escapeSqlString = (value: string) => `'${value.replace(/'/g, "''")}'`;

export default function GearUrlScraperSection() {
  const [html, setHtml] = useState("");
  const [sql, setSql] = useState("");
  const [loading, setLoading] = useState(false);
  const [insertLoading, setInsertLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const buildSql = async (data: any) => {
    const name = data.name || "Unknown";
    const category = data.category || "snowboards";
    const description = data.description || "";
    const size = data.size ?? null;
    const weight = data.weight ?? null;
    const material = data.material ?? null;
    const suitable = data.suitable_skill_level ?? null;
    const subcategory = data.subcategory ?? null;

    const damage_deposit =
      data.damage_deposit !== undefined && data.damage_deposit !== null
        ? Number(data.damage_deposit)
        : null;

    const price_per_day =
      data.price_per_day !== undefined && data.price_per_day !== null
        ? Number(data.price_per_day)
        : 0; // NOT NULL
    const price_per_hour =
      data.price_per_hour !== undefined && data.price_per_hour !== null
        ? Number(data.price_per_hour)
        : null;
    const price_per_week =
      data.price_per_week !== undefined && data.price_per_week !== null
        ? Number(data.price_per_week)
        : null;

    // Geocode if we have an address
    let location_lat: number | null = null;
    let location_lng: number | null = null;
    let location_address: string | null = data.location_address || null;

    try {
      if (location_address) {
        const geo = await geocodeAddress(location_address);
        if (geo) {
          location_lat = geo.lat;
          location_lng = geo.lng;
        }
      }
    } catch (e) {
      console.warn("Geocoding failed:", e);
    }

    const sqlStr = `INSERT INTO public.equipment (
    id, user_id, name, category, description, price_per_day, price_per_hour, price_per_week,
    size, weight, material, suitable_skill_level, status,
    location_lat, location_lng, location_address, subcategory, damage_deposit, visible_on_map
) VALUES (
    gen_random_uuid(),
    'REPLACE_WITH_USER_ID',
    ${escapeSqlString(name)},
    ${escapeSqlString(category)},
    ${escapeSqlString(description)},
    ${price_per_day},
    ${price_per_hour === null ? "NULL" : price_per_hour},
    ${price_per_week === null ? "NULL" : price_per_week},
    ${size === null ? "NULL" : escapeSqlString(String(size))},
    ${weight === null ? "NULL" : escapeSqlString(String(weight))},
    ${material === null ? "NULL" : escapeSqlString(String(material))},
    ${suitable === null ? "NULL" : escapeSqlString(String(suitable))},
    'available',
    ${location_lat === null ? "NULL" : location_lat},
    ${location_lng === null ? "NULL" : location_lng},
    ${location_address === null ? "NULL" : escapeSqlString(location_address)},
    ${subcategory === null ? "NULL" : escapeSqlString(String(subcategory))},
    ${damage_deposit === null ? "NULL" : damage_deposit},
    true
);`;

    setSql(sqlStr);
  };

  const handleProcessHtml = async () => {
    setMessage(null);
    setError(null);
    setSql("");
    if (!html.trim()) {
      setError("Please paste HTML to process");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('extract-gear-from-html', {
        body: { html }
      });
      if (error) throw error;
      if (!data) throw new Error('No data returned from extractor');
      await buildSql(data);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Failed to process HTML');
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = async () => {
    setMessage(null);
    setError(null);
    if (!sql.trim()) {
      setError("Nothing to insert. Generate or paste SQL first.");
      return;
    }
    setInsertLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('insert-equipment-from-sql', {
        body: { sql }
      });
      if (error) throw error;
      setMessage(`Inserted ${data?.inserted || 1} row(s) successfully.`);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Insert failed');
    } finally {
      setInsertLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paste HTML → Generate SQL</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Page HTML</label>
          <Textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder="Paste the full HTML of the gear page here"
            className="min-h-[220px] font-mono"
          />
          <div className="flex items-center gap-3">
            <Button onClick={handleProcessHtml} disabled={loading}>
              {loading ? 'Processing…' : 'Process HTML & Generate SQL'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Tip: Use the Zip Code Retailer Search to find shops. Open a link, navigate to the gear page, copy the page HTML, then paste it above.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Generated SQL (editable)</label>
          <Textarea
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            className="min-h-[220px] font-mono"
          />
          <div className="flex items-center gap-3">
            <Button variant="default" onClick={handleInsert} disabled={insertLoading}>
              {insertLoading ? 'Inserting…' : 'Insert into Supabase'}
            </Button>
          </div>
          {message && (
            <Alert>{message}</Alert>
          )}
          {error && (
            <Alert variant="destructive">{error}</Alert>
          )}
          <p className="text-xs text-muted-foreground">
            Tip: Replace 'REPLACE_WITH_USER_ID' with the actual user id before inserting.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
