
import { useState } from "react";
import NavbarLogo from "./navbar/NavbarLogo";
import ThemeSwitcher from "./navbar/ThemeSwitcher";
import DesktopNavigation from "./navbar/DesktopNavigation";
import UserMenu from "./navbar/UserMenu";
import MobileMenuButton from "./navbar/MobileMenuButton";
import MobileMenu from "./navbar/MobileMenu";
import SearchDialog from "./SearchDialog";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-sm">
        <div className="container flex h-20 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <NavbarLogo />
            <ThemeSwitcher />
          </div>

          <MobileMenuButton 
            isOpen={isMenuOpen} 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
          />

          <DesktopNavigation onOpenSearch={() => setIsSearchOpen(true)} />

          <div className="hidden lg:flex items-center gap-4">
            <UserMenu />
          </div>

          <MobileMenu 
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        </div>
      </header>

      <SearchDialog isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;
