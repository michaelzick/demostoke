import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Edit, Trash2, Copy, ExternalLink, Eye, EyeOff } from "lucide-react";
import { Snowflake, Waves, Bicycle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/helpers";
import { useUserEquipment, useDeleteEquipment, useUpdateEquipmentVisibility } from "@/hooks/useUserEquipment";
import { UserEquipment } from "@/types/equipment";

const MyEquipmentPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: userEquipment = [], isLoading, error } = useUserEquipment();
  const deleteEquipmentMutation = useDeleteEquipment();
  const updateVisibilityMutation = useUpdateEquipmentVisibility();

  // Handle authentication and scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);

    if (!isAuthenticated) {
      navigate("/auth/signin");
    }
  }, [isAuthenticated, navigate]);

  // Function to get the appropriate icon based on equipment category
  const getEquipmentIcon = (category: string) => {
    switch (category) {
      case "snowboards":
        return <Snowflake className="h-5 w-5" weight="fill" />;
      case "skis":
        return <Snowflake className="h-5 w-5" weight="fill" />;
      case "surfboards":
        return <Waves className="h-5 w-5" weight="fill" />;
      case "sups":
        return <Waves className="h-5 w-5" weight="fill" />;
      case "mountain-bikes":
        return <Bicycle className="h-5 w-5" weight="fill" />;
      default:
        return null;
    }
  };

  // Function to get display name for category
  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case "snowboards":
        return "Snowboard";
      case "skis":
        return "Skis";
      case "surfboards":
        return "Surfboard";
      case "sups":
        return "SUP";
      case "mountain-bikes":
        return "Mountain Bike";
      default:
        return category;
    }
  };

  const handleDelete = (id: string) => {
    deleteEquipmentMutation.mutate(id, {
      onSuccess: () => {
        toast({
          title: "Equipment Deleted",
          description: "The equipment has been removed from your listings.",
        });
      },
      onError: (error: unknown) => {
        console.error('Error deleting equipment:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete equipment",
          variant: "destructive",
        });
      },
    });
  };

  const handleVisibilityToggle = (id: string, currentVisibility: boolean) => {
    updateVisibilityMutation.mutate(
      { equipmentId: id, visible: !currentVisibility },
      {
        onSuccess: () => {
          toast({
            title: currentVisibility ? "Gear Hidden" : "Gear Shown",
            description: currentVisibility 
              ? "Your gear is now hidden from public view." 
              : "Your gear is now visible to others.",
          });
        },
        onError: (error: unknown) => {
          console.error('Error updating visibility:', error);
          toast({
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to update visibility",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleUpdate = (id: string) => {
    navigate(`/edit-gear/${id}`);
  };

  const handleViewDetails = (id: string) => {
    navigate(`/equipment/${id}`);
  };

  const handleDuplicate = (item: UserEquipment) => {
    // Parse size string safely
    const sizeParts = item.specifications.size?.split('x').map(part => part?.trim()) || [];

    // Store the item data in sessionStorage to use it in the add gear form
    sessionStorage.setItem('duplicatedGear', JSON.stringify({
      gearName: item.name,
      gearType: item.category.slice(0, -1), // Remove the 's' at the end (snowboards -> snowboard)
      description: item.description,
      zipCode: item.location?.zip || '',
      // Extract dimensions from size if possible
      measurementUnit: "inches", // Default to inches
      dimensions: {
        length: sizeParts[0] || "",
        width: sizeParts[1] || "",
        thickness: sizeParts[2] || ""
      },
      skillLevel: item.specifications.suitable,
      price: item.price_per_day.toString(),
      damageDeposit: "50", // Default value
      imageUrl: item.image_url,
    }));

    navigate('/list-your-gear/add-gear-form');

    toast({
      title: "Duplicating Gear",
      description: "Creating a new listing with the selected gear's information.",
    });
  };

  const handleListGearClick = () => {
    if (isAuthenticated) {
      navigate("/list-your-gear");
    } else {
      navigate("/auth/signin");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-10">
        <div className="text-center py-20">
          <h2 className="text-xl font-medium mb-2">Error loading your gear</h2>
          <p className="text-muted-foreground mb-6">There was a problem loading your equipment. Please try again.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Gear</h1>
        <Button onClick={handleListGearClick}>Add New Gear</Button>
      </div>

      {userEquipment.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-xl font-medium mb-2">You haven't listed any gear yet</h2>
          <p className="text-muted-foreground mb-6">Start sharing your gear with others and earn money.</p>
          <Button onClick={handleListGearClick}>List Your First Item</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userEquipment.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative h-48 cursor-pointer" onClick={() => handleViewDetails(item.id)}>
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm p-1.5 rounded-md">
                  <div className="flex items-center gap-1.5">
                    {getEquipmentIcon(item.category)}
                    <span className="capitalize text-sm font-medium">
                      {getCategoryDisplayName(item.category)}
                    </span>
                  </div>
                </div>
                <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm p-1.5 rounded-md">
                  <ExternalLink className="h-4 w-4" />
                </div>
                {/* Visibility indicator */}
                <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm p-1.5 rounded-md">
                  {item.visible_on_map ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  )}
                </div>
              </div>
              <CardHeader className="cursor-pointer" onClick={() => handleViewDetails(item.id)}>
                <CardTitle className="line-clamp-1">{item.name}</CardTitle>
                <CardDescription className="flex justify-between">
                  <span>${item.price_per_day}/day</span>
                  <span className="badge bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-2 py-0.5 rounded text-xs">
                    {item.status.toUpperCase()}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-2">{item.description}</p>
                <div className="mt-4">
                  <div className="text-sm">
                    <span className="font-medium">Location:</span> {item.location?.zip || 'N/A'}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Added:</span> {item.created_at ? formatDate(item.created_at) : 'N/A'}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Skill Level:</span> {item.specifications?.suitable || 'N/A'}
                  </div>
                </div>
                
                {/* Visibility toggle */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id={`visibility-${item.id}`}
                      checked={item.visible_on_map}
                      onCheckedChange={() => handleVisibilityToggle(item.id, item.visible_on_map)}
                      disabled={updateVisibilityMutation.isPending}
                    />
                    <label 
                      htmlFor={`visibility-${item.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Show on map and in search results
                    </label>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between gap-2">
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={() => handleUpdate(item.id)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Update
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleDuplicate(item)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      disabled={deleteEquipmentMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Equipment</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{item.name}"? This action cannot be undone and will permanently remove this equipment from your listings.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(item.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEquipmentPage;
