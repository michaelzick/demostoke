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
import { useHeroImageUpload } from "@/hooks/useHeroImageUpload";

const UserProfilePage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null); // This will be hero image now
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [isUploadingHero, setIsUploadingHero] = useState(false);

  const { handleImageUpload, handleDeletePhoto } = useProfileImageHandlers({
    user,
    profileImage, // acts as hero image now
    setProfileImage, // acts on hero image now
    setIsUploadingImage,
    setIsDeletingImage,
  });

  const { uploadHeroImage } = useHeroImageUpload({
    userId: user?.id,
    onUrl: (url: string) => setHeroImage(url)
  });

  useEffect(() => {
    console.log("Profile page effect - auth status:", { isAuthenticated, isLoading, userId: user?.id });

    // If auth check is complete and user is not authenticated, redirect to sign in
    if (!isLoading && !isAuthenticated) {
      navigate("/auth/signin");
      return;
    }

    // When user data becomes available, fetch the profile data directly from the database
    if (user) {
      fetchProfileData();
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  const fetchProfileData = async () => {
    if (!user?.id) return;
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('name, role, avatar_url, hero_image_url')
        .eq('id', user.id)
        .single();

      if (error) {
        setName(user.name || "");
        setRole("private-party");
        setProfileImage(null);
      } else {
        setName(profileData.name || "");
        setRole(profileData.role || "private-party");
        // Use hero_image_url as the main profileImage
        setProfileImage(profileData.hero_image_url || null);
      }

      setEmail(user.email || "");
      setProfileLoaded(true);
    } catch (error) {
      console.error('Error in fetchProfileData:', error);
      // Fallback to user data
      setName(user.name || "");
      setEmail(user.email || "");
      setRole("private-party");
      setProfileImage(user.imageUrl || generateDicebearAvatar(user.id));
      setHeroImage(null);
      setProfileLoaded(true);
    }
  };

  const handleHeroImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingHero(true);
    await uploadHeroImage(file);
    setIsUploadingHero(false);
  };

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
          ...(role !== "private-party" && { hero_image_url: heroImage })
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
              profileImage={profileImage} // use hero image now
              name={name}
              email={email}
              isUploadingImage={isUploadingImage}
              isDeletingImage={isDeletingImage}
              onImageUpload={handleImageUpload}
              onDeletePhoto={handleDeletePhoto}
            />
            {role !== "private-party" && (
              <div>
                <label className="block text-sm font-medium mb-1">Hero Image</label>
                {heroImage && (
                  <img src={heroImage} alt="Hero" className="w-full max-h-48 object-cover rounded mb-2" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploadingHero}
                  onChange={handleHeroImageChange}
                  className="block text-sm"
                />
                {isUploadingHero && (
                  <div className="text-xs text-muted-foreground mt-1">Uploading...</div>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  Recommended size: 1200x400px.
                </div>
              </div>
            )}
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
