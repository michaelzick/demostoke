
import { Link } from "react-router-dom";

const NavbarLogo = () => {
  return (
    <Link to="/" className="flex items-center gap-2">
      <img src="/img/demostoke-logo-ds-transparent-cropped.webp" alt="Marker Icon" className="w-6 h-6" />
      <span className="text-xl font-bold">DemoStoke</span>
    </Link>
  );
};

export default NavbarLogo;
