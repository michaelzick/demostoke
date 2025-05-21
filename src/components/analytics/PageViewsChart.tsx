
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer 
} from "recharts";

interface PageViewsChartProps {
  data: {
    name: string;
    views: number;
  }[];
}

const PageViewsChart = ({ data }: PageViewsChartProps) => {
  const config = {
    views: {
      label: "Page Views",
      color: "#3b82f6",
    },
  };

  return (
    <ChartContainer className="w-full aspect-[4/3] sm:aspect-video p-2 h-80" config={config}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 50 }} width={500} height={300}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          angle={-45} 
          textAnchor="end" 
          height={70}
          tick={{ fontSize: 12 }}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <ChartTooltip 
          content={
            <ChartTooltipContent indicator="dot" />
          } 
        />
        <Bar dataKey="views" name="views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
};

export default PageViewsChart;
