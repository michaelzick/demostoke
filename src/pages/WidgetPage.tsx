import { useEffect } from "react";
import { DemoStokeWidget } from "@/components/DemoStokeWidget";

const WidgetPage = () => {
  useEffect(() => {
    // Add noindex meta tag
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);

    return () => {
      // Clean up on unmount
      document.head.removeChild(meta);
    };
  }, []);

  return (
    <section className="w-full px-4 py-6 md:px-6">
      <div className="mx-auto w-full max-w-7xl">
        <DemoStokeWidget />
      </div>
    </section>
  );
};

export default WidgetPage;
