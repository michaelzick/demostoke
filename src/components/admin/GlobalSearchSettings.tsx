import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSearchPreference, useUpdateSearchPreference } from "@/hooks/useSearchPreference";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

const GlobalSearchSettings = () => {
  const { data: preference } = useSearchPreference();
  const updatePreference = useUpdateSearchPreference();
  const { toast } = useToast();

  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (preference) {
      setEnabled(preference.use_ai_search);
    }
  }, [preference]);

  const handleToggle = async (checked: boolean) => {
    try {
      setEnabled(checked);
      await updatePreference.mutateAsync(checked);
      toast({
        title: "Settings Updated",
        description: `AI search is now ${checked ? 'enabled' : 'disabled'} for all users.`,
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive"
      });
      // revert toggle on error
      setEnabled(prev => !prev);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Global Search Settings</CardTitle>
        <CardDescription>
          Control the search engine used throughout the application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="ai-search-toggle" className="text-base">
              Use AI Search
            </Label>
            <div className="text-sm text-muted-foreground">
              Toggle GPT-powered search on or off
            </div>
          </div>
          <Switch
            id="ai-search-toggle"
            checked={enabled}
            onCheckedChange={handleToggle}
            disabled={updatePreference.isPending}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default GlobalSearchSettings;
