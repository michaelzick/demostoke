import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search, Database, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface ScrapedRetailer {
  id: string;
  business_name: string;
  business_url: string;
  status: string;
  parsed_equipment: any;
  generated_sql: string;
  created_at: string;
  error_message?: string;
}

export function RentalDiscoveryDashboard() {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [retailers, setRetailers] = useState<ScrapedRetailer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadRetailers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("scraped_retailers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load scraped retailers",
        variant: "destructive",
      });
    } else {
      setRetailers(data || []);
    }
    setIsLoading(false);
  };

  const runAgent = async () => {
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("rental-discovery-agent", {
        body: {
          region: "los-angeles",
          categories: ["ski", "snowboard"],
          maxShops: 10,
        },
      });

      if (error) {
        toast({
          title: "Error",
          description: `Agent failed: ${error.message}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Discovered ${data.stats.equipmentExtracted} equipment items from ${data.stats.shopsScraped} shops`,
        });
        await loadRetailers();
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to run agent",
        variant: "destructive",
      });
    }
    setIsRunning(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      discovered: { variant: "secondary", icon: Search },
      scraped: { variant: "secondary", icon: Database },
      parsed: { variant: "default", icon: CheckCircle },
      inserted: { variant: "default", icon: CheckCircle },
      error: { variant: "destructive", icon: XCircle },
    };
    const config = variants[status] || variants.discovered;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Rental Discovery Agent</h2>
            <p className="text-muted-foreground">
              Automated discovery of ski/snowboard rental shops in LA County
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadRetailers} variant="outline" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
            </Button>
            <Button onClick={runAgent} disabled={isRunning}>
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Running...
                </>
              ) : (
                "Run Agent Now"
              )}
            </Button>
          </div>
        </div>

        <Alert>
          <AlertDescription>
            The agent runs automatically at midnight PT. Manual runs are useful for testing.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Discovered Retailers ({retailers.length})</h3>
          
          {retailers.length === 0 && !isLoading && (
            <p className="text-muted-foreground text-center py-8">
              No retailers discovered yet. Click "Run Agent Now" to start.
            </p>
          )}

          {retailers.map((retailer) => (
            <Card key={retailer.id} className="p-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{retailer.business_name}</h4>
                    <a
                      href={retailer.business_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {retailer.business_url}
                    </a>
                  </div>
                  {getStatusBadge(retailer.status)}
                </div>

                <div className="text-sm text-muted-foreground">
                  Equipment found: <strong>{Array.isArray(retailer.parsed_equipment) ? retailer.parsed_equipment.length : 0}</strong>
                </div>

                {retailer.error_message && (
                  <Alert variant="destructive">
                    <AlertDescription>{retailer.error_message}</AlertDescription>
                  </Alert>
                )}

                {retailer.generated_sql && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      View Generated SQL
                    </summary>
                    <pre className="mt-2 p-2 bg-muted rounded overflow-auto max-h-60">
                      {retailer.generated_sql}
                    </pre>
                  </details>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Card>
  );
}
