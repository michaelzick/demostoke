import { useParams } from "react-router-dom";
import { mockEquipment } from "@/lib/mockData";

const GearOwnerProfilePage = () => {
  const { ownerId } = useParams(); // Get the owner ID from the URL
  const ownerEquipment = mockEquipment.filter((item) => item.owner.id === ownerId); // Filter equipment by owner ID
  const owner = ownerEquipment[0]?.owner; // Get owner details from the first item

  if (!owner) {
    return <div>Owner not found.</div>;
  }

  return (
    <div className="container px-4 md:px-6 py-8">
      <div className="flex items-center gap-6 mb-8">
        <img
          src={owner.imageUrl}
          alt={owner.name}
          className="h-24 w-24 rounded-full object-cover"
        />
        <div>
          <h1 className="text-2xl font-bold">{owner.name}</h1>
          <div className="flex items-center text-sm">
            <span className="text-yellow-500 font-medium">{owner.rating} ★</span>
            <span className="ml-4 text-muted-foreground">
              Response Rate: {owner.responseRate}%
            </span>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">Bio</h2>
        <p className="text-sm text-muted-foreground">
          Hi, I'm {owner.name.split(" ")[0]}! I love sharing my gear with others and helping them
          enjoy their adventures. Feel free to reach out if you have any questions!
        </p>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-4">Other Gear Listed</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ownerEquipment.map((item) => (
            <div key={item.id} className="border rounded-lg overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-40 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="font-medium text-sm mb-2">{item.name}</h3>
                <p className="text-xs text-muted-foreground">
                  ${item.pricePerDay}/day
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GearOwnerProfilePage;
