
import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarIcon, MapPinIcon, MessageCircleIcon, CalendarIcon } from "lucide-react";
import EquipmentCard from "@/components/EquipmentCard";
import { mockEquipment } from "@/lib/mockData";
import { Equipment } from "@/types";

interface PrivateParty {
  id: string;
  name: string;
  bio: string;
  imageUrl: string;
  location: string;
  memberSince: string;
  rating: number;
  responseRate: number;
  categories: string[];
  personality: string;
}

const privateParties: { [key: string]: PrivateParty } = {
  "skate-collective": {
    id: "skate-collective",
    name: "LA Skate Collective",
    bio: "A group of skateboard enthusiasts sharing our collection with the community. We've been collecting boards for over 10 years and love helping others find the perfect setup. All our gear is well-maintained and comes with local spot recommendations!",
    imageUrl: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?auto=format&fit=crop&w=300&q=80",
    location: "Various locations in LA",
    memberSince: "2020",
    rating: 4.6,
    responseRate: 94,
    categories: ["skateboards"],
    personality: "Community Collective"
  }
};

const PrivatePartyPage = () => {
  const { partyId } = useParams<{ partyId: string }>();
  const party = partyId ? privateParties[partyId] : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!party) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Private Party Not Found</h1>
          <p className="text-muted-foreground mb-4">The private party you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/explore">Back to Explore</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Filter equipment for this private party based on categories
  const partyEquipment = mockEquipment.filter(item => 
    party.categories.includes(item.category)
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6">
            <img
              src={party.imageUrl}
              alt={party.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <div>
              <h1 className="text-4xl font-bold mb-2">{party.name}</h1>
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-1">
                  <StarIcon className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-lg font-medium">{party.rating}</span>
                </div>
                <Badge variant="secondary">{party.responseRate}% response rate</Badge>
                <Badge variant="outline">{party.personality}</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{party.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>Member since {party.memberSince}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Party Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircleIcon className="h-5 w-5" />
                  About {party.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">{party.bio}</p>
                
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="font-medium">Response Rate</span>
                    <span>{party.responseRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Rating</span>
                    <div className="flex items-center gap-1">
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span>{party.rating}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Member Since</span>
                    <span>{party.memberSince}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Specializes In</span>
                    <div className="flex gap-1">
                      {party.categories.map((category) => (
                        <Badge key={category} variant="secondary" className="text-xs capitalize">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Button className="w-full" size="lg">
                  <MessageCircleIcon className="h-4 w-4 mr-2" />
                  Contact {party.name}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Equipment Grid */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Available Equipment</h2>
              <Badge variant="outline">{partyEquipment.length} items</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {partyEquipment.map((equipment) => (
                <EquipmentCard key={equipment.id} equipment={equipment} />
              ))}
            </div>
            
            {partyEquipment.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">No equipment available</h3>
                <p className="text-muted-foreground">
                  This private party doesn't have any equipment listed at the moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivatePartyPage;
