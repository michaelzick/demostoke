
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
  role: string;
  phone: string;
  address: string;
  about: string;
  isUploadingImage: boolean;
  isDeletingImage: boolean;
  isUpdating: boolean;
  userId?: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onAboutChange: (value: string) => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDeletePhoto: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ProfileFormSection = ({
  profileImage,
  name,
  email,
  role,
  phone,
  address,
  about,
  isUploadingImage,
  isDeletingImage,
  isUpdating,
  userId,
  onNameChange,
  onEmailChange,
  onRoleChange,
  onPhoneChange,
  onAddressChange,
  onAboutChange,
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
            role={role}
            phone={phone}
            address={address}
            about={about}
            onNameChange={onNameChange}
            onEmailChange={onEmailChange}
            onRoleChange={onRoleChange}
            onPhoneChange={onPhoneChange}
            onAddressChange={onAddressChange}
            onAboutChange={onAboutChange}
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
