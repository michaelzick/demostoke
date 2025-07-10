
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Upload, Trash2, Eye } from "lucide-react";
import { slugify } from "@/utils/slugify";
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

interface ProfileImageSectionProps {
  profileImage: string | null;
  name: string;
  email: string;
  isUploadingImage: boolean;
  isDeletingImage: boolean;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDeletePhoto: () => void;
  userId?: string;
}

export const ProfileImageSection = ({
  profileImage,
  name,
  email,
  isUploadingImage,
  isDeletingImage,
  onImageUpload,
  onDeletePhoto,
  userId,
}: ProfileImageSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChangePhotoClick = () => {
    fileInputRef.current?.click();
  };

  return (
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
                <AlertDialogAction onClick={onDeletePhoto}>
                  Delete Photo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {userId && (
            <Button type="button" size="sm" asChild>
              <Link to={`/user-profile/${slugify(name)}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Profile
              </Link>
            </Button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onImageUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};
