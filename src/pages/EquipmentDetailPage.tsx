
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockEquipment } from "@/lib/mockData";
import { useEffect, useMemo } from "react";
import { Equipment } from "@/types";

// Import new component modules
import BookingCard from "@/components/equipment-detail/BookingCard";
import EquipmentHeader from "@/components/equipment-detail/EquipmentHeader";
import EquipmentSpecs from "@/components/equipment-detail/EquipmentSpecs";
import LocationTab from "@/components/equipment-detail/LocationTab";
import ReviewsTab from "@/components/equipment-detail/ReviewsTab";
import PolicyTab from "@/components/equipment-detail/PolicyTab";
import OwnerCard from "@/components/equipment-detail/OwnerCard";
import SimilarEquipment from "@/components/equipment-detail/SimilarEquipment";

const EquipmentDetailPage = () => {
  const { id } = useParams<{ id: string; }>();

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
            <EquipmentHeader equipment={equipment} />
            <p className="text-lg mb-6">{equipment.description}</p>
            <EquipmentSpecs specifications={equipment.specifications} />
          </div>

          {/* Tabs for Additional Information */}
          <Tabs defaultValue="location">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="policy">Policies</TabsTrigger>
            </TabsList>
            <TabsContent value="location">
              <LocationTab equipment={equipment} />
            </TabsContent>
            <TabsContent value="reviews">
              <ReviewsTab rating={equipment.rating} reviewCount={equipment.reviewCount} />
            </TabsContent>
            <TabsContent value="policy">
              <PolicyTab />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Booking Card */}
          <Card className="p-6">
            <BookingCard equipment={equipment} />
          </Card>

          {/* Owner Info */}
          <Card>
            <OwnerCard owner={equipment.owner} />
          </Card>

          {/* Similar Equipment */}
          <SimilarEquipment similarEquipment={similarEquipment} />
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetailPage;
