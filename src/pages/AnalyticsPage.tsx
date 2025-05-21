
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
    if (dateRange?.from && dateRange?.to) {
      // Only call getAnalyticsData when both from and to dates are available
      setAnalyticsData(getAnalyticsData({
        from: dateRange.from,
        to: dateRange.to
      }));
    }
  }, [dateRange]);

  return (
    <div className="container py-4 md:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-4 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">Gear Analytics</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          View performance metrics for your gear listings
        </p>
      </div>

      <DateRangeSelector dateRange={dateRange} onDateRangeChange={setDateRange} />

      <div className="grid gap-4 md:gap-6">
        {/* For mobile, show tabs to switch between charts */}
        <div className="md:hidden">
          <Tabs defaultValue="views" className="w-full">
            <TabsList className="w-full mb-2">
              <TabsTrigger value="views" className="flex-1">Views</TabsTrigger>
              <TabsTrigger value="reservations" className="flex-1">Reservations</TabsTrigger>
              <TabsTrigger value="revenue" className="flex-1">Revenue</TabsTrigger>
            </TabsList>
            
            <TabsContent value="views">
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-base">Page Views by Gear</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <PageViewsChart data={analyticsData.viewsData} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reservations">
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-base">Gear Reservations Over Time</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <ReservationsChart data={analyticsData.reservationsData} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="revenue">
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-base">Revenue by Category</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <RevenueChart data={analyticsData.revenueData} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop view - show all cards stacked */}
        <div className="hidden md:grid gap-6">
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
    </div>
  );
};

export default AnalyticsPage;
