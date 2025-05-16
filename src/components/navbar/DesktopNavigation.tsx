
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

type DesktopNavigationProps = {
  onOpenSearch: () => void;
};

const DesktopNavigation = ({ onOpenSearch }: DesktopNavigationProps) => {
  return (
    <nav className="hidden items-center space-x-6 lg:flex">
      <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
        Home
      </Link>
      <Link to="/explore" className="text-sm font-medium hover:text-primary transition-colors">
        Explore
      </Link>
      <Link to="/list-gear" className="text-sm font-medium hover:text-primary transition-colors">
        List Your Gear
      </Link>
      <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">
        About
      </Link>
      <button 
        className="flex items-center text-sm font-medium hover:text-primary transition-colors"
        onClick={onOpenSearch}
      >
        <Search className="h-4 w-4 mr-2" />
        <span>Search</span>
      </button>
    </nav>
  );
};

export default DesktopNavigation;
