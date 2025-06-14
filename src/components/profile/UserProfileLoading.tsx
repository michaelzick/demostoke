
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const UserProfileLoading = () => {
  return (
    <div className="container px-4 md:px-6 py-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
        <div className="w-full md:w-1/3">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-24"></div>
            <div className="px-6 pb-6 relative">
              <Skeleton className="h-24 w-24 rounded-full absolute -mt-12" />
              <div className="pt-16 space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </Card>
        </div>
        <div className="w-full md:w-2/3">
          <Skeleton className="h-6 w-20 mb-4" />
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
