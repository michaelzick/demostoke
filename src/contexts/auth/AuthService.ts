
import { Session } from "@supabase/supabase-js";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export class AuthService {
  static async loginWithEmailPassword(email: string, password: string, recaptchaToken?: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        captchaToken: recaptchaToken,
      },
    });

    if (error) throw error;
    return data;
  }

  static async signupWithEmailPassword(name: string, email: string, password: string, recaptchaToken?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
        captchaToken: recaptchaToken,
      },
    });

    if (error) throw error;
    return data;
  }

  static async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async getSession() {
    return await supabase.auth.getSession();
  }

  static async fetchUserProfile(session: Session): Promise<User> {
    // Get user profile data
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error("Profile fetch error:", error);
      // Even if profile fetch fails, we can still set basic user info from session
      return {
        id: session.user.id,
        name: session.user.user_metadata?.name || 'User',
        email: session.user.email || '',
        imageUrl: null
      };
    }

    console.log("Profile data fetched:", data);

    // Return user data
    return {
      id: session.user.id,
      name: data.name || session.user.user_metadata?.name || 'User',
      email: session.user.email || '',
      imageUrl: data.avatar_url
    };
  }
}
