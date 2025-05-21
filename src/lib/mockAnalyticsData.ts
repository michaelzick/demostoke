
import { addDays, subDays, format } from "date-fns";

export const generateViewsData = () => {
  return [
    { name: "Burton Custom X Snowboard", views: Math.floor(Math.random() * 200) + 100 },
    { name: "K2 Broadcast Snowboard", views: Math.floor(Math.random() * 200) + 80 },
    { name: "Rossignol Experience 88 Ti Skis", views: Math.floor(Math.random() * 200) + 120 },
    { name: "Atomic Bent 100 Skis", views: Math.floor(Math.random() * 200) + 90 },
    { name: "MSR Hubba Hubba NX Tent", views: Math.floor(Math.random() * 200) + 150 },
    { name: "Coleman Sundome Tent", views: Math.floor(Math.random() * 200) + 70 },
  ];
};

export const generateReservationsData = (days: number) => {
  const data = [];
  const today = new Date();
  
  for (let i = days; i >= 0; i -= Math.floor(days/10) || 1) {
    const date = subDays(today, i);
    data.push({
      date: format(date, "MMM dd"),
      snowboarding: Math.floor(Math.random() * 10) + 1,
      skiing: Math.floor(Math.random() * 8) + 1,
      camping: Math.floor(Math.random() * 12) + 1
    });
  }
  
  return data;
};

export const generateRevenueData = (days: number) => {
  const data = [];
  const today = new Date();
  
  for (let i = days; i >= 0; i -= Math.floor(days/10) || 1) {
    const date = subDays(today, i);
    data.push({
      date: format(date, "MMM dd"),
      snowboarding: Math.floor(Math.random() * 1000) + 200,
      skiing: Math.floor(Math.random() * 800) + 300,
      camping: Math.floor(Math.random() * 1200) + 150
    });
  }
  
  return data;
};

export const getAnalyticsData = (dateRange: { from: Date, to: Date } | undefined) => {
  const days = dateRange 
    ? Math.round((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
    : 30;
  
  return {
    viewsData: generateViewsData(),
    reservationsData: generateReservationsData(days),
    revenueData: generateRevenueData(days)
  };
};
