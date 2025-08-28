import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Shield, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PrivacySettingsSectionProps {
  userId: string;
  showPhone: boolean;
  showAddress: boolean;
  showWebsite: boolean;
  showLocation: boolean;
  privacyAcknowledgment: boolean;
  onPrivacyUpdate: () => void;
}

export const PrivacySettingsSection = ({
  userId,
  showPhone,
  showAddress,
  showWebsite,
  showLocation,
  privacyAcknowledgment,
  onPrivacyUpdate
}: PrivacySettingsSectionProps) => {
  const [settings, setSettings] = useState({
    showPhone,
    showAddress,
    showWebsite,
    showLocation
  });
  const [acknowledged, setAcknowledged] = useState(privacyAcknowledgment);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          show_phone: settings.showPhone,
          show_address: settings.showAddress,
          show_website: settings.showWebsite,
          show_location: settings.showLocation,
          privacy_acknowledgment: true
        })
        .eq('id', userId);

      if (error) throw error;

      setAcknowledged(true);
      onPrivacyUpdate();
      toast({
        title: "Privacy settings updated",
        description: "Your privacy preferences have been saved successfully."
      });
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toast({
        title: "Error",
        description: "Failed to update privacy settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!acknowledged) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Business Profile Visibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Your profile information helps customers find and contact your business, 
              similar to Google Business listings. You can control what information 
              is publicly visible at any time.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              By default, the following information will be publicly visible to help customers discover your business:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Phone number (for customer contact)</li>
              <li>• Business address (for location-based searches)</li>
              <li>• Website URL (for additional business information)</li>
              <li>• General location (for map display)</li>
            </ul>
            
            <Button 
              onClick={() => setAcknowledged(true)} 
              className="w-full"
            >
              Continue to Privacy Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Privacy Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Control what information is publicly visible on your business profile. 
            Hiding information may reduce customer discovery but protects your privacy.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-phone">Show Phone Number</Label>
              <p className="text-xs text-muted-foreground">
                Allow customers to see and contact your phone number
              </p>
            </div>
            <Switch
              id="show-phone"
              checked={settings.showPhone}
              onCheckedChange={(checked) => handleSettingChange('showPhone', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-address">Show Business Address</Label>
              <p className="text-xs text-muted-foreground">
                Display your business address for local customer discovery
              </p>
            </div>
            <Switch
              id="show-address"
              checked={settings.showAddress}
              onCheckedChange={(checked) => handleSettingChange('showAddress', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-website">Show Website URL</Label>
              <p className="text-xs text-muted-foreground">
                Link customers to your business website
              </p>
            </div>
            <Switch
              id="show-website"
              checked={settings.showWebsite}
              onCheckedChange={(checked) => handleSettingChange('showWebsite', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-location">Show on Map</Label>
              <p className="text-xs text-muted-foreground">
                Display your business location on the map for local searches
              </p>
            </div>
            <Switch
              id="show-location"
              checked={settings.showLocation}
              onCheckedChange={(checked) => handleSettingChange('showLocation', checked)}
            />
          </div>
        </div>

        <Button 
          onClick={handleSaveSettings} 
          disabled={isUpdating}
          className="w-full"
        >
          {isUpdating ? "Saving..." : "Save Privacy Settings"}
        </Button>
      </CardContent>
    </Card>
  );
};