
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
  foundedYear: string;
  aboutSection: string;
}

const shops: { [key: string]: Shop; } = {
  "the-boarder": {
    id: "the-boarder",
    name: "The Boarder",
    description: "Los Angeles' premier surfboard shop with over 20 years of experience. We specialize in high-performance boards and custom shapes for all skill levels.",
    imageUrl: "/img/logos/the-boarder-logo.webp",
    address: "1234 Venice Blvd, Venice, CA 90291",
    phone: "(310) 555-0123",
    website: "www.theboarder.com",
    hours: "Mon-Sun: 9AM-7PM",
    rating: 4.8,
    reviewCount: 127,
    categories: ["surfboards"],
    foundedYear: "2003",
    aboutSection: "Founded in 2003, The Boarder has been Los Angeles' premier surfboard destination for over two decades. Located in the heart of Venice Beach, we're more than just a shop—we're a community of surfers passionate about the craft of board making and the art of riding waves.\n\nOur team consists of seasoned shapers, professional surfers, and wave enthusiasts who understand that every surfer is unique. Whether you're taking your first steps into the lineup or you're a seasoned pro looking for that perfect custom board, we have the expertise and inventory to match you with your ideal ride.\n\nWe specialize in high-performance shortboards, classic longboards, and everything in between. Our custom shaping service allows you to work directly with master craftsmen to create a board tailored specifically to your style, local breaks, and performance goals."
  },
  "rei": {
    id: "rei",
    name: "REI",
    description: "Your local REI Co-op store offering premium stand-up paddleboards and outdoor gear. We're committed to helping you get outside and enjoy nature.",
    imageUrl: "/img/logos/rei-logo.webp",
    address: "5678 Sunset Blvd, Los Angeles, CA 90028",
    phone: "(323) 555-0456",
    website: "www.rei.com",
    hours: "Mon-Sat: 10AM-9PM, Sun: 11AM-6PM",
    rating: 4.7,
    reviewCount: 89,
    categories: ["sups"],
    foundedYear: "1938",
    aboutSection: "REI has been inspiring outdoor adventures since 1938, and our Los Angeles location continues that tradition by connecting people with the transformative power of the outdoors. As a co-op, we're owned by our members and driven by a shared passion for outdoor exploration and environmental stewardship.\n\nOur stand-up paddleboard selection represents the best in outdoor water sports equipment. We carry top brands known for their innovation, durability, and performance across various water conditions. From inflatable SUPs perfect for travel and storage to rigid boards designed for performance and touring, our curated selection ensures you'll find the right board for your adventures.\n\nWhat sets REI apart is our commitment to education and community. Our knowledgeable staff aren't just salespeople—they're outdoor enthusiasts who regularly use the gear we sell."
  },
  "the-pow-house": {
    id: "the-pow-house",
    name: "The Pow House",
    description: "Mountain sports headquarters featuring the latest snowboards and skis. From beginner setups to pro-level gear, we've got everything for your winter adventures.",
    imageUrl: "/img/logos/the-pow-house-logo.webp",
    address: "9012 Mountain View Dr, Pasadena, CA 91103",
    phone: "(626) 555-0789",
    website: "www.thepowhouse.com",
    hours: "Mon-Fri: 10AM-8PM, Sat-Sun: 9AM-9PM",
    rating: 4.9,
    reviewCount: 156,
    categories: ["snowboards", "skis"],
    foundedYear: "2010",
    aboutSection: "The Pow House opened in 2010 with a simple mission: to be Southern California's ultimate destination for mountain sports enthusiasts. Located in Pasadena, we serve as the gateway between LA's urban energy and the epic mountain terrain just hours away.\n\nOur snowboard and ski selection is carefully curated to handle everything from the groomers at Mountain High to the backcountry powder of the Eastern Sierra. We carry boards and skis from industry leaders like Burton, Lib Tech, K2, Salomon, and Atomic, as well as boutique brands that push the boundaries of design and performance.\n\nWhat makes The Pow House special is our deep understanding of the unique challenges SoCal riders face. We know you might be surfing in the morning and snowboarding in the afternoon, so we stock versatile, high-performance gear that travels well and performs in varying conditions."
  }
};

const ShopPage = () => {
  const { shopId } = useParams<{ shopId: string; }>();
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
            <p className="text-sm mb-2">Est. {shop.foundedYear}</p>
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
                <CardTitle>About {shop.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">
                  {shop.aboutSection}
                </div>

                <div className="space-y-3 pt-4 border-t">
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
