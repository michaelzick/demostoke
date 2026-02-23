
import React, { createContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { AuthContextType } from "./types";
import { AuthService } from "./AuthService";
import { getLocalFavorites, mergeFavoritesArrays } from "@/services/localStorageFavoritesService";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode; }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSessionChange = async (
    session: Session,
    options: { showLoading?: boolean; syncLocalData?: boolean } = {}
  ) => {
    const { showLoading = true, syncLocalData = true } = options;

    if (showLoading) {
      setIsLoading(true);
    }

    try {
      const userData = await AuthService.fetchUserProfile(session);
      setUser(userData);
      setIsAuthenticated(true);

      // Sync localStorage data to database only on true sign-in or initial load.
      if (syncLocalData) {
        setTimeout(() => {
          syncLocalRVIToDatabase(session.user.id);
          syncLocalFavoritesToDatabase(session.user.id);
        }, 0);
      }
    } catch (error) {
      console.error("Error handling session change:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;

    let isActive = true;

    // Set up listener for auth state changes first.
    // Important: TOKEN_REFRESHED fires on tab refocus; avoid toggling global loading for that.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!isActive) return;

        setIsAuthenticated(!!currentSession);

        if (!currentSession) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        if (event === "SIGNED_IN") {
          setTimeout(() => {
            if (!isActive) return;
            handleSessionChange(currentSession, {
              showLoading: false,
              syncLocalData: true,
            });
          }, 0);
          return;
        }

        if (event === "USER_UPDATED") {
          setTimeout(() => {
            if (!isActive) return;
            handleSessionChange(currentSession, {
              showLoading: false,
              syncLocalData: false,
            });
          }, 0);
        }
      }
    );

    const initAuth = async () => {
      setIsLoading(true);

      try {
        // Then check active session.
        const { data, error } = await AuthService.getSession();

        if (!isActive) return;

        if (error) {
          console.error("Error fetching session:", error);
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const currentSession = data.session;
        setIsAuthenticated(!!currentSession);

        if (currentSession) {
          await handleSessionChange(currentSession, {
            showLoading: false,
            syncLocalData: true,
          });
        } else {
          setUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [mounted]);

  const syncLocalRVIToDatabase = async (userId: string) => {
    try {
      // Dynamically import to avoid issues during SSR
      const { getLocalRVI, mergeRVIArrays } = await import("@/services/localStorageRVIService");
      
      const localRVI = getLocalRVI();
      if (localRVI.length === 0) return;
      
      // Fetch current database RVI
      const { data: profile } = await supabase
        .from('profiles')
        .select('recently_viewed_equipment')
        .eq('id', userId)
        .single();
      
      const dbRVI = (profile?.recently_viewed_equipment || []) as Array<{
        equipment_id: string;
        viewed_at: string;
      }>;
      
      // Merge (local items take precedence for duplicates)
      const merged = mergeRVIArrays(localRVI, dbRVI);
      
      // Update database
      await supabase
        .from('profiles')
        .update({ recently_viewed_equipment: merged as any })
        .eq('id', userId);
      
      // Keep localStorage (Option B) - provides fallback on logout
      console.log('✅ Synced localStorage RVI to database');
    } catch (error) {
      console.error('Error syncing localStorage RVI:', error);
    }
  };

  const syncLocalFavoritesToDatabase = async (userId: string) => {
    try {
      const localFavorites = getLocalFavorites();
      
      if (localFavorites.length === 0) return;
      
      // Fetch current DB favorites
      const { data: profile } = await supabase
        .from('profiles')
        .select('favorite_equipment')
        .eq('id', userId)
        .single();
      
      const dbFavorites = Array.isArray(profile?.favorite_equipment) 
        ? (profile.favorite_equipment as any[])
        : [];
      
      // Merge (local items take precedence for duplicates)
      const merged = mergeFavoritesArrays(localFavorites, dbFavorites);
      
      // Update database
      await supabase
        .from('profiles')
        .update({ favorite_equipment: merged as any })
        .eq('id', userId);
      
      console.log('✅ Synced localStorage favorites to database');
    } catch (error) {
      console.error('Error syncing localStorage favorites:', error);
    }
  };

  const login = async (email: string, password: string, recaptchaToken?: string) => {
    try {
      setIsLoading(true);
      await AuthService.loginWithEmailPassword(email, password, recaptchaToken);
      
      toast({
        title: "Logged in successfully",
        description: "Welcome back to DemoStoke!",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Invalid email or password";
      toast({
        title: "Login failed",
        description: message,
        variant: "destructive",
      });
      // Make sure we reset loading state on error
      setIsLoading(false);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string, recaptchaToken?: string) => {
    try {
      setIsLoading(true);
      await AuthService.signupWithEmailPassword(name, email, password, recaptchaToken);

      toast({
        title: "Account created",
        description: "Welcome to DemoStoke!",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "There was an error creating your account";
      toast({
        title: "Signup failed",
        description: message,
        variant: "destructive",
      });
      // Make sure we reset loading state on error
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await AuthService.logout();

      // Clear user state immediately
      setUser(null);
      setIsAuthenticated(false);

      toast({
        title: "Logged out",
        description: "You've been logged out successfully",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "There was a problem logging out";
      toast({
        title: "Error logging out",
        description: message,
        variant: "destructive",
      });
    } finally {
      // Always reset loading state for logout
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
