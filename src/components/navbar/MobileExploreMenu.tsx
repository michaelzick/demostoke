
import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";

type MobileExploreMenuProps = {
  onClose: () => void;
};

const gearCategories = [
  { name: "Snowboards", category: "snowboards" },
  { name: "Skis", category: "skis" },
  { name: "Surfboards", category: "surfboards" },
  { name: "Mountain Bikes", category: "mountain-bikes" },
];

const MobileExploreMenu = ({ onClose }: MobileExploreMenuProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCategoryClick = () => {
    setIsExpanded(false);
    onClose();
  };

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-lg font-medium text-left py-2 text-foreground hover:text-primary transition-colors"
      >
        Explore
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {isExpanded && (
        <div className="pl-4 space-y-2 pb-2">
          <Link
            key={"all"}
            to={`/explore`}
            className="block text-base font-medium py-1 text-foreground hover:text-primary transition-colors"
            onClick={handleCategoryClick}
          >
            All Equipment
          </Link>
          {gearCategories.map((gear) => (
            <Link
              key={gear.category}
              to={`/explore?category=${gear.category}`}
              className="block text-base font-medium py-1 text-foreground hover:text-primary transition-colors"
              onClick={handleCategoryClick}
            >
              {gear.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileExploreMenu;
