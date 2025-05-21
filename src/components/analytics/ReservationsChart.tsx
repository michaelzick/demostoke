
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer 
} from "recharts";

interface ReservationsChartProps {
  data: {
    date: string;
    snowboarding: number;
    surfing: number;
    skateboarding: number;
  }[];
}

const ReservationsChart = ({ data }: ReservationsChartProps) => {
  const config = {
    snowboarding: {
      label: "Snowboarding",
      color: "#3b82f6",
    },
    surfing: {
      label: "Surfing",
      color: "#ef4444",
    },
    skateboarding: {
      label: "Skateboarding",
      color: "#22c55e",
    },
  };

  return (
    <ChartContainer className="w-full aspect-[4/3] sm:aspect-video p-1 sm:p-2 h-60 sm:h-80" config={config}>
      <LineChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 30 }} width={500} height={300}>
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
          width={30}
        />
        <ChartTooltip 
          content={
            <ChartTooltipContent indicator="dot" />
          } 
        />
        <Line 
          type="monotone" 
          dataKey="snowboarding" 
          name="snowboarding" 
          stroke="#3b82f6" 
          strokeWidth={2} 
          dot={{ r: 3 }}
        />
        <Line 
          type="monotone" 
          dataKey="surfing" 
          name="surfing" 
          stroke="#ef4444" 
          strokeWidth={2} 
          dot={{ r: 3 }}
        />
        <Line 
          type="monotone" 
          dataKey="skateboarding" 
          name="skateboarding" 
          stroke="#22c55e" 
          strokeWidth={2} 
          dot={{ r: 3 }}
        />
      </LineChart>
    </ChartContainer>
  );
};

export default ReservationsChart;
