
import { lazy, Suspense } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

const AnalyticsPage = lazy(() => import("./AnalyticsPage"));

const LazyAnalyticsPage = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-96"><LoadingSpinner /></div>}>
      <AnalyticsPage />
    </Suspense>
  );
};

export default LazyAnalyticsPage;
