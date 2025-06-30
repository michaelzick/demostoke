
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAppSettings, useUpdateAppSettings } from "@/hooks/useAppSettings";
import { useToast } from "@/hooks/use-toast";

const DataDisplaySettings = () => {
  const { data: appSettings } = useAppSettings();
  const updateSettings = useUpdateAppSettings();
  const { toast } = useToast();

  const handleMockDataToggle = async (checked: boolean) => {
    try {
      await updateSettings.mutateAsync({ showMockData: checked });
      toast({
        title: "Settings Updated",
        description: `Mock data is now ${checked ? 'enabled' : 'disabled'} for all users.`,
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Display Settings</CardTitle>
        <CardDescription>
          Control what data is shown to all users across the application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="mock-data-toggle" className="text-base">
              Show Mock Data
            </Label>
            <div className="text-sm text-muted-foreground">
              When enabled, all users will see mock data instead of real database data
            </div>
          </div>
          <Switch
            id="mock-data-toggle"
            checked={appSettings?.show_mock_data ?? true}
            onCheckedChange={handleMockDataToggle}
            disabled={updateSettings.isPending}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DataDisplaySettings;
