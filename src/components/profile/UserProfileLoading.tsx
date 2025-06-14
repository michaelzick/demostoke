
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const UserProfileLoading = () => {
  return (
    <div className="min-h-screen">
      {/* Header skeleton that matches UserProfileHeader */}
      <div className="relative">
        {/* Hero background skeleton */}
        <div className="h-64 bg-gradient-to-r from-blue-500 to-cyan-400" />
        
        {/* Content overlay */}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Profile content */}
        <div className="absolute bottom-8 left-0 right-0">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              {/* Avatar skeleton */}
              <Skeleton className="h-32 w-32 rounded-full border-4 border-white" />
              
              {/* Profile info skeleton */}
              <div className="flex-1 text-center md:text-left space-y-2">
                <Skeleton className="h-8 w-48 bg-white/20" />
                <Skeleton className="h-5 w-32 bg-white/20" />
                <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                  <Skeleton className="h-6 w-24 bg-white/20" />
                  <Skeleton className="h-6 w-24 bg-white/20" />
                  <Skeleton className="h-6 w-24 bg-white/20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar skeleton */}
          <div className="lg:col-span-1">
            <Card>
              <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-px w-full" />
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
                <Skeleton className="h-11 w-full" />
              </div>
            </Card>
          </div>
          
          {/* Equipment grid skeleton */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-16" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
