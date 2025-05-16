import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
  user_id?: string;
}

const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string; }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        console.error('[UserProfilePage] No userId in URL params');
        setProfile(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      // Always fetch the profile for the userId from the URL
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) {
        console.error('[UserProfilePage] Supabase error:', error);
      }
      if (!error && data && typeof data === 'object' && ('id' in (data ?? {}))) {
        const cacheKey = `user-profile-${data.id}`;
        setProfile(data as UserProfile);
        localStorage.setItem(cacheKey, JSON.stringify(data));
        console.debug('[UserProfilePage] Set cache:', cacheKey, data);
        setLoading(false);
        return;
      }
      // If not found in Supabase, try localStorage as fallback
      const cacheKey = `user-profile-${userId}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === 'object' && parsed.id === userId) {
            setProfile(parsed as UserProfile);
            console.debug('[UserProfilePage] Loaded from cache:', cacheKey, parsed);
            setLoading(false);
            return;
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
      setProfile(null);
      setLoading(false);
    };
    fetchProfile();
  }, [userId]);

  if (loading) return <div className="container px-4 py-8">Loading...</div>;
  if (!profile) return <div className="container px-4 py-8">User not found.</div>;

  return (
    <div className="container px-4 md:px-6 py-8 max-w-xl mx-auto">
      <Card>
        <CardContent className="p-8 flex flex-col items-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={profile.avatar_url || undefined} alt={profile.first_name || "User"} />
            <AvatarFallback>{profile.first_name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold mb-2 dark:text-white">
            {[profile.first_name, profile.last_name].filter(Boolean).join(" ")}
          </h1>
          <div className="w-full text-center space-y-2">
            <div className="text-muted-foreground dark:text-white">{profile.email || ""}</div>
            <div className="text-muted-foreground dark:text-white">{profile.phone || ""}</div>
            <div className="text-muted-foreground dark:text-white">{profile.address || ""}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfilePage;
