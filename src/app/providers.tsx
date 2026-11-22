'use client';

import { NavigationObserver } from '@/lib/navigation';
import { isProduction } from '@/lib/deployment';
import { ClientOnlyToaster } from "@/components/ClientOnlyToaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import { AuthProvider } from "@/contexts/auth/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { GeolocationProvider } from "@/contexts/GeolocationContext";
import { ClientOnlyClickTracking } from "@/components/ClientOnlyClickTracking";
import { ClientOnlyCookieConsent } from "@/components/ClientOnlyCookieConsent";
import GoogleTagManager from "@/components/GoogleTagManager";

import { reportWebVitals } from '@/lib/vitals';

export default function Providers({ children }: { children: ReactNode }) {
  // Seeded queries belong to this browser app or this individual SSR request.
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
      },
    },
  }));

  useEffect(() => {
    if (isProduction) reportWebVitals();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <FavoritesProvider>
            <GeolocationProvider>
              <TooltipProvider>
                <Suspense fallback={null}><NavigationObserver /></Suspense>
                <ClientOnlyToaster />
                <ClientOnlyCookieConsent />
                {isProduction && <ClientOnlyClickTracking />}
                {isProduction && <GoogleTagManager />}
                {children}
              </TooltipProvider>
            </GeolocationProvider>
          </FavoritesProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
