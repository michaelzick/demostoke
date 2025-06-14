
import { Button } from "@/components/ui/button";

export const UserProfileNotFound = () => {
  return (
    <div className="container px-4 py-8">
      <div className="text-center py-20">
        <h2 className="text-xl font-medium mb-2">Profile not found</h2>
        <p className="text-muted-foreground mb-6">
          This user profile doesn't exist or you don't have permission to view it.
        </p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    </div>
  );
};
