import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { geocodeZipCode, geocodeAddress } from "@/utils/geocoding";
import { supabase } from "@/integrations/supabase/client";

interface BusinessResult {
  title: string;
  url: string;
  domain: string;
  snippet?: string;
  matchedCategories?: string[];
  email?: string;
  phone?: string;
  address?: string;
  lat?: number;
  lng?: number;
  relevantPages?: Array<{ url: string; title?: string; categories?: string[] }>;
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
  const [enriching, setEnriching] = useState(false);
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

    const values = chosen
      .flatMap((b) => (b.matchedCategories || []).map((cat) => ({ b, cat })))
      .map(({ b, cat }) => {
        const name = (b.relevantPages?.[0]?.title || b.title || "").replace(/'/g, "''");
        const desc = (b.snippet || '').replace(/'/g, "''");
        const address = (b.address || zip || '').replace(/'/g, "''");
        const lat = b.lat != null ? b.lat.toString() : "NULL";
        const lng = b.lng != null ? b.lng.toString() : "NULL";
        return `(
    gen_random_uuid(),
    'REPLACE_WITH_USER_ID',
    '${name}',
    '${cat}',
    '${desc}',
    NULL, NULL, NULL,
    NULL, NULL, NULL, NULL,
    'available',
    ${lat},
    ${lng},
    '${address}',
    NULL,
    NULL,
    true
  )`;
      })
      .join(",\n");

    const sql = `-- Template INSERTs for equipment (adjust values before running)\n-- Set user_id, prices, and refine fields as needed.\nINSERT INTO public.equipment (\n    id, user_id, name, category, description, price_per_day, price_per_hour, price_per_week,\n    size, weight, material, suitable_skill_level, status,\n    location_lat, location_lng, location_address, subcategory, damage_deposit, visible_on_map\n) VALUES\n${values};`;

    navigator.clipboard.writeText(sql).then(() =>
      toast({ title: "SQL copied", description: "Insert statements copied to clipboard." })
    );
  };

  const handleEnrich = async () => {
    const chosen = businesses.filter((b) => selected[b.domain]);
    if (chosen.length === 0) {
      toast({ title: "No businesses selected", description: "Select at least one.", variant: "destructive" });
      return;
    }
    setEnriching(true);
    try {
      const { data, error } = await supabase.functions.invoke("crawl-retailer-details", {
        body: { urls: chosen.map((b) => b.url), keywords: CATEGORY_KEYWORDS, limit: 40 },
      });
      if (error) throw error;
      const results: Array<{ url: string; email?: string; phone?: string; address?: string; relevantPages?: any[]; matchedCategories?: string[] }> = data?.results || [];

      // First pass: update contact info + address + categories + relevant pages
      setBusinesses((prev) => {
        const map = new Map(prev.map((p) => [p.domain, p] as const));
        for (const r of results) {
          const domain = getDomain(r.url);
          const existing = map.get(domain);
          if (!existing) continue;
          map.set(domain, {
            ...existing,
            email: r.email || existing.email,
            phone: r.phone || existing.phone,
            address: r.address || existing.address,
            matchedCategories: r.matchedCategories && r.matchedCategories.length > 0 ? r.matchedCategories : existing.matchedCategories,
            relevantPages: r.relevantPages || existing.relevantPages,
          });
        }
        return Array.from(map.values());
      });

      // Second pass: geocode addresses for updated businesses
      const updates = await Promise.all(
        results.map(async (r) => {
          if (!r.address) return null;
          const coords = await geocodeAddress(r.address);
          return { domain: getDomain(r.url), coords } as const;
        })
      );

      setBusinesses((prev) =>
        prev.map((b) => {
          const up = updates.find((u) => u && u.domain === b.domain);
          return up && up.coords ? { ...b, lat: up.coords.lat, lng: up.coords.lng } : b;
        })
      );

      toast({ title: "Enrichment complete", description: "Extracted contact info and addresses where available." });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Enrichment failed", description: e?.message || "Unexpected error", variant: "destructive" });
    } finally {
      setEnriching(false);
    }
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
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleEnrich} disabled={enriching}>
                  {enriching ? "Enriching..." : "Enrich selected"}
                </Button>
                <Button variant="secondary" onClick={handleGenerateSQL}>Generate SQL templates</Button>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Select</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Categories detected</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
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
                    <TableCell>{b.email || "—"}</TableCell>
                    <TableCell>{b.phone || "—"}</TableCell>
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
