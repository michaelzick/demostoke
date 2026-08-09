
import { useEffect } from 'react';
import { initializeClickTracking } from "@/utils/clickTracking";

export const ClientOnlyClickTracking = () => {
  useEffect(() => {
    initializeClickTracking();
  }, []);

  return null;
};
