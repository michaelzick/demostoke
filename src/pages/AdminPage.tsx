
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useIsAdmin } from "@/hooks/useUserRole";
import { useAppSettings, useUpdateAppSettings } from "@/hooks/useAppSettings";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/helpers";
import { Navigate } from "react-router-dom";
import { useState } from "react";
import { uploadVideoToSupabase } from "@/utils/videoUpload";
import { Upload, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminPage = () => {
  const { isAuthenticated } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useIsAdmin();
  const { data: appSettings, isLoading: settingsLoading } = useAppSettings();
  const updateSettings = useUpdateAppSettings();
  const { toast } = useToast();
  
  // Video upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // User role management state
  const [userEmail, setUserEmail] = useState('');
  const [grantingRole, setGrantingRole] = useState(false);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/signin" replace />;
  }

  // Show loading while checking role
  if (roleLoading || settingsLoading) {
    return (
      <div className="container max-w-4xl py-10">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleMockDataToggle = async (checked: boolean) => {
    try {
      await updateSettings.mutateAsync(checked);
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid video file.",
        variant: "destructive"
      });
    }
  };

  const handleVideoUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a video file to upload.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const fileName = `admin-video-${Date.now()}-${selectedFile.name}`;
      const videoUrl = await uploadVideoToSupabase(selectedFile, fileName);
      
      toast({
        title: "Upload Successful",
        description: `Video uploaded successfully. URL: ${videoUrl}`,
      });
      
      setSelectedFile(null);
      // Reset the file input
      const fileInput = document.getElementById('video-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload video. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleGrantAdminRole = async () => {
    if (!userEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter a user email address.",
        variant: "destructive"
      });
      return;
    }

    setGrantingRole(true);
    try {
      // First, find the user by email
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) {
        throw new Error("Unable to fetch users");
      }

      const targetUser = userData.users.find((user: any) => user.email === userEmail.trim());
      
      if (!targetUser) {
        toast({
          title: "User Not Found",
          description: "No user found with that email address.",
          variant: "destructive"
        });
        return;
      }

      // Check if user already has admin role
      const { data: existingRole, error: roleCheckError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', targetUser.id)
        .eq('role', 'admin')
        .single();

      if (existingRole) {
        toast({
          title: "Already Admin",
          description: "This user already has admin privileges.",
          variant: "destructive"
        });
        return;
      }

      // Grant admin role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: targetUser.id,
          role: 'admin',
          assigned_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (insertError) {
        throw insertError;
      }

      toast({
        title: "Admin Role Granted",
        description: `Successfully granted admin privileges to ${userEmail}`,
      });

      setUserEmail('');
    } catch (error: any) {
      console.error('Error granting admin role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to grant admin role. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGrantingRole(false);
    }
  };

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage application settings and configuration
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Display Settings</CardTitle>
            <CardDescription>
              Control what data is shown to all users across the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

        <Card>
          <CardHeader>
            <CardTitle>Video Upload</CardTitle>
            <CardDescription>
              Upload videos to the application storage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video-upload" className="text-base">
                Select Video File
              </Label>
              <Input
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                disabled={uploading}
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
            <Button 
              onClick={handleVideoUpload}
              disabled={!selectedFile || uploading}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading..." : "Upload Video"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Grant admin privileges to users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-email" className="text-base">
                User Email
              </Label>
              <Input
                id="user-email"
                type="email"
                placeholder="Enter user email address"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                disabled={grantingRole}
              />
              <p className="text-sm text-muted-foreground">
                Enter the email address of the user you want to grant admin privileges to.
              </p>
            </div>
            <Button 
              onClick={handleGrantAdminRole}
              disabled={!userEmail.trim() || grantingRole}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              {grantingRole ? "Granting Admin Role..." : "Grant Admin Role"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;
