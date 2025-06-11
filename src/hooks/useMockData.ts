
import { useAppSettings } from "@/hooks/useAppSettings";

export const useMockData = () => {
  const { data: appSettings, isLoading } = useAppSettings();

  return {
    showMockData: appSettings?.show_mock_data ?? true, // Default to true while loading
    isLoading
  };
};
