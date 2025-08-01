import { useEffect, useState } from "react";
import usePageMetadata from "@/hooks/usePageMetadata";
import { useParams } from "react-router-dom";
import { mockEquipment, ownerPersonas } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";
import CompactEquipmentCard from "@/components/CompactEquipmentCard";
import CategorySelect from "@/components/CategorySelect";
import {
  StarIcon,
  MapPinIcon,
  CalendarIcon,
  UsersIcon,
  GlobeIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const GearOwnerProfilePage = () => {
  usePageMetadata({
    title: "Gear Owner Profile | DemoStoke",
    description: "View information about this gear owner on DemoStoke.",
  });
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { id } = useParams();

  // First try to find the owner in the personas list
  const ownerFromPersonas = ownerPersonas.find((person) => person.id === id);

  // If not found in personas, get it from equipment
  const ownerEquipment = mockEquipment.filter((item) => item.owner.id === id);
  const ownerFromEquipment = ownerEquipment[0]?.owner;

  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    ...new Set(ownerEquipment.map((item) => item.category)),
  ];

  const filteredEquipment = ownerEquipment.filter(
    (item) => selectedCategory === "all" || item.category === selectedCategory,
  );

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
              {/* Adjusted positioning with absolute positioning and z-index */}
              <div className="relative h-12 z-10">
                <Avatar className="h-24 w-24 border-4 border-white absolute -mt-12">
                  <AvatarImage src={owner.imageUrl} alt={owner.name} />
                  <AvatarFallback>{owner.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>

              {/* Increased spacing with padding-top instead of margin-top */}
              <div className="pt-16">
                <div className="flex justify-between items-start">
                  <div className="max-w-[80%]">
                    {" "}
                    {/* Constrain width to prevent overflow */}
                    <h1 className="text-2xl font-bold truncate dark:text-white">
                      {owner.name}
                    </h1>
                    {owner.personality && (
                      <span
                        className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${personalityBadgeColor}`}
                      >
                        {owner.personality}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center bg-yellow-50 text-yellow-700 px-2 py-1 rounded">
                    <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1 flex-shrink-0" />
                    <span className="font-medium">{owner.rating}</span>
                  </div>
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  {owner.location && (
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 text-slate-500 mr-2 flex-shrink-0" />
                      <span className="truncate">{owner.location}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <UsersIcon className="h-4 w-4 text-slate-500 mr-2 flex-shrink-0" />
                    <span>Response Rate: {owner.responseRate}%</span>
                  </div>
                  {owner.memberSince && (
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 text-slate-500 mr-2 flex-shrink-0" />
                      <span>Member since {owner.memberSince}</span>
                    </div>
                  )}
                  {owner.website && (
                    <div className="flex items-center">
                      <GlobeIcon className="h-4 w-4 text-slate-500 mr-2 flex-shrink-0" />
                      <a
                        href={
                          owner.website.startsWith("http")
                            ? owner.website
                            : `https://${owner.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:text-primary underline truncate"
                      >
                        {owner.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="w-full md:w-2/3">
          <h2 className="text-lg font-medium mb-4 dark:text-white">About</h2>
          <Card>
            <CardContent className="p-6">
              <div className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">
                {owner.bio ||
                  `Hi, I'm ${owner.name.split(" ")[0]}! I love sharing my gear with others and helping them enjoy their adventures. Feel free to reach out if you have any questions!`}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-8" />

      <div>
        <h2 className="text-xl font-medium mb-6 dark:text-white">
          Available Gear
        </h2>
        {ownerEquipment.length === 0 ? (
          <p className="text-muted-foreground dark:text-white">
            No gear currently listed.
          </p>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex gap-4">
                <CategorySelect
                  selected={selectedCategory}
                  onChange={setSelectedCategory}
                  categories={categories}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEquipment.map((item) => (
                <CompactEquipmentCard key={item.id} equipment={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Helper function to get personality badge color
function getPersonalityColor(personality?: string): string {
  switch (personality) {
    case "Super Gear Lender":
      return "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 font-semibold";
    case "Weekend Warrior":
      return "bg-blue-100 text-blue-800";
    case "Nomadic Renter":
      return "bg-green-100 text-green-800";
    case "Local Shop Owner":
      return "bg-amber-100 text-amber-800";
    case "Gear Lender":
      return "bg-purple-100 text-purple-800";
    case "Quiver Lender":
      return "bg-rose-100 text-rose-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
}

export default GearOwnerProfilePage;
