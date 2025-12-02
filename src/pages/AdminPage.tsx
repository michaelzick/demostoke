
import { useAuth } from "@/helpers";
import usePageMetadata from "@/hooks/usePageMetadata";
import UserManagementSection from "@/components/admin/UserManagementSection";
import ManualUserCreationSection from "@/components/admin/ManualUserCreationSection";
import ImageUploadSection from "@/components/admin/ImageUploadSection";
import VideoUploadSection from "@/components/admin/VideoUploadSection";

import GlobalSearchSettings from "@/components/admin/GlobalSearchSettings";
import GeocodingRecoverySection from "@/components/admin/GeocodingRecoverySection";
import DemoEventGeocodingSection from "@/components/admin/DemoEventGeocodingSection";
import AddMissingImagesSection from "@/components/admin/AddMissingImagesSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GearUrlScraperSection from "@/components/admin/GearUrlScraperSection";
import RetailerDiscoverySection from "@/components/admin/RetailerDiscoverySection";
import { RentalDiscoveryDashboard } from "@/components/admin/RentalDiscoveryDashboard";

const AdminPage = () => {
  usePageMetadata({
    title: 'Admin Dashboard | DemoStoke',
    description: 'Administrative tools for managing DemoStoke.'
  });
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
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <ManualUserCreationSection />
          <UserManagementSection />
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <ImageUploadSection />
          <VideoUploadSection />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <GlobalSearchSettings />
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <RetailerDiscoverySection />
          <GearUrlScraperSection />
          <RentalDiscoveryDashboard />
          <AddMissingImagesSection />
          <GeocodingRecoverySection />
          <DemoEventGeocodingSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
