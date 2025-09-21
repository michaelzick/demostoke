import { useState, useEffect } from "react";

interface UseScrollToTopButtonOptions {
  threshold?: number;
  containerRef?: React.RefObject<HTMLElement>;
}

/**
 * Hook that manages scroll-to-top button visibility and functionality
 * @param options Configuration options
 * @returns Object with showButton state and scrollToTop function
 */
export const useScrollToTopButton = (options: UseScrollToTopButtonOptions = {}) => {
  const { threshold = 300, containerRef } = options;
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef?.current) {
        // For container-specific scrolling
        setShowButton(containerRef.current.scrollTop > threshold);
      } else {
        // For window scrolling
        setShowButton(window.scrollY > threshold);
      }
    };

    
    if (containerRef?.current) {
      containerRef.current.addEventListener('scroll', handleScroll);
    } else {
      window.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (containerRef?.current) {
        containerRef.current.removeEventListener('scroll', handleScroll);
      } else {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [threshold, containerRef]);

  const scrollToTop = () => {
    if (containerRef?.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return { showButton, scrollToTop };
};