
import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DateRangeSelector from "@/components/analytics/DateRangeSelector";
import PageViewsChart from "@/components/analytics/PageViewsChart";
import ReservationsChart from "@/components/analytics/ReservationsChart";
import RevenueChart from "@/components/analytics/RevenueChart";
import { getAnalyticsData } from "@/lib/mockAnalyticsData";

const AnalyticsPage = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    return {
      from: thirtyDaysAgo,
      to: today
    };
  });

  const [analyticsData, setAnalyticsData] = useState({
    viewsData: [],
    reservationsData: [],
    revenueData: []
  });

  useEffect(() => {
    if (dateRange && dateRange.from && dateRange.to) {
      setAnalyticsData(getAnalyticsData(dateRange));
    }
  }, [dateRange]);

  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gear Analytics</h1>
        <p className="text-muted-foreground">
          View performance metrics for your gear listings
        </p>
      </div>

      <DateRangeSelector dateRange={dateRange} onDateRangeChange={setDateRange} />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Page Views by Gear</CardTitle>
          </CardHeader>
          <CardContent>
            <PageViewsChart data={analyticsData.viewsData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gear Reservations Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ReservationsChart data={analyticsData.reservationsData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={analyticsData.revenueData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
