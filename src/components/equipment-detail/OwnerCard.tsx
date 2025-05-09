
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StarIcon } from "lucide-react";
import { GearOwner } from "@/types";

interface OwnerCardProps {
  owner: GearOwner;
}

const OwnerCard = ({ owner }: OwnerCardProps) => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarImage src={owner.imageUrl} alt={owner.name} />
          <AvatarFallback>{owner.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h3 className="font-medium truncate">{owner.name}</h3>
          <div className="flex items-center text-sm">
            <StarIcon className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1 flex-shrink-0" />
            <span>{owner.rating}</span>
            {owner.personality && (
              <span className="ml-2 text-xs px-2 py-0.5 bg-slate-100 rounded-full truncate">
                {owner.personality}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="text-sm mb-4">
        <p className="mb-2">Response rate: {owner.responseRate}%</p>
        <p className="text-muted-foreground">
          {owner.memberSince 
            ? `Member since ${owner.memberSince}` 
            : `Member since ${new Date().getFullYear() - Math.floor(Math.random() * 3 + 1)}`}
        </p>
      </div>
      <Button variant="outline" className="w-full" asChild>
        <Link to={`/owner/${owner.id}`}>View Profile</Link>
      </Button>
    </div>
  );
};

export default OwnerCard;
