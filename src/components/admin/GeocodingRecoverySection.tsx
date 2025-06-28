
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, AlertCircle, CheckCircle } from "lucide-react";
import { runGeocodingRecovery, findEquipmentMissingCoordinates } from "@/utils/geocodingRecovery";

const GeocodingRecoverySection = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [checkResults, setCheckResults] = useState<any>(null);
  const [recoveryResults, setRecoveryResults] = useState<any>(null);
  const { toast } = useToast();

  const handleCheck = async () => {
    setIsChecking(true);
    try {
      const equipmentMissingCoordinates = await findEquipmentMissingCoordinates();
      setCheckResults({
        count: equipmentMissingCoordinates.length,
        items: equipmentMissingCoordinates
      });
      
      toast({
        title: "Check Complete",
        description: `Found ${equipmentMissingCoordinates.length} equipment items missing coordinates`,
      });
    } catch (error) {
      console.error('Error checking equipment:', error);
      toast({
        title: "Check Failed",
        description: "Failed to check equipment geocoding status",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleRunRecovery = async () => {
    setIsRunning(true);
    setRecoveryResults(null);
    
    try {
      const results = await runGeocodingRecovery();
      setRecoveryResults(results);
      
      toast({
        title: "Geocoding Recovery Complete",
        description: `Successfully geocoded ${results.successful} items, failed ${results.failed} items`,
        variant: results.failed === 0 ? "default" : "destructive"
      });
    } catch (error) {
      console.error('Error running geocoding recovery:', error);
      toast({
        title: "Recovery Failed",
        description: "Failed to run geocoding recovery process",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Geocoding Recovery
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Check for equipment items missing coordinates and attempt to geocode them using their zip codes.
        </p>

        <div className="flex gap-2">
          <Button
            onClick={handleCheck}
            disabled={isChecking}
            variant="outline"
          >
            {isChecking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              "Check Missing Coordinates"
            )}
          </Button>

          <Button
            onClick={handleRunRecovery}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Recovery...
              </>
            ) : (
              "Run Geocoding Recovery"
            )}
          </Button>
        </div>

        {checkResults && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Check Results</h4>
            <p className="text-sm">
              Found <strong>{checkResults.count}</strong> equipment items missing coordinates
            </p>
            {checkResults.items.length > 0 && (
              <div className="mt-2 max-h-32 overflow-y-auto">
                <div className="text-xs space-y-1">
                  {checkResults.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.name}</span>
                      <span className="text-muted-foreground">{item.location_zip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {recoveryResults && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Recovery Results</h4>
            <div className="grid grid-cols-3 gap-4 mb-2">
              <div className="text-center">
                <div className="text-lg font-semibold">{recoveryResults.totalFound}</div>
                <div className="text-xs text-muted-foreground">Total Found</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">{recoveryResults.successful}</div>
                <div className="text-xs text-muted-foreground">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-red-600">{recoveryResults.failed}</div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
            </div>
            
            {recoveryResults.results.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto">
                <div className="text-xs space-y-1">
                  {recoveryResults.results.map((result: any) => (
                    <div key={result.id} className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-600" />
                      )}
                      <span className="flex-1">{result.name}</span>
                      {result.error && (
                        <span className="text-red-600 text-xs">{result.error}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GeocodingRecoverySection;
