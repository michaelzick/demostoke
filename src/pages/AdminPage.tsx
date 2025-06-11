
import { useIsAdmin } from "@/hooks/useUserRole";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useAuth } from "@/helpers";
import { Navigate } from "react-router-dom";
import DataDisplaySettings from "@/components/admin/DataDisplaySettings";
import VideoUploadSection from "@/components/admin/VideoUploadSection";
import UserManagementSection from "@/components/admin/UserManagementSection";

const AdminPage = () => {
  const { isAuthenticated } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useIsAdmin();
  const { isLoading: settingsLoading } = useAppSettings();

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

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage application settings and configuration
        </p>
      </div>

      <div className="space-y-6">
        <DataDisplaySettings />
        <VideoUploadSection />
        <UserManagementSection />
      </div>
    </div>
  );
};

export default AdminPage;
