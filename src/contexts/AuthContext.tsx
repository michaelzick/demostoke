
import { createContext, useContext, useState, ReactNode } from "react";
import { User } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const login = async (email: string, password: string) => {
    // This would be integrated with a real auth system (like Supabase)
    try {
      setIsLoading(true);
      // Simulate login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user for demo purposes
      setUser({
        id: "user-1",
        name: "Demo User",
        email,
        imageUrl: "https://api.dicebear.com/6.x/avataaars/svg?seed=demo"
      });
      
      toast({
        title: "Logged in successfully",
        description: "Welcome back to RideLocal!",
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    // This would be integrated with a real auth system
    try {
      setIsLoading(true);
      // Simulate signup
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user for demo purposes
      setUser({
        id: "user-1",
        name,
        email,
        imageUrl: "https://api.dicebear.com/6.x/avataaars/svg?seed=new"
      });
      
      toast({
        title: "Account created",
        description: "Welcome to RideLocal!",
      });
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "There was an error creating your account",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // This would log out from the auth system
    setUser(null);
    toast({
      title: "Logged out",
      description: "You've been logged out successfully",
    });
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
