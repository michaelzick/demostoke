
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Edit, Trash2, Copy } from "lucide-react";
import { Snowflake, Waves, Tire } from "@phosphor-icons/react"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { mockUserEquipment, UserEquipment } from "@/lib/userEquipment";
import { useToast } from "@/hooks/use-toast";

const MyEquipmentPage = () => {
  const [userEquipment, setUserEquipment] = useState<UserEquipment[]>(mockUserEquipment);
  const { toast } = useToast();
  const navigate = useNavigate();
  
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
    setUserEquipment(userEquipment.filter(item => item.id !== id));
    toast({
      title: "Equipment Deleted",
      description: "The equipment has been removed from your listings.",
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
      zipCode: item.location.name,
      // Extract dimensions from specifications.size if possible
      measurementUnit: "inches", // Default to inches
      dimensions: {
        length: item.specifications.size.split('x')[0]?.trim() || "",
        width: item.specifications.size.split('x')[1]?.trim() || "",
      },
      skillLevel: item.specifications.suitable,
      price: item.pricePerDay.toString(),
      damageDeposit: "50", // Default value
    }));
    
    navigate('/list-gear');
    
    toast({
      title: "Duplicating Equipment",
      description: "Creating a new listing with the selected gear's information.",
    });
  };

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Equipment</h1>
        <Button onClick={() => navigate("/list-gear")}>Add New Equipment</Button>
      </div>

      {userEquipment.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-xl font-medium mb-2">You haven't listed any equipment yet</h2>
          <p className="text-muted-foreground mb-6">Start sharing your gear with others and earn money</p>
          <Button onClick={() => navigate("/list-gear")}>List Your First Item</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userEquipment.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative h-48">
                <img 
                  src={item.imageUrl} 
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
                  <span>${item.pricePerDay}/day</span>
                  <span className="badge bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-2 py-0.5 rounded text-xs">
                    {item.status.toUpperCase()}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-2">{item.description}</p>
                <div className="mt-4">
                  <div className="text-sm">
                    <span className="font-medium">Location:</span> {item.location.name}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Added:</span> {item.addedDate}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Skill Level:</span> {item.specifications.suitable}
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
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEquipmentPage;
