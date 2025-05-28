import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/helpers";
import { User, Upload, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadProfileImage, deleteProfileImage, generateDicebearAvatar } from "@/utils/profileImageUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const UserProfilePage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingImage(true);

    try {
      // Delete old profile image if it exists and is from profile-images bucket
      if (profileImage && !profileImage.includes('dicebear.com')) {
        await deleteProfileImage(profileImage, user.id);
      }

      // Upload the new image
      const imageUrl = await uploadProfileImage(file, user.id);

      // Update the profile in the database
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: imageUrl })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setProfileImage(imageUrl);

      toast({
        title: "Profile photo updated",
        description: "Your profile photo has been updated successfully.",
      });
    } catch (error: unknown) {
      console.error('Error uploading profile image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image. Please try again.';
      toast({
        title: "Error uploading image",
        description: errorMessage,
        variant: "destructive",
      });

      // Fallback to dicebear avatar on error
      const fallbackAvatar = generateDicebearAvatar(user.id);
      setProfileImage(fallbackAvatar);

      // Update database with fallback avatar
      await supabase
        .from('profiles')
        .update({ avatar_url: fallbackAvatar })
        .eq('id', user.id);
    } finally {
      setIsUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = async () => {
    if (!user) return;

    setIsDeletingImage(true);

    try {
      // Delete the current profile image if it exists and is from profile-images bucket
      if (profileImage && !profileImage.includes('dicebear.com')) {
        await deleteProfileImage(profileImage, user.id);
      }

      // Generate a new dicebear avatar
      const fallbackAvatar = generateDicebearAvatar(user.id);

      // Update the profile in the database
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: fallbackAvatar })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setProfileImage(fallbackAvatar);

      toast({
        title: "Profile photo deleted",
        description: "Your profile photo has been removed and replaced with a default avatar.",
      });
    } catch (error: unknown) {
      console.error('Error deleting profile image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete image. Please try again.';
      toast({
        title: "Error deleting image",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeletingImage(false);
    }
  };

  const handleChangePhotoClick = () => {
    fileInputRef.current?.click();
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

  // Show loading state while authentication is being checked or user data is loading
  if (isLoading || (!profileLoaded && isAuthenticated)) {
    return (
      <div className="container max-w-3xl py-10">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-28" />
          </CardFooter>
        </Card>
      </div>
    );
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
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
              <div className="relative">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="bg-muted flex h-24 w-24 items-center justify-center rounded-full">
                    <User className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <h3 className="font-medium">{name || "User"}</h3>
                <p className="text-sm text-muted-foreground">{email}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    size="sm"
                    onClick={handleChangePhotoClick}
                    disabled={isUploadingImage || isDeletingImage}
                  >
                    {isUploadingImage ? (
                      <>
                        <Upload className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Change Photo
                      </>
                    )}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        type="button"
                        size="sm"
                        disabled={isUploadingImage || isDeletingImage}
                      >
                        {isDeletingImage ? (
                          <>
                            <Trash2 className="h-4 w-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Photo
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Profile Photo</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete your profile photo? This action cannot be undone. Your photo will be replaced with a default avatar.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeletePhoto}>
                          Delete Photo
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed. Contact support for assistance.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Your Role</Label>
                <Select value={role} onValueChange={(value) => setRole(value)}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select Your Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private-party">Private Party</SelectItem>
                    <SelectItem value="builder">Builder (Surfboard Shaper, Etc.)</SelectItem>
                    <SelectItem value="retail-store">Retail Store</SelectItem>
                    <SelectItem value="retail-website">Retail Website</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  This role will be used for all gear you list on the platform.
                </p>
              </div>
            </div>
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
