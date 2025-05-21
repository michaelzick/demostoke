
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useAuth } from "@/helpers";

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
};

const MobileMenu = ({ isOpen, onClose, onOpenSearch }: MobileMenuProps) => {
  const { isAuthenticated, logout } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 top-16 z-50 bg-background lg:hidden">
      <nav className="flex flex-col p-6 space-y-4 bg-white dark:bg-zinc-900">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => {
            onOpenSearch();
            onClose();
          }}
        >
          <Search className="h-4 w-4 mr-2" />
          <span>Search gear...</span>
        </Button>

        <Link
          to="/"
          className="text-lg font-medium"
          onClick={onClose}
        >
          Home
        </Link>
        <Link
          to="/explore"
          className="text-lg font-medium"
          onClick={onClose}
        >
          Explore
        </Link>
        <Link
          to="/about"
          className="text-lg font-medium"
          onClick={onClose}
        >
          About
        </Link>
        <div className="pt-4 border-t">
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="block py-2 text-lg font-medium cursor-pointer"
                onClick={onClose}
              >
                Profile
              </Link>
              <Link
                to="/my-gear"
                className="block py-2 text-lg font-medium cursor-pointer"
                onClick={onClose}
              >
                My Gear
              </Link>
              <Link
                to="/analytics"
                className="block py-2 text-lg font-medium cursor-pointer"
                onClick={onClose}
              >
                Analytics
              </Link>
              <Link
                to="/bookings"
                className="block py-2 text-lg font-medium cursor-pointer"
                onClick={onClose}
              >
                Bookings
              </Link>
              <button
                className="block py-2 text-lg font-medium text-destructive cursor-pointer"
                onClick={() => { logout(); onClose(); }}
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full"
                asChild
                onClick={onClose}
              >
                <Link to="/auth/signin">Sign In</Link>
              </Button>
              <Button
                className="w-full"
                asChild
                onClick={onClose}
              >
                <Link to="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default MobileMenu;
