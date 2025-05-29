
import { Link } from "react-router-dom";

const NavbarLogo = () => {
  return (
    <Link to="/" className="flex items-center gap-2">
      <img src="/img/demostoke-logo-ds-transparent-cropped.webp" alt="Marker Icon" className="w-8 h-8" />
      <span className="text-2xl font-bold">DemoStoke</span>
    </Link>
  );
};

export default NavbarLogo;
