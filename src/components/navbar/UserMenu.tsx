
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/helpers";
import { useIsAdmin } from "@/hooks/useUserRole";

const UserMenu = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { isAdmin, isLoading } = useIsAdmin();

  if (isAuthenticated) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">My Account</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link to="/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link to="/my-gear">My Gear</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link to="/analytics">Analytics</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link to="/bookings">Bookings</Link>
          </DropdownMenuItem>
          {!isLoading && isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/admin">Admin</Link>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="cursor-pointer">Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <Button variant="ghost" asChild>
        <Link to="/auth/signin">Sign In</Link>
      </Button>
      {/* <Button asChild>
        <Link to="/auth/signup">Sign Up</Link>
      </Button> */}
    </>
  );
};

export default UserMenu;
