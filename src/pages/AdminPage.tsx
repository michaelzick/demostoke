
import { useAuth } from "@/helpers";
import UserManagementSection from "@/components/admin/UserManagementSection";
import VideoUploadSection from "@/components/admin/VideoUploadSection";
import DataDisplaySettings from "@/components/admin/DataDisplaySettings";
import TestImageGeneration from "@/components/admin/TestImageGeneration";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminPage = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please sign in to access the admin panel.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage users, content, and system settings
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="images">AI Images</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <UserManagementSection />
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <VideoUploadSection />
        </TabsContent>

        <TabsContent value="images" className="space-y-6">
          <TestImageGeneration />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <DataDisplaySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
