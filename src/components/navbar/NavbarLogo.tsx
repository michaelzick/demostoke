
import { Link } from "react-router-dom";

const NavbarLogo = () => {
  return (
    <Link to="/" className="flex items-center gap-2">
      <img src="/img/demostoke-logo-ds-transparent-cropped.webp" alt="Marker Icon" className="w-10 h-10" />
      <span className="text-3xl font-bold text-primary" style={{ fontFamily: 'Tahoma, sans-serif' }}>DemoStoke</span>
    </Link>
  );
};

export default NavbarLogo;
