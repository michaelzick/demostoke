
import { useAppSettings } from "@/hooks/useAppSettings";

export const useMockData = () => {
  const { data: appSettings, isLoading } = useAppSettings();

  const showMockData = appSettings?.show_mock_data ?? true; // Default to true while loading
  
  // Add logging to track what's being returned
  console.log('🎭 useMockData hook result:', { showMockData, isLoading });

  return {
    showMockData,
    isLoading
  };
};
