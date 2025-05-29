
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useAuth } from "@/helpers";
import SquiggleUnderline from "./SquiggleUnderline";

type DesktopNavigationProps = {
  onOpenSearch: () => void;
};

const DesktopNavigation = ({ onOpenSearch }: DesktopNavigationProps) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleListGearClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate("/list-gear");
    } else {
      navigate("/auth/signin");
    }
  };

  return (
    <nav className="hidden items-center space-x-8 lg:flex">
      <Link to="/" className="relative group text-base font-medium hover:text-primary transition-colors py-2">
        Home
        <SquiggleUnderline />
      </Link>
      <Link to="/explore" className="relative group text-base font-medium hover:text-primary transition-colors py-2">
        Explore
        <SquiggleUnderline />
      </Link>
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
