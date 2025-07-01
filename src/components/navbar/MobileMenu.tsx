
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/helpers";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileExploreMenu from "./MobileExploreMenu";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
}

const MobileMenu = ({ isOpen, onClose, onOpenSearch }: MobileMenuProps) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleListGearClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
    if (isAuthenticated) {
      navigate("/list-your-gear");
    } else {
      navigate("/auth/signin");
    }
  };

  const handleSearchClick = () => {
    onClose();
    onOpenSearch();
  };

  const handleLinkClick = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="absolute top-0 right-0 h-full w-64 bg-white dark:bg-zinc-900 border-l shadow-lg">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <span className="font-semibold">Menu</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1 h-auto w-auto"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col p-6 space-y-4">
            <Button
              variant="outline"
              onClick={handleSearchClick}
              className="w-full justify-start"
            >
              <Search className="h-4 w-4 mr-2" />
              <span>Search gear...</span>
            </Button>
            
            <Link
              to="/"
              className="text-lg font-medium"
              onClick={handleLinkClick}
            >
              Home
            </Link>
            
            <MobileExploreMenu onClose={onClose} />
            
            <button
              onClick={handleListGearClick}
              className="text-lg font-medium text-left"
            >
              List Your Gear
            </button>
            
            <Link
              to="/demo-calendar"
              className="text-lg font-medium"
              onClick={handleLinkClick}
            >
              Demo Calendar
            </Link>
            
            <Link
              to="/blog"
              className="text-lg font-medium"
              onClick={handleLinkClick}
            >
              Blog
            </Link>
            
            <div className="pt-4 border-t">
              <div className="flex flex-col gap-2">
                {!isAuthenticated && (
                  <Link
                    to="/auth/signin"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
                    onClick={handleLinkClick}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
