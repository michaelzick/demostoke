
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
    <div className="lg:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="fixed top-0 right-0 z-50 h-full w-64 bg-background border-l shadow-lg">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <span className="font-semibold">Menu</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="space-y-1 px-4">
              <Link
                to="/"
                className="block py-2 text-base font-medium hover:text-primary transition-colors"
                onClick={handleLinkClick}
              >
                Home
              </Link>
              
              <MobileExploreMenu onClose={onClose} />
              
              <button
                onClick={handleListGearClick}
                className="block w-full text-left py-2 text-base font-medium hover:text-primary transition-colors"
              >
                List Your Gear
              </button>
              
              <Link
                to="/demo-calendar"
                className="block py-2 text-base font-medium hover:text-primary transition-colors"
                onClick={handleLinkClick}
              >
                Demo Calendar
              </Link>
              
              <Link
                to="/blog"
                className="block py-2 text-base font-medium hover:text-primary transition-colors"
                onClick={handleLinkClick}
              >
                Blog
              </Link>
              
              <button
                onClick={handleSearchClick}
                className="flex items-center w-full py-2 text-base font-medium hover:text-primary transition-colors"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
