
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProfileImageSection } from "@/components/profile/ProfileImageSection";
import { ProfileForm } from "@/components/profile/ProfileForm";

interface ProfileFormSectionProps {
  profileImage: string | null;
  name: string;
  email: string;
  phone: string;
  address: string;
  about: string;
  website: string;
  displayRole: string;
  isUploadingImage: boolean;
  isDeletingImage: boolean;
  isUpdating: boolean;
  userId?: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onAboutChange: (value: string) => void;
  onWebsiteChange: (value: string) => void;
  onDisplayRoleChange: (value: string) => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDeletePhoto: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ProfileFormSection = ({
  profileImage,
  name,
  email,
  phone,
  address,
  about,
  website,
  displayRole,
  isUploadingImage,
  isDeletingImage,
  isUpdating,
  userId,
  onNameChange,
  onEmailChange,
  onPhoneChange,
  onAddressChange,
  onAboutChange,
  onWebsiteChange,
  onDisplayRoleChange,
  onImageUpload,
  onDeletePhoto,
  onSubmit,
}: ProfileFormSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Your Profile</CardTitle>
        <CardDescription>
          Manage your personal information and account settings.
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-6">
          <ProfileImageSection
            profileImage={profileImage}
            name={name}
            email={email}
            isUploadingImage={isUploadingImage}
            isDeletingImage={isDeletingImage}
            onImageUpload={onImageUpload}
            onDeletePhoto={onDeletePhoto}
            userId={userId}
          />
          <Separator />
          <ProfileForm
            name={name}
            email={email}
            displayRole={displayRole}
            phone={phone}
            address={address}
            about={about}
            website={website}
            onNameChange={onNameChange}
            onEmailChange={onEmailChange}
            onDisplayRoleChange={onDisplayRoleChange}
            onPhoneChange={onPhoneChange}
            onAddressChange={onAddressChange}
            onAboutChange={onAboutChange}
            onWebsiteChange={onWebsiteChange}
          />
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
