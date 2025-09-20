import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

interface ScrollToTopButtonProps {
  show: boolean;
  onClick: () => void;
}

/**
 * Reusable scroll to top button component
 * Uses the same styling and animation as the blog post
 */
export const ScrollToTopButton = ({ show, onClick }: ScrollToTopButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className={`fixed bottom-6 left-6 z-50 rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
        show
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      size="icon"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
};