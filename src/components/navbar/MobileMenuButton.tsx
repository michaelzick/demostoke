
import { Menu, X } from "lucide-react";

type MobileMenuButtonProps = {
  isOpen: boolean;
  onClick: () => void;
};

const MobileMenuButton = ({ isOpen, onClick }: MobileMenuButtonProps) => {
  return (
    <button className="block lg:hidden" onClick={onClick}>
      {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
    </button>
  );
};

export default MobileMenuButton;
