
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Copy } from "lucide-react";
import { Snowflake, Waves, Tire } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useUserEquipment, useDeleteEquipment } from "@/hooks/useUserEquipment";
import { UserEquipment } from "@/types/equipment";

const MyEquipmentPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: userEquipment = [], isLoading, error } = useUserEquipment();
  const deleteEquipmentMutation = useDeleteEquipment();

  // Function to get the appropriate icon based on equipment category
  const getEquipmentIcon = (category: string) => {
    switch (category) {
      case "snowboards":
        return <Snowflake className="h-5 w-5" weight="fill" />;
      case "surfboards":
        return <Waves className="h-5 w-5" weight="fill" />;
      case "skateboards":
        return <Tire className="h-5 w-5" weight="fill" />;
      default:
        return null;
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
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to delete equipment",
          variant: "destructive",
        });
      },
    });
  };

  const handleUpdate = (id: string) => {
    navigate(`/edit-gear/${id}`);
  };

  const handleDuplicate = (item: UserEquipment) => {
    // Store the item data in sessionStorage to use it in the add gear form
    sessionStorage.setItem('duplicatedGear', JSON.stringify({
      gearName: item.name,
      gearType: item.category.slice(0, -1), // Remove the 's' at the end (snowboards -> snowboard)
      description: item.description,
      zipCode: item.location_name,
      // Extract dimensions from size if possible
      measurementUnit: "inches", // Default to inches
      dimensions: {
        length: item.size.split('x')[0]?.trim() || "",
        width: item.size.split('x')[1]?.trim() || "",
      },
      skillLevel: item.suitable_skill_level,
      price: item.price_per_day.toString(),
      damageDeposit: "50", // Default value
      imageUrl: item.image_url, // Include the image URL
    }));

    navigate('/list-gear');

    toast({
      title: "Duplicating Gear",
      description: "Creating a new listing with the selected gear's information.",
    });
  };

  const handleListGearClick = () => {
    if (isAuthenticated) {
      navigate("/list-gear");
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
          <p className="text-muted-foreground mb-6">Start sharing your gear with others and earn money</p>
          <Button onClick={handleListGearClick}>List Your First Item</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userEquipment.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative h-48">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm p-1.5 rounded-md">
                  <div className="flex items-center gap-1.5">
                    {getEquipmentIcon(item.category)}
                    <span className="capitalize text-sm font-medium">
                      {item.category.slice(0, -1)}
                    </span>
                  </div>
                </div>
              </div>
              <CardHeader>
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
                    <span className="font-medium">Location:</span> {item.location_name}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Added:</span> {formatDate(item.created_at)}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Skill Level:</span> {item.suitable_skill_level}
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
