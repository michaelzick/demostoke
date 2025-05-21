
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer 
} from "recharts";

interface RevenueChartProps {
  data: {
    date: string;
    snowboarding: number;
    surfing: number;
    skateboarding: number;
  }[];
}

const RevenueChart = ({ data }: RevenueChartProps) => {
  const config = {
    snowboarding: {
      label: "Snowboarding",
      color: "rgba(59, 130, 246, 0.6)",
    },
    surfing: {
      label: "Surfing",
      color: "rgba(239, 68, 68, 0.6)",
    },
    skateboarding: {
      label: "Skateboarding",
      color: "rgba(34, 197, 94, 0.6)",
    },
  };

  return (
    <ChartContainer className="aspect-[4/3] sm:aspect-video p-1 sm:p-2 h-60 sm:h-80" config={config}>
      <AreaChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          angle={-45} 
          textAnchor="end" 
          height={70}
          tick={{ fontSize: 10 }}
          tickMargin={10}
        />
        <YAxis 
          tick={{ fontSize: 10 }}
          tickFormatter={(value) => `$${value}`}
          width={45}
        />
        <ChartTooltip 
          content={
            <ChartTooltipContent indicator="dot" />
          } 
        />
        <Area
          type="monotone"
          dataKey="snowboarding"
          name="snowboarding"
          stackId="1"
          stroke="#3b82f6"
          fill="rgba(59, 130, 246, 0.6)"
        />
        <Area
          type="monotone"
          dataKey="surfing"
          name="surfing"
          stackId="1"
          stroke="#ef4444"
          fill="rgba(239, 68, 68, 0.6)"
        />
        <Area
          type="monotone"
          dataKey="skateboarding"
          name="skateboarding"
          stackId="1"
          stroke="#22c55e"
          fill="rgba(34, 197, 94, 0.6)"
        />
      </AreaChart>
    </ChartContainer>
  );
};

export default RevenueChart;
