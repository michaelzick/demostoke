
import React, { useState } from "react";
import { mockEquipment } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomerWaiverForm from "@/components/CustomerWaiverForm";
import { useAuth } from "@/helpers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

const GearListingPage = () => {
  const [waiverCompleted, setWaiverCompleted] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const handleWaiverComplete = () => {
    setWaiverCompleted(true);
  };

  const handleManualEntry = () => {
    if (isAuthenticated) {
      navigate("/list-gear");
    } else {
      navigate("/auth/signin");
    }
  };

  const handleLightspeedPOS = () => {
    if (isAuthenticated) {
      navigate("/lightspeed-pos");
    } else {
      navigate("/auth/signin");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">List Your Gear</h1>
      <p className="text-lg text-center mb-8">
        Browse through the available gear or add your own to the collection!
      </p>
      <div className="flex justify-center mb-8">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="lg" className="flex items-center gap-2">
              List Your Gear
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem onClick={handleManualEntry}>
              Manual Entry
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                Sync With POS
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={handleLightspeedPOS}>
                  Lightspeed POS
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs defaultValue="browse" className="mb-8">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="browse">Browse Gear</TabsTrigger>
          <TabsTrigger value="waiver">Customer Waiver</TabsTrigger>
        </TabsList>
        <TabsContent value="browse">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mockEquipment.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-zinc-900 shadow-md rounded-lg overflow-hidden"
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{item.name}</h2>
                  <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                  <p className="text-lg font-bold mb-2">${item.pricePerDay}/day</p>
                  <Button 
                    size="sm" 
                    className="w-full"
                    disabled={!waiverCompleted}
                  >
                    {waiverCompleted ? "Rent Now" : "Complete Waiver First"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="waiver">
          <div className="max-w-2xl mx-auto">
            <CustomerWaiverForm 
              equipment={mockEquipment[0]} 
              onComplete={handleWaiverComplete} 
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GearListingPage;
