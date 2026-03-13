// Update this page (the content is just a fallback if you fail to update the page)
import usePageMetadata from "@/hooks/usePageMetadata";
import { PUBLIC_ROUTE_META } from "@/lib/seo/publicMetadata";

const Index = () => {
  usePageMetadata(PUBLIC_ROUTE_META["/"]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Your Blank App</h1>
        <p className="text-xl text-gray-600">Start building your amazing project here!</p>
      </div>
    </div>
  );
};

export default Index;
