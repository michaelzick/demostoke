
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
    skiing: number;
    camping: number;
  }[];
}

const ReservationsChart = ({ data }: ReservationsChartProps) => {
  const config = {
    snowboarding: {
      label: "Snowboarding",
      color: "#3b82f6",
    },
    skiing: {
      label: "Skiing",
      color: "#ef4444",
    },
    camping: {
      label: "Camping",
      color: "#22c55e",
    },
  };

  return (
    <ChartContainer className="aspect-[4/3] sm:aspect-video p-2 h-80" config={config}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
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
        <Line 
          type="monotone" 
          dataKey="snowboarding" 
          name="snowboarding" 
          stroke="#3b82f6" 
          strokeWidth={2} 
          dot={{ r: 4 }}
        />
        <Line 
          type="monotone" 
          dataKey="skiing" 
          name="skiing" 
          stroke="#ef4444" 
          strokeWidth={2} 
          dot={{ r: 4 }}
        />
        <Line 
          type="monotone" 
          dataKey="camping" 
          name="camping" 
          stroke="#22c55e" 
          strokeWidth={2} 
          dot={{ r: 4 }}
        />
      </LineChart>
    </ChartContainer>
  );
};

export default ReservationsChart;
