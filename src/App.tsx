
import { ClientOnlyToaster } from "@/components/ClientOnlyToaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/auth/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { GeolocationProvider } from "./contexts/GeolocationContext";
import { SsrPageData, SsrPageDataProvider } from "./contexts/SsrPageDataContext";
import { ClientOnlyAmplitudeInit } from "./components/ClientOnlyAmplitudeInit";
import GoogleTagManager from "./components/GoogleTagManager";
import AppRoutes from "./components/AppRoutes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

interface AppProps {
  initialSsrPageData?: SsrPageData;
}

const App = ({ initialSsrPageData = {} }: AppProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <SsrPageDataProvider value={initialSsrPageData}>
        <ThemeProvider>
          <AuthProvider>
            <FavoritesProvider>
              <GeolocationProvider>
                <TooltipProvider>
                  <ClientOnlyToaster />
                  <ClientOnlyAmplitudeInit />
                  <GoogleTagManager />
                  <AppRoutes />
                </TooltipProvider>
              </GeolocationProvider>
            </FavoritesProvider>
          </AuthProvider>
        </ThemeProvider>
      </SsrPageDataProvider>
    </QueryClientProvider>
  );
};

export default App;
