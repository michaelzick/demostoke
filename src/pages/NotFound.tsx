
import { useEffect } from "react";
import usePageMetadata from "@/hooks/usePageMetadata";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

const NotFound = () => {
  usePageMetadata({
    title: 'Page Not Found | DemoStoke',
    description: 'The page you are looking for does not exist.'
  });
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-ocean-light p-4 rounded-full">
            <MapPin className="h-12 w-12 text-ocean-deep" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-2">Page Not Found</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Looks like you've ventured off the map. The page you're looking for doesn't exist.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link to="/">Back to Home</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link to="/explore">Explore Equipment</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
