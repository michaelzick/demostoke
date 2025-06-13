
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useAuth } from "@/helpers";
import SquiggleUnderline from "./SquiggleUnderline";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useState } from "react";

type DesktopNavigationProps = {
  onOpenSearch: () => void;
};

const gearCategories = [
  { name: "Snowboards", category: "snowboards" },
  { name: "Skis", category: "skis" },
  { name: "Surfboards", category: "surfboards" },
  { name: "SUPs", category: "sups" },
  { name: "Mountain Bikes", category: "mountain-bikes" },
];

const DesktopNavigation = ({ onOpenSearch }: DesktopNavigationProps) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isExploreOpen, setIsExploreOpen] = useState(false);

  const handleListGearClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate("/list-your-gear");
    } else {
      navigate("/auth/signin");
    }
  };

  const handleCategoryClick = () => {
    setIsExploreOpen(false);
  };

  return (
    <nav className="hidden items-center space-x-8 lg:flex">
      <Link to="/" className="relative group text-base font-medium hover:text-primary transition-colors py-2">
        Home
        <SquiggleUnderline />
      </Link>

      <NavigationMenu value={isExploreOpen ? "explore" : ""} onValueChange={(value) => setIsExploreOpen(value === "explore")}>
        <NavigationMenuList>
          <NavigationMenuItem value="explore">
            <NavigationMenuTrigger className="relative group text-base font-medium hover:text-primary transition-colors py-2 bg-transparent hover:bg-transparent focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent">
              Explore
              <SquiggleUnderline />
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-48 gap-1 p-2 bg-background border rounded-md shadow-lg">
                <Link
                  key={"all"}
                  to={`/explore`}
                  className="block px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-sm transition-colors"
                  onClick={handleCategoryClick}
                >
                  All Equipment
                </Link>
                {gearCategories.map((gear) => (
                  <Link
                    key={gear.category}
                    to={`/explore?category=${gear.category}`}
                    className="block px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-sm transition-colors"
                    onClick={handleCategoryClick}
                  >
                    {gear.name}
                  </Link>
                ))}
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <button
        onClick={handleListGearClick}
        className="relative group text-base font-medium hover:text-primary transition-colors py-2"
      >
        List Your Gear
        <SquiggleUnderline />
      </button>
      <Link to="/about" className="relative group text-base font-medium hover:text-primary transition-colors py-2">
        About
        <SquiggleUnderline />
      </Link>
      <Link to="/blog" className="relative group text-base font-medium hover:text-primary transition-colors py-2">
        Blog
        <SquiggleUnderline />
      </Link>
      <button
        className="relative group flex items-center text-base font-medium hover:text-primary transition-colors py-2"
        onClick={onOpenSearch}
      >
        <Search className="h-4 w-4 mr-2" />
        <span>Search</span>
        <SquiggleUnderline />
      </button>
    </nav>
  );
};

export default DesktopNavigation;
