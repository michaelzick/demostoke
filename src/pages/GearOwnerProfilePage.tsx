
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { mockEquipment, ownerPersonas } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StarIcon, MapPinIcon, CalendarIcon, UsersIcon } from "lucide-react";
import { GearOwner } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const GearOwnerProfilePage = () => {
  const { ownerId } = useParams();
  
  // First try to find the owner in the personas list
  const ownerFromPersonas = ownerPersonas.find((person) => person.id === ownerId);
  
  // If not found in personas, get it from equipment
  const ownerEquipment = mockEquipment.filter((item) => item.owner.id === ownerId);
  const ownerFromEquipment = ownerEquipment[0]?.owner;
  
  // Use persona if available, otherwise use data from equipment
  const owner = ownerFromPersonas || ownerFromEquipment;

  if (!owner) {
    return <div className="container px-4 py-8">Owner not found.</div>;
  }

  const personalityBadgeColor = getPersonalityColor(owner.personality);

  return (
    <div className="container px-4 md:px-6 py-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
        <div className="w-full md:w-1/3">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-24"></div>
            <div className="px-6 pb-6 relative">
              <Avatar className="h-24 w-24 border-4 border-white absolute -mt-12">
                <AvatarImage src={owner.imageUrl} alt={owner.name} />
                <AvatarFallback>{owner.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="mt-16">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold">{owner.name}</h1>
                    {owner.personality && (
                      <span className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${personalityBadgeColor}`}>
                        {owner.personality}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center bg-yellow-50 text-yellow-700 px-2 py-1 rounded">
                    <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                    <span className="font-medium">{owner.rating}</span>
                  </div>
                </div>
                
                <div className="mt-4 space-y-3 text-sm">
                  {owner.location && (
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 text-slate-500 mr-2" />
                      <span>{owner.location}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <UsersIcon className="h-4 w-4 text-slate-500 mr-2" />
                    <span>Response Rate: {owner.responseRate}%</span>
                  </div>
                  {owner.memberSince && (
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 text-slate-500 mr-2" />
                      <span>Member since {owner.memberSince}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="w-full md:w-2/3">
          <h2 className="text-lg font-medium mb-4">About</h2>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">
                {owner.bio || `Hi, I'm ${owner.name.split(" ")[0]}! I love sharing my gear with others and helping them enjoy their adventures. Feel free to reach out if you have any questions!`}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Separator className="my-8" />

      <div>
        <h2 className="text-xl font-medium mb-6">Available Gear</h2>
        {ownerEquipment.length === 0 ? (
          <p className="text-muted-foreground">No gear currently listed.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ownerEquipment.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="h-48 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{item.name}</h3>
                    <span className="font-medium text-green-600">${item.pricePerDay}/day</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center text-xs">
                      <StarIcon className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                      <span>{item.rating} ({item.reviewCount})</span>
                    </div>
                    <Button variant="outline" size="sm" asChild className="text-xs h-8">
                      <Link to={`/equipment/${item.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get personality badge color
function getPersonalityColor(personality?: string): string {
  switch (personality) {
    case "Weekend Warrior":
      return "bg-blue-100 text-blue-800";
    case "Die-Hard":
      return "bg-purple-100 text-purple-800";
    case "Nomadic Renter":
      return "bg-green-100 text-green-800";
    case "Local Shop Owner":
      return "bg-amber-100 text-amber-800";
    case "Local Shaper":
      return "bg-indigo-100 text-indigo-800";
    case "Quiver Lender":
      return "bg-rose-100 text-rose-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
}

export default GearOwnerProfilePage;
