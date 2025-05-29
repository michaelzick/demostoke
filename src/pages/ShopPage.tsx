
import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarIcon, MapPinIcon, ClockIcon, PhoneIcon, GlobeIcon } from "lucide-react";
import EquipmentCard from "@/components/EquipmentCard";
import { mockEquipment } from "@/lib/mockData";
import { Equipment } from "@/types";

interface Shop {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  address: string;
  phone: string;
  website: string;
  hours: string;
  rating: number;
  reviewCount: number;
  categories: string[];
}

const shops: { [key: string]: Shop } = {
  "the-boarder": {
    id: "the-boarder",
    name: "The Boarder",
    description: "Los Angeles' premier surfboard shop with over 20 years of experience. We specialize in high-performance boards and custom shapes for all skill levels.",
    imageUrl: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80",
    address: "1234 Venice Blvd, Venice, CA 90291",
    phone: "(310) 555-0123",
    website: "www.theboarder.com",
    hours: "Mon-Sun: 9AM-7PM",
    rating: 4.8,
    reviewCount: 127,
    categories: ["surfboards"]
  },
  "rei": {
    id: "rei",
    name: "REI",
    description: "Your local REI Co-op store offering premium stand-up paddleboards and outdoor gear. We're committed to helping you get outside and enjoy nature.",
    imageUrl: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=800&q=80",
    address: "5678 Sunset Blvd, Los Angeles, CA 90028",
    phone: "(323) 555-0456",
    website: "www.rei.com",
    hours: "Mon-Sat: 10AM-9PM, Sun: 11AM-6PM",
    rating: 4.7,
    reviewCount: 89,
    categories: ["sups"]
  },
  "the-pow-house": {
    id: "the-pow-house",
    name: "The Pow House",
    description: "Mountain sports headquarters featuring the latest snowboards and skis. From beginner setups to pro-level gear, we've got everything for your winter adventures.",
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
    address: "9012 Mountain View Dr, Pasadena, CA 91103",
    phone: "(626) 555-0789",
    website: "www.thepowhouse.com",
    hours: "Mon-Fri: 10AM-8PM, Sat-Sun: 9AM-9PM",
    rating: 4.9,
    reviewCount: 156,
    categories: ["snowboards", "skis"]
  }
};

const ShopPage = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const shop = shopId ? shops[shopId] : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!shop) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Shop Not Found</h1>
          <p className="text-muted-foreground mb-4">The shop you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/explore">Back to Explore</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Filter equipment for this shop based on categories
  const shopEquipment = mockEquipment.filter(item => 
    shop.categories.includes(item.category)
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-64 bg-cover bg-center" style={{ backgroundImage: `url(${shop.imageUrl})` }}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-2">{shop.name}</h1>
            <div className="flex items-center gap-2 mb-2">
              <StarIcon className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              <span className="text-lg">{shop.rating}</span>
              <span className="text-gray-300">({shop.reviewCount} reviews)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {shop.categories.map((category) => (
                <Badge key={category} variant="secondary" className="capitalize">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shop Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Shop Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{shop.description}</p>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">{shop.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <PhoneIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{shop.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <GlobeIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Website</p>
                      <p className="text-sm text-muted-foreground">{shop.website}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <ClockIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Hours</p>
                      <p className="text-sm text-muted-foreground">{shop.hours}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Equipment Grid */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Available Equipment</h2>
              <Badge variant="outline">{shopEquipment.length} items</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {shopEquipment.map((equipment) => (
                <EquipmentCard key={equipment.id} equipment={equipment} />
              ))}
            </div>
            
            {shopEquipment.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">No equipment available</h3>
                <p className="text-muted-foreground">
                  This shop doesn't have any equipment listed at the moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
