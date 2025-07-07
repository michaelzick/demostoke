
import React, { createContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { AuthContextType } from "./types";
import { AuthService } from "./AuthService";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode; }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);

      try {
        // Set up listener for auth state changes first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            console.log("Auth state changed:", event, currentSession?.user?.id);
            setSession(currentSession);

            if (currentSession) {
              // Use setTimeout to avoid potential deadlocks with Supabase auth
              setTimeout(() => {
                handleSessionChange(currentSession);
              }, 0);
            } else {
              setUser(null);
              setIsLoading(false);
            }
          }
        );

        // Then check active session
        console.log("Checking session...");
        const { data, error } = await AuthService.getSession();

        if (error) {
          console.error("Error fetching session:", error);
          setIsLoading(false);
          return;
        }

        console.log("Session check result:", data.session ? "Session found" : "No session");
        setSession(data.session);

        if (data.session) {
          await handleSessionChange(data.session);
        } else {
          setIsLoading(false);
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Auth initialization error:", error);
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const handleSessionChange = async (session: Session) => {
    setIsLoading(true);
    try {
      const userData = await AuthService.fetchUserProfile(session);
      setUser(userData);
    } catch (error) {
      console.error("Error handling session change:", error);
    } finally {
      setIsLoading(false);
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
      setSession(null);

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
        isAuthenticated: !!session,
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
