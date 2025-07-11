import { useEffect } from "react";

/**
 * Scrolls the window to the top when the component mounts.
 */
const useScrollToTop = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
};

export default useScrollToTop;
