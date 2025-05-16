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
}

const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      // setLoading(true);
      // console.log(supabase);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      console.log("Fetched profile data:", data);
      if (!error && data && typeof data === 'object' && 'id' in (data ?? {})) setProfile(data as UserProfile);
      setLoading(false);
    };
    if (userId) fetchProfile();
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
