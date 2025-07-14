import React, { useState, useEffect, useMemo } from "react";
import usePageMetadata from "@/hooks/usePageMetadata";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink, CheckCircle, AlertCircle, Info, Eye, EyeOff } from "lucide-react";
import FormHeader from "@/components/gear-form/FormHeader";
import { useToast } from "@/hooks/use-toast";
import { useAddGearForm } from "@/hooks/useAddGearForm";
import { useAuth } from "@/helpers";
import { useUserEquipment, useUpdateEquipmentVisibility } from "@/hooks/useUserEquipment";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { slugify } from "@/utils/slugify";
import { fetchMockLightspeedInventory, ingestLightspeedInventory } from "@/services/lightspeed/lightspeedService";

const LightspeedPOSPage = () => {
  usePageMetadata({
    title: 'Lightspeed POS | DemoStoke',
    description: 'Import and manage your Lightspeed inventory on DemoStoke.'
  });
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const {
    handlers,
  } = useAddGearForm();

  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: inventory = [], isLoading: inventoryLoading } = useUserEquipment(user?.id);
  const updateVisibilityMutation = useUpdateEquipmentVisibility();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const masterToggleState = useMemo(() => {
    if (inventory.length === 0) return { checked: false, indeterminate: false };
    const visibleCount = inventory.filter(item => item.visible_on_map).length;
    if (visibleCount === 0) {
      return { checked: false, indeterminate: false };
    } else if (visibleCount === inventory.length) {
      return { checked: true, indeterminate: false };
    } else {
      return { checked: false, indeterminate: true };
    }
  }, [inventory]);

  const handleVisibilityToggle = (id: string, current: boolean) => {
    updateVisibilityMutation.mutate({ equipmentId: id, visible: !current });
  };

  const handleMasterToggle = () => {
    const shouldShowAll = !masterToggleState.checked;
    inventory.forEach(item => {
      if (item.visible_on_map !== shouldShowAll) {
        updateVisibilityMutation.mutate({ equipmentId: item.id, visible: shouldShowAll });
      }
    });
  };

  const handleViewDetails = (id: string, name: string, category: string) => {
    if (user?.name) {
      navigate(`/${category}/${slugify(user.name)}/${slugify(name)}`);
    } else {
      navigate(`/${category}/${slugify(name)}`);
    }
  };

  const totalPages = Math.ceil(inventory.length / itemsPerPage) || 1;
  const paginatedItems = inventory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
    if (!user) return;
    setIsLoading(true);
    try {
      const items = await fetchMockLightspeedInventory();
      await ingestLightspeedInventory(items, user.id);
      queryClient.invalidateQueries({ queryKey: ['userEquipment'] });
      toast({
        title: 'Sync Complete!',
        description: 'Your inventory has been successfully synced with DemoStoke.',
      });
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: 'There was an error syncing your inventory.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <FormHeader title="Lightspeed POS Integration" route='/list-your-gear' buttonText='Back to List Gear Page' />

      <div className="mb-8">
        <p className="text-lg text-muted-foreground">
          Connect your Lightspeed Retail POS system to automatically sync your inventory with DemoStoke.
        </p>
      </div>

      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="sync">Inventory</TabsTrigger>
          <TabsTrigger value="help">Help</TabsTrigger>
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
                <div className="flex gap-2">
                  <Button
                    onClick={handleConnect}
                    disabled={isLoading || !credentials.clientId || !credentials.clientSecret}
                    className="w-full"
                  >
                    {isLoading ? "Connecting..." : "Connect to Lightspeed POS"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handlers.handleCancel()}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
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
                      <Badge variant="secondary">Mountain Bikes</Badge>
                      <Badge variant="secondary">Accessories</Badge>
                    </div>
                  </div>

                  <Button
                    onClick={handleSync}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Syncing Inventory...' : 'Sync Now'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {isConnected && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {inventory.length === 0 && !inventoryLoading ? (
                  <p className="text-sm text-muted-foreground">No items imported yet.</p>
                ) : (
                  <>
                    <div className="mb-4 flex items-center space-x-2">
                      <div className="relative flex items-center">
                        <Checkbox
                          id="inventory-master-toggle"
                          checked={masterToggleState.checked}
                          onCheckedChange={handleMasterToggle}
                          disabled={updateVisibilityMutation.isPending}
                          className={`${masterToggleState.indeterminate ? 'data-[state=checked]:bg-primary/50 data-[state=checked]:border-primary' : ''} flex-shrink-0`}
                        />
                        {masterToggleState.indeterminate && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-2 h-0.5 bg-primary rounded-sm" />
                          </div>
                        )}
                      </div>
                      <label
                        htmlFor="inventory-master-toggle"
                        className="text-sm font-medium cursor-pointer flex-1"
                      >
                        {masterToggleState.indeterminate
                          ? 'Some gear visible — click to show all'
                          : masterToggleState.checked
                            ? 'Uncheck to hide all gear'
                            : 'Check to show all gear'}
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {paginatedItems.map(item => (
                        <Card key={item.id} className="overflow-hidden">
                          <div className="relative h-32 cursor-pointer" onClick={() => handleViewDetails(item.id, item.name, item.category)}>
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm p-1.5 rounded-md">
                              {item.visible_on_map ? (
                                <Eye className="h-4 w-4 text-green-600" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                          </div>
                          <CardHeader className="p-4 cursor-pointer" onClick={() => handleViewDetails(item.id, item.name, item.category)}>
                            <CardTitle className="text-base line-clamp-1">{item.name}</CardTitle>
                            <CardDescription>${item.price_per_day}/day</CardDescription>
                          </CardHeader>
                          <CardContent className="border-t p-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`vis-${item.id}`}
                                checked={item.visible_on_map}
                                onCheckedChange={() => handleVisibilityToggle(item.id, item.visible_on_map)}
                                disabled={updateVisibilityMutation.isPending}
                              />
                              <label htmlFor={`vis-${item.id}`} className="text-sm cursor-pointer">
                                Show on map
                              </label>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="flex justify-center gap-2 pt-4">
                        <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                          Prev
                        </Button>
                        <span className="px-2 text-sm">Page {currentPage} of {totalPages}</span>
                        <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
                          Next
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

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
                      <a href="https://cloud.lightspeedapp.com/oauth/register.php" target="_blank" rel="noopener noreferrer">
                        Lightspeed Retail API Signup <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    2
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
                    3
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
                    <a href="https://api-portal.lsk.lightspeed.app/quick-start/authentication/authentication-tutorial" target="_blank" rel="noopener noreferrer">
                      OAuth 2.0 Authentication Guide <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://www.youtube.com/watch?v=bgAN9JbELSo&t=34s" target="_blank" rel="noopener noreferrer">
                      Lightspeed POS Tutorial <ExternalLink className="ml-1 h-3 w-3" />
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
