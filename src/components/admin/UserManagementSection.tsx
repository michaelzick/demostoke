
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus } from "lucide-react";

const UserManagementSection = () => {
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState('');
  const [grantingRole, setGrantingRole] = useState(false);

  const handleGrantAdminRole = async () => {
    if (!userEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter a user email address.",
        variant: "destructive"
      });
      return;
    }

    setGrantingRole(true);
    try {
      // First, find the user by email
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) {
        throw new Error("Unable to fetch users");
      }

      const targetUser = userData.users.find((user: any) => user.email === userEmail.trim());
      
      if (!targetUser) {
        toast({
          title: "User Not Found",
          description: "No user found with that email address.",
          variant: "destructive"
        });
        return;
      }

      // Check if user already has admin role
      const { data: existingRole, error: roleCheckError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', targetUser.id)
        .eq('role', 'admin')
        .single();

      if (existingRole) {
        toast({
          title: "Already Admin",
          description: "This user already has admin privileges.",
          variant: "destructive"
        });
        return;
      }

      // Grant admin role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: targetUser.id,
          role: 'admin',
          assigned_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (insertError) {
        throw insertError;
      }

      toast({
        title: "Admin Role Granted",
        description: `Successfully granted admin privileges to ${userEmail}`,
      });

      setUserEmail('');
    } catch (error: any) {
      console.error('Error granting admin role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to grant admin role. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGrantingRole(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Grant admin privileges to users
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="user-email" className="text-base">
            User Email
          </Label>
          <Input
            id="user-email"
            type="email"
            placeholder="Enter user email address"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            disabled={grantingRole}
          />
          <p className="text-sm text-muted-foreground">
            Enter the email address of the user you want to grant admin privileges to.
          </p>
        </div>
        <Button 
          onClick={handleGrantAdminRole}
          disabled={!userEmail.trim() || grantingRole}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          {grantingRole ? "Granting Admin Role..." : "Grant Admin Role"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UserManagementSection;
