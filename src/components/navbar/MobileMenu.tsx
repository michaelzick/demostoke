
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/helpers";
import { Search, X, User, Package, BarChart3, Calendar, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsAdmin } from "@/hooks/useUserRole";
import MobileExploreMenu from "./MobileExploreMenu";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
}

const MobileMenu = ({ isOpen, onClose, onOpenSearch }: MobileMenuProps) => {
  const { isAuthenticated, logout } = useAuth();
  const { isAdmin, isLoading: isAdminLoading } = useIsAdmin();
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

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20"
        onClick={onClose}
      />

      {/* Menu */}
      <div className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-zinc-900 shadow-lg">
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
          <nav className="flex flex-col p-6 space-y-4 bg-white dark:bg-zinc-900 rounded-bl-md">
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

            {/* My Account Section */}
            {isAuthenticated && (
              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">My Account</h3>
                <div className="flex flex-col gap-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 text-base hover:text-primary transition-colors"
                    onClick={handleLinkClick}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>

                  <Link
                    to="/my-gear"
                    className="flex items-center gap-3 text-base hover:text-primary transition-colors"
                    onClick={handleLinkClick}
                  >
                    <Package className="h-4 w-4" />
                    My Gear
                  </Link>

                  <Link
                    to="/analytics"
                    className="flex items-center gap-3 text-base hover:text-primary transition-colors"
                    onClick={handleLinkClick}
                  >
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                  </Link>

                  <Link
                    to="/bookings"
                    className="flex items-center gap-3 text-base hover:text-primary transition-colors"
                    onClick={handleLinkClick}
                  >
                    <Calendar className="h-4 w-4" />
                    Bookings
                  </Link>

                  {isAdmin && !isAdminLoading && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 text-base hover:text-primary transition-colors"
                      onClick={handleLinkClick}
                    >
                      <Settings className="h-4 w-4" />
                      Admin
                    </Link>
                  )}

                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full justify-start mt-2 text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            )}

            {/* Sign In for non-authenticated users */}
            {!isAuthenticated && (
              <div className="pt-4 border-t">
                <div className="flex flex-col gap-2">
                  <Link
                    to="/auth/signin"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
                    onClick={handleLinkClick}
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
