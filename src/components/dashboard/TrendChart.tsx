import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingUp } from "lucide-react";

const glucoseData = [
  { day: "Mon", morning: 105, evening: 125, target: 120 },
  { day: "Tue", morning: 112, evening: 135, target: 120 },
  { day: "Wed", morning: 98, evening: 118, target: 120 },
  { day: "Thu", morning: 108, evening: 128, target: 120 },
  { day: "Fri", morning: 102, evening: 115, target: 120 },
  { day: "Sat", morning: 95, evening: 110, target: 120 },
  { day: "Sun", morning: 100, evening: 120, target: 120 },
];

export const TrendChart = () => {
  return (
    <Card variant="elevated" className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Glucose Trends
            </CardTitle>
            <CardDescription className="mt-1">
              7-day blood glucose readings (mg/dL)
            </CardDescription>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">Morning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-chart-2" />
              <span className="text-muted-foreground">Evening</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={glucoseData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="day" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                domain={[80, 150]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "var(--shadow-md)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <ReferenceLine 
                y={120} 
                stroke="hsl(var(--warning))" 
                strokeDasharray="5 5"
                label={{ value: "Target", position: "right", fill: "hsl(var(--warning))", fontSize: 11 }}
              />
              <Line
                type="monotone"
                dataKey="morning"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
              />
              <Line
                type="monotone"
                dataKey="evening"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2.5}
                dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "hsl(var(--chart-2))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
