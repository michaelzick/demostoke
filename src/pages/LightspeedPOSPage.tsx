
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, CheckCircle, AlertCircle, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const LightspeedPOSPage = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [credentials, setCredentials] = useState({
    clientId: "",
    clientSecret: "",
    accessToken: "",
    accountId: "",
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      // Simulate API connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsConnected(true);
      toast({
        title: "Successfully Connected!",
        description: "Your Lightspeed POS is now connected to DemoStoke.",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast({
        title: "Sync Complete!",
        description: "Your inventory has been successfully synced with DemoStoke.",
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "There was an error syncing your inventory.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" asChild>
          <Link to="/list-gear" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List Your Gear
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Lightspeed POS Integration</h1>
        <p className="text-lg text-muted-foreground">
          Connect your Lightspeed Retail POS system to automatically sync your inventory with DemoStoke.
        </p>
      </div>

      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="sync">Sync Inventory</TabsTrigger>
          <TabsTrigger value="help">Help & Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isConnected ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                )}
                Connection Status
              </CardTitle>
              <CardDescription>
                {isConnected
                  ? "Your Lightspeed POS is connected and ready to sync."
                  : "Enter your Lightspeed POS credentials to connect your account."
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientId">Client ID</Label>
                  <Input
                    id="clientId"
                    placeholder="Your Lightspeed Client ID"
                    value={credentials.clientId}
                    onChange={(e) => handleInputChange("clientId", e.target.value)}
                    disabled={isConnected}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientSecret">Client Secret</Label>
                  <Input
                    id="clientSecret"
                    type="password"
                    placeholder="Your Lightspeed Client Secret"
                    value={credentials.clientSecret}
                    onChange={(e) => handleInputChange("clientSecret", e.target.value)}
                    disabled={isConnected}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accessToken">Access Token</Label>
                  <Input
                    id="accessToken"
                    type="password"
                    placeholder="Your Lightspeed Access Token"
                    value={credentials.accessToken}
                    onChange={(e) => handleInputChange("accessToken", e.target.value)}
                    disabled={isConnected}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountId">Account ID</Label>
                  <Input
                    id="accountId"
                    placeholder="Your Lightspeed Account ID"
                    value={credentials.accountId}
                    onChange={(e) => handleInputChange("accountId", e.target.value)}
                    disabled={isConnected}
                  />
                </div>
              </div>

              {!isConnected && (
                <Button
                  onClick={handleConnect}
                  disabled={isLoading || !credentials.clientId || !credentials.clientSecret}
                  className="w-full"
                >
                  {isLoading ? "Connecting..." : "Connect to Lightspeed POS"}
                </Button>
              )}

              {isConnected && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Successfully connected to Lightspeed POS. You can now sync your inventory.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Sync</CardTitle>
              <CardDescription>
                Sync your Lightspeed POS inventory with DemoStoke to automatically list your gear for rental.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isConnected ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please connect your Lightspeed POS account first in the Setup tab.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">245</div>
                          <div className="text-sm text-muted-foreground">Total Items</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">198</div>
                          <div className="text-sm text-muted-foreground">Available for Rental</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">47</div>
                          <div className="text-sm text-muted-foreground">Currently Rented</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Sync Options</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">Surfboards</Badge>
                      <Badge variant="secondary">Snowboards</Badge>
                      <Badge variant="secondary">Skateboards</Badge>
                      <Badge variant="secondary">SUPs</Badge>
                      <Badge variant="secondary">Accessories</Badge>
                    </div>
                  </div>

                  <Button
                    onClick={handleSync}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? "Syncing Inventory..." : "Sync Now"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="help" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started with Lightspeed POS</CardTitle>
              <CardDescription>
                Follow these steps to set up your Lightspeed POS integration with DemoStoke.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold">Create a Lightspeed App</h3>
                    <p className="text-sm text-muted-foreground">
                      Visit the Lightspeed Partner Portal and create a new application to get your Client ID and Secret.
                    </p>
                    <Button variant="outline" size="sm" className="mt-2" asChild>
                      <a href="https://developers.lightspeedhq.com/" target="_blank" rel="noopener noreferrer">
                        Lightspeed Developer Portal <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold">Configure OAuth</h3>
                    <p className="text-sm text-muted-foreground">
                      Set up OAuth 2.0 authentication and obtain an access token for your account.
                    </p>
                    <div className="mt-2 p-3 bg-muted rounded-md">
                      <code className="text-sm">
                        Redirect URI: https://yourdomain.com/lightspeed-callback
                      </code>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold">Get Your Account ID</h3>
                    <p className="text-sm text-muted-foreground">
                      Find your Account ID in your Lightspeed POS settings or use the API to retrieve it.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold">Configure DemoStoke</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter your credentials in the Setup tab to connect your Lightspeed POS to DemoStoke.
                    </p>
                  </div>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>API Rate Limits:</strong> Lightspeed POS has rate limits of 10 requests per second.
                  DemoStoke automatically handles these limits during sync operations.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h3 className="font-semibold">Useful Resources</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://developers.lightspeedhq.com/retail/introduction/introduction/" target="_blank" rel="noopener noreferrer">
                      Lightspeed Retail API Documentation <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://developers.lightspeedhq.com/retail/authentication/authentication/" target="_blank" rel="noopener noreferrer">
                      OAuth 2.0 Authentication Guide <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://developers.lightspeedhq.com/retail/endpoints/item/" target="_blank" rel="noopener noreferrer">
                      Item Management API <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LightspeedPOSPage;
