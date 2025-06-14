
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
import { HeroImageSection } from "@/components/profile/HeroImageSection";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ProfileLoadingSkeleton } from "@/components/profile/ProfileLoadingSkeleton";
import { useProfileImageHandlers } from "@/hooks/useProfileImageHandlers";
import { useHeroImageHandlers } from "@/hooks/useHeroImageHandlers";

const UserProfilePage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [isUploadingHeroImage, setIsUploadingHeroImage] = useState(false);
  const [isDeletingHeroImage, setIsDeletingHeroImage] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const { handleImageUpload, handleDeletePhoto } = useProfileImageHandlers({
    user,
    profileImage,
    setProfileImage,
    setIsUploadingImage,
    setIsDeletingImage,
  });

  const { handleHeroImageUpload, handleDeleteHeroImage } = useHeroImageHandlers({
    user,
    heroImage,
    setHeroImage,
    setIsUploadingHeroImage,
    setIsDeletingHeroImage,
  });

  useEffect(() => {
    console.log("Profile page effect - auth status:", { isAuthenticated, isLoading, userId: user?.id });

    if (!isLoading && !isAuthenticated) {
      navigate("/auth/signin");
      return;
    }

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
        console.log('No profile found, using defaults');
        setName(user.name || "");
        setRole("private-party");
        setProfileImage(generateDicebearAvatar(user.id));
        setHeroImage(null);
      } else {
        setName(profileData.name || "");
        setRole(profileData.role || "private-party");
        // Priority: avatar_url > hero_image_url > dicebear fallback
        const imageUrl = profileData.avatar_url || profileData.hero_image_url || generateDicebearAvatar(user.id);
        console.log('Setting profile image:', imageUrl);
        setProfileImage(imageUrl);
        setHeroImage(profileData.hero_image_url);
      }

      setEmail(user.email || "");
      setProfileLoaded(true);
    } catch (error) {
      console.error('Error in fetchProfileData:', error);
      setName(user.name || "");
      setEmail(user.email || "");
      setRole("private-party");
      setProfileImage(generateDicebearAvatar(user.id));
      setHeroImage(null);
      setProfileLoaded(true);
    }
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

  if (isLoading || (!profileLoaded && isAuthenticated)) {
    return <ProfileLoadingSkeleton />;
  }

  return (
    <div className="container max-w-3xl py-10 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Your Profile</CardTitle>
          <CardDescription>
            Manage your personal information and account settings.
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

      <HeroImageSection
        heroImage={heroImage}
        role={role}
        isUploadingHeroImage={isUploadingHeroImage}
        isDeletingHeroImage={isDeletingHeroImage}
        onHeroImageUpload={handleHeroImageUpload}
        onDeleteHeroImage={handleDeleteHeroImage}
      />
    </div>
  );
};

export default UserProfilePage;
