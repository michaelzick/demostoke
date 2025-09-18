// Update this page (the content is just a fallback if you fail to update the page)
import usePageMetadata from "@/hooks/usePageMetadata";

// trigger build comment

const Index = () => {
  usePageMetadata({
    title: 'DemoStoke | Find it. Ride it. Love it? Buy it.',
    description: 'DemoStoke is the go-to platform to find, try, and buy the gear you\'ll eventually fall in love with.'
  });
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
