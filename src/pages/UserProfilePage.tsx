
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/helpers";
import { supabase } from "@/integrations/supabase/client";
import { generateDicebearAvatar } from "@/utils/profileImageUpload";
import { ProfileImageSection } from "@/components/profile/ProfileImageSection";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ProfileLoadingSkeleton } from "@/components/profile/ProfileLoadingSkeleton";
import { useProfileImageHandlers } from "@/hooks/useProfileImageHandlers";

const UserProfilePage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const { handleImageUpload, handleDeletePhoto } = useProfileImageHandlers({
    user,
    profileImage,
    setProfileImage,
    setIsUploadingImage,
    setIsDeletingImage,
  });

  useEffect(() => {
    console.log("Profile page effect - auth status:", { isAuthenticated, isLoading, userId: user?.id });

    // If auth check is complete and user is not authenticated, redirect to sign in
    if (!isLoading && !isAuthenticated) {
      navigate("/auth/signin");
      return;
    }

    // When user data becomes available, populate the form
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setRole(user.role || "private-party");
      // Use user's avatar or generate a dicebear avatar as fallback
      setProfileImage(user.imageUrl || generateDicebearAvatar(user.id));
      setProfileLoaded(true);
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: name,
          role: role,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'There was an error updating your profile.';
      toast({
        title: "Error updating profile",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Show loading state while authentication is being checked or user data is loading
  if (isLoading || (!profileLoaded && isAuthenticated)) {
    return <ProfileLoadingSkeleton />;
  }

  return (
    <div className="container max-w-3xl py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Your Profile</CardTitle>
          <CardDescription>
            Manage your personal information and account settings
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdateProfile}>
          <CardContent className="space-y-6">
            <ProfileImageSection
              profileImage={profileImage}
              name={name}
              email={email}
              isUploadingImage={isUploadingImage}
              isDeletingImage={isDeletingImage}
              onImageUpload={handleImageUpload}
              onDeletePhoto={handleDeletePhoto}
            />

            <Separator />

            <ProfileForm
              name={name}
              email={email}
              role={role}
              onNameChange={setName}
              onRoleChange={setRole}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default UserProfilePage;
