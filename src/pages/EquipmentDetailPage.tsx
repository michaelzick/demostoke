
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { StarIcon, Calendar, MessageSquare, MapPin } from "lucide-react";
import { mockEquipment } from "@/lib/mockData";
import { useEffect, useMemo } from "react";
import MapComponent from "@/components/MapComponent";

const EquipmentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  
  const equipment = useMemo(() => 
    mockEquipment.find(item => item.id === id) || mockEquipment[0], 
    [id]
  );
  
  // Similar equipment (same category)
  const similarEquipment = useMemo(() => 
    mockEquipment
      .filter(item => item.category === equipment.category && item.id !== equipment.id)
      .slice(0, 3),
    [equipment]
  );

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Today";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="container px-4 md:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image Gallery */}
          <div className="overflow-hidden rounded-lg">
            <img 
              src={equipment.imageUrl} 
              alt={equipment.name}
              className="w-full h-96 object-cover"
            />
          </div>
          
          {/* Equipment Info */}
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{equipment.name}</h1>
                <div className="flex items-center gap-2 mb-2">
                  <Badge>{equipment.category}</Badge>
                  <div className="flex items-center text-sm">
                    <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                    <span>{equipment.rating}</span>
                    <span className="text-muted-foreground ml-1">({equipment.reviewCount} reviews)</span>
                  </div>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{equipment.location.name}</span>
                  <span className="mx-2">•</span>
                  <span>{equipment.distance} miles away</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">${equipment.pricePerDay}</div>
                <div className="text-sm text-muted-foreground">per day</div>
              </div>
            </div>
            
            <p className="text-lg mb-6">{equipment.description}</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Size</div>
                <div className="font-medium">{equipment.specifications.size}</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Weight</div>
                <div className="font-medium">{equipment.specifications.weight}</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Material</div>
                <div className="font-medium">{equipment.specifications.material}</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Suitable For</div>
                <div className="font-medium">{equipment.specifications.suitable}</div>
              </div>
            </div>
          </div>
          
          {/* Tabs for Additional Information */}
          <Tabs defaultValue="location">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="policy">Policies</TabsTrigger>
            </TabsList>
            <TabsContent value="location" className="pt-4">
              <div className="h-80 rounded-lg overflow-hidden mb-4">
                <MapComponent 
                  equipment={[equipment]} 
                  activeCategory={null}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Exact location provided after booking confirmation.
              </p>
            </TabsContent>
            <TabsContent value="reviews" className="pt-4 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <StarIcon className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="text-lg font-medium">{equipment.rating}</span>
                <span className="text-muted-foreground">• {equipment.reviewCount} reviews</span>
              </div>
              
              {/* Sample reviews */}
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-b pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://api.dicebear.com/6.x/avataaars/svg?seed=review-${i}`} alt="Avatar" />
                        <AvatarFallback>RV</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">Reviewer {i}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center mb-2">
                      {Array(5).fill(0).map((_, j) => (
                        <StarIcon 
                          key={j} 
                          className={`h-4 w-4 ${j < 5 - i * 0.5 ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`} 
                        />
                      ))}
                    </div>
                    <p className="text-sm">
                      {i === 1 ? 
                        "Amazing equipment! Exactly as described and in excellent condition. The owner was friendly and provided some great local tips." :
                        i === 2 ?
                        "Good experience overall. The equipment was well maintained and worked great. Would demo again!" :
                        "Decent experience. Equipment was a bit worn but functioned well. Owner was responsive and helpful."
                      }
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="policy" className="pt-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Cancellation Policy</h3>
                  <p className="text-sm text-muted-foreground">
                    Full refund if canceled at least 24 hours before the scheduled demo time.
                    50% refund if canceled between 12-24 hours before the demo.
                    No refund for cancellations less than 12 hours before.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Insurance</h3>
                  <p className="text-sm text-muted-foreground">
                    Equipment is covered under RideLocal's insurance policy during the demo period.
                    Renters are responsible for any damage beyond normal wear and tear.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Safety Guidelines</h3>
                  <p className="text-sm text-muted-foreground">
                    All renters must have appropriate experience level for the equipment.
                    Follow local regulations and safety guidelines during use.
                    Always wear appropriate safety equipment.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Booking Card */}
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Book a Demo</h3>
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl font-bold">${equipment.pricePerDay}</div>
                <div className="text-sm text-muted-foreground">per day</div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center text-sm mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    {equipment.availability.available 
                      ? "Available now" 
                      : `Available from ${formatDate(equipment.availability.nextAvailableDate)}`
                    }
                  </span>
                </div>
              </div>
            </div>
            
            <Button className="w-full mb-4" disabled={!equipment.availability.available}>
              {equipment.availability.available ? "Request Demo" : "Not Available"}
            </Button>
            
            <Button variant="outline" className="w-full">
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Owner
            </Button>
          </Card>
          
          {/* Owner Info */}
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={equipment.owner.imageUrl} alt="Avatar" />
                <AvatarFallback>{equipment.owner.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{equipment.owner.name}</h3>
                <div className="flex items-center text-sm">
                  <StarIcon className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                  <span>{equipment.owner.rating}</span>
                </div>
              </div>
            </div>
            <div className="text-sm mb-4">
              <p className="mb-2">Response rate: {equipment.owner.responseRate}%</p>
              <p className="text-muted-foreground">Member since {new Date().getFullYear() - Math.floor(Math.random() * 3 + 1)}</p>
            </div>
            <Button variant="outline" className="w-full">View Profile</Button>
          </Card>
          
          {/* Similar Equipment */}
          <div>
            <h3 className="font-medium mb-3">Similar Equipment</h3>
            <div className="space-y-4">
              {similarEquipment.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="flex h-24">
                    <div className="w-1/3">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="w-2/3 p-3 flex flex-col justify-between">
                      <div>
                        <h4 className="font-medium text-sm mb-1 truncate">{item.name}</h4>
                        <div className="flex items-center text-xs">
                          <StarIcon className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                          <span>{item.rating}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">${item.pricePerDay}/day</span>
                        <Button variant="ghost" size="sm" asChild className="text-xs p-0 h-auto">
                          <Link to={`/equipment/${item.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetailPage;
