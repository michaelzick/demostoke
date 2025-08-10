import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { geocodeZipCode } from "@/utils/geocoding";
import { supabase } from "@/integrations/supabase/client";

interface BusinessResult {
  title: string;
  url: string;
  domain: string;
  snippet?: string;
  matchedCategories?: string[];
}

const CATEGORY_KEYWORDS = [
  "snowboard",
  "ski",
  "surfboard",
  "mountain bike",
];

const RADIUS_OPTIONS = [10, 25, 50, 75, 100];

// Helper to get root domain
const getDomain = (url: string) => {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const mapKeywordToCategory = (kw: string): string => {
  switch (kw) {
    case "snowboard":
      return "snowboards";
    case "ski":
      return "skis";
    case "surfboard":
      return "surfboards";
    case "mountain bike":
      return "mountain-bikes";
    default:
      return kw;
  }
};

export default function RetailerDiscoverySection() {
  const { toast } = useToast();
  const [zip, setZip] = useState("");
  const [radius, setRadius] = useState<string>(String(RADIUS_OPTIONS[1]));
  const [loading, setLoading] = useState(false);
  const [businesses, setBusinesses] = useState<BusinessResult[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const handleSearch = async () => {
    if (!zip) {
      toast({ title: "Zip required", description: "Enter a zip code.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setBusinesses([]);
    setSelected({});

    try {
      const geo = await geocodeZipCode(zip);
      if (!geo) {
        toast({ title: "Geocoding failed", description: "Could not resolve zip code.", variant: "destructive" });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("google-web-search", {
        body: {
          zip,
          lat: geo.lat,
          lng: geo.lng,
          radiusMiles: Number(radius),
          keywords: CATEGORY_KEYWORDS,
          maxResults: 30,
        },
      });

      if (error) throw error;

      const uniqueByDomain: Record<string, BusinessResult> = {};
      (data?.results || []).forEach((r: any) => {
        const domain = getDomain(r.link || r.url);
        if (!uniqueByDomain[domain]) {
          uniqueByDomain[domain] = {
            title: r.title,
            url: r.link || r.url,
            domain,
            snippet: r.snippet,
          };
        }
      });

      const list = Object.values(uniqueByDomain);

      // Keyword check on homepages to ensure gear categories exist
      const { data: checkData, error: checkErr } = await supabase.functions.invoke("site-keyword-check", {
        body: {
          urls: list.map((b) => b.url),
          keywords: CATEGORY_KEYWORDS,
        },
      });
      if (checkErr) throw checkErr;

      const matches: Record<string, string[]> = {};
      (checkData?.results || []).forEach((m: any) => {
        const domain = getDomain(m.url);
        matches[domain] = m.matchedKeywords || [];
      });

      const filtered = list
        .map((b) => ({ ...b, matchedCategories: (matches[b.domain] || []).map(mapKeywordToCategory) }))
        .filter((b) => (b.matchedCategories?.length || 0) > 0);

      setBusinesses(filtered);
      toast({ title: "Search complete", description: `${filtered.length} businesses found with matching gear.` });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Search failed", description: e?.message || "Unexpected error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (domain: string) => {
    setSelected((prev) => ({ ...prev, [domain]: !prev[domain] }));
  };

  const handleGenerateSQL = () => {
    const chosen = businesses.filter((b) => selected[b.domain]);
    if (chosen.length === 0) {
      toast({ title: "No businesses selected", description: "Select at least one.", variant: "destructive" });
      return;
    }

    const now = new Date().toISOString();
    const values = chosen
      .flatMap((b) => (b.matchedCategories || []).map((cat) => ({ b, cat })))
      .map(({ b, cat }) =>
        ` (gen_random_uuid(), /* user_id */ 'REPLACE_WITH_USER_ID', '${b.title.replace(/'/g, "''")}', '${cat}', 0, /* price_per_day */ NULL, /* price_per_hour */ NULL, /* price_per_week */ NULL, '${(b.snippet || '').replace(/'/g, "''")}', true, 0, 0, 'available', now(), now(), NULL, NULL, NULL, NULL, NULL, NULL, NULL, '${zip}', NULL, NULL)`
      )
      .join(",\n");

    const sql = `-- Template INSERTs for equipment (adjust values before running)\n-- Map categories to correct ones as needed and set user_id, prices, and coordinates.\nINSERT INTO public.equipment (id, user_id, name, category, price_per_day, price_per_hour, price_per_week, description, visible_on_map, rating, review_count, status, created_at, updated_at, suitable_skill_level, size, weight, material, subcategory, view_count, damage_deposit, location_address, location_lat, location_lng)\nVALUES\n${values};`;

    navigator.clipboard.writeText(sql).then(() =>
      toast({ title: "SQL copied", description: "Insert statements copied to clipboard." })
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Local Retailer Discovery</CardTitle>
        <CardDescription>Find nearby shops that carry snowboards, skis, surfboards, or mountain bikes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-muted-foreground">Zip code</label>
            <Input value={zip} onChange={(e) => setZip(e.target.value)} placeholder="e.g. 98101" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-muted-foreground">Radius (miles)</label>
            <Select value={radius} onValueChange={setRadius}>
              <SelectTrigger>
                <SelectValue placeholder="Select radius" />
              </SelectTrigger>
              <SelectContent>
                {RADIUS_OPTIONS.map((r) => (
                  <SelectItem key={r} value={String(r)}>{r} miles</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-1 flex items-end">
            <Button onClick={handleSearch} disabled={loading} className="w-full">
              {loading ? "Searching..." : "Find retailers"}
            </Button>
          </div>
        </div>

        {businesses.length > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{businesses.length} results</p>
              <Button variant="secondary" onClick={handleGenerateSQL}>Generate SQL templates</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Select</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Categories detected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {businesses.map((b) => (
                  <TableRow key={b.domain}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={!!selected[b.domain]}
                        onChange={() => toggleSelect(b.domain)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{b.title}</TableCell>
                    <TableCell>
                      <a href={b.url} target="_blank" rel="noreferrer" className="text-primary underline">
                        {b.domain}
                      </a>
                    </TableCell>
                    <TableCell>
                      {(b.matchedCategories || []).join(", ")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
