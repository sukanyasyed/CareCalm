import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from "recharts";
import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const glucoseData = [
  { time: "6am", glucose: 95, type: "fasting" },
  { time: "8am", glucose: 145, type: "post-meal" },
  { time: "10am", glucose: 118, type: "check" },
  { time: "12pm", glucose: 105, type: "pre-meal" },
  { time: "2pm", glucose: 168, type: "post-meal" },
  { time: "4pm", glucose: 135, type: "check" },
  { time: "6pm", glucose: 112, type: "pre-meal" },
  { time: "8pm", glucose: 155, type: "post-meal" },
  { time: "10pm", glucose: 128, type: "bedtime" },
];

export const TrendChart = () => {
  const avgGlucose = Math.round(glucoseData.reduce((sum, d) => sum + d.glucose, 0) / glucoseData.length);
  const timeInRange = Math.round((glucoseData.filter(d => d.glucose >= 70 && d.glucose <= 180).length / glucoseData.length) * 100);

  return (
    <Card variant="elevated" className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Today's Glucose
            </CardTitle>
            <CardDescription className="mt-1">
              Blood glucose readings throughout the day
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Avg</p>
              <p className="text-lg font-bold text-foreground">{avgGlucose}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">In Range</p>
              <Badge variant={timeInRange >= 70 ? "default" : "secondary"} className="text-sm">
                {timeInRange}%
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={glucoseData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
              {/* Target range background */}
              <ReferenceArea y1={70} y2={180} fill="hsl(var(--success))" fillOpacity={0.08} />
              
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                domain={[50, 220]}
                ticks={[70, 100, 140, 180]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                formatter={(value: number) => [`${value} mg/dL`, 'Glucose']}
              />
              
              {/* Target range lines */}
              <ReferenceLine 
                y={180} 
                stroke="hsl(var(--warning))" 
                strokeDasharray="4 4"
                label={{ value: "High 180", position: "right", fill: "hsl(var(--warning))", fontSize: 10 }}
              />
              <ReferenceLine 
                y={70} 
                stroke="hsl(var(--destructive))" 
                strokeDasharray="4 4"
                label={{ value: "Low 70", position: "right", fill: "hsl(var(--destructive))", fontSize: 10 }}
              />
              
              <Line
                type="monotone"
                dataKey="glucose"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-2 w-6 rounded bg-success/30" />
            <span className="text-muted-foreground">Target range (70-180)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Glucose reading</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
