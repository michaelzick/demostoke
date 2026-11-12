
import { ClientOnlyToaster } from "@/components/ClientOnlyToaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthProvider } from "./contexts/auth/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { GeolocationProvider } from "./contexts/GeolocationContext";
import { SsrPageData, SsrPageDataProvider } from "./contexts/SsrPageDataContext";
import { ClientOnlyClickTracking } from "./components/ClientOnlyClickTracking";
import { ClientOnlyCookieConsent } from "./components/ClientOnlyCookieConsent";
import GoogleTagManager from "./components/GoogleTagManager";
import AppRoutes from "./components/AppRoutes";

interface AppProps {
  initialSsrPageData?: SsrPageData;
}

const App = ({ initialSsrPageData = {} }: AppProps) => {
  // Seeded queries belong to this browser app or this individual SSR request.
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <SsrPageDataProvider value={initialSsrPageData}>
        <ThemeProvider>
          <AuthProvider>
            <FavoritesProvider>
              <GeolocationProvider>
                <TooltipProvider>
                  <ClientOnlyToaster />
                  <ClientOnlyCookieConsent />
                  <ClientOnlyClickTracking />
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
