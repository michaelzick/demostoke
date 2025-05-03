
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set up listener for auth state changes first
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        
        if (currentSession) {
          await fetchUserProfile(currentSession);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );
    
    // Then check active session
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error fetching session:", error);
          setIsLoading(false);
          return;
        }
        
        setSession(data.session);
        
        if (data.session) {
          await fetchUserProfile(data.session);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Session check failed:", error);
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  const fetchUserProfile = async (session: Session) => {
    setIsLoading(true);
    
    try {
      // Get user profile data
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        console.error("Profile fetch error:", error);
        // Even if profile fetch fails, we can still set basic user info from session
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || 'User',
          email: session.user.email || '',
          imageUrl: null
        });
        return;
      }
      
      // Set user data in state
      setUser({
        id: session.user.id,
        name: data.name || session.user.user_metadata?.name || 'User',
        email: session.user.email || '',
        imageUrl: data.avatar_url
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Fallback to basic user info if profile fetch fails
      setUser({
        id: session.user.id,
        name: session.user.user_metadata?.name || 'User',
        email: session.user.email || '',
        imageUrl: null
      });
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Logged in successfully",
        description: "Welcome back to RideLocal!",
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Account created",
        description: "Welcome to RideLocal!",
      });
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "There was an error creating your account",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast({
        title: "Logged out",
        description: "You've been logged out successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error logging out",
        description: error.message || "There was a problem logging out",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
