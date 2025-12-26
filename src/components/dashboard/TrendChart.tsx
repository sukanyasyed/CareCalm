import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from "recharts";
import { TrendingUp, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, startOfDay, endOfDay } from "date-fns";

interface ActivityLog {
  id: string;
  log_type: string;
  logged_at: string;
  created_at: string;
}

interface ChartDataPoint {
  time: string;
  glucose: number;
  type: string;
  logged_at: Date;
}

// Simulated glucose values based on log type for demo purposes
const getSimulatedGlucose = (logType: string, hour: number): number => {
  const baseValue = 100;
  const mealImpact = logType === 'diet' ? 45 : 0;
  const activityImpact = logType === 'activity' ? -15 : 0;
  const timeVariation = Math.sin(hour / 4) * 20;
  const randomVariation = Math.random() * 15 - 7.5;
  
  return Math.round(Math.max(70, Math.min(200, baseValue + mealImpact + activityImpact + timeVariation + randomVariation)));
};

export const TrendChart = () => {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const today = new Date();
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', startOfDay(today).toISOString())
        .lte('logged_at', endOfDay(today).toISOString())
        .order('logged_at', { ascending: true });

      if (error) throw error;

      const points: ChartDataPoint[] = (data || []).map((log: ActivityLog) => {
        const loggedAt = new Date(log.logged_at);
        return {
          time: format(loggedAt, 'ha'),
          glucose: getSimulatedGlucose(log.log_type, loggedAt.getHours()),
          type: log.log_type,
          logged_at: loggedAt,
        };
      });

      setChartData(points);
    } catch (error) {
      console.error("Failed to fetch activity logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [user]);

  // Real-time subscription for activity logs
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('activity-logs-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newLog = payload.new as ActivityLog;
          const loggedAt = new Date(newLog.logged_at);
          const today = new Date();
          
          // Only add if it's from today
          if (loggedAt >= startOfDay(today) && loggedAt <= endOfDay(today)) {
            const newPoint: ChartDataPoint = {
              time: format(loggedAt, 'ha'),
              glucose: getSimulatedGlucose(newLog.log_type, loggedAt.getHours()),
              type: newLog.log_type,
              logged_at: loggedAt,
            };
            
            setChartData((prev) => {
              const updated = [...prev, newPoint].sort(
                (a, b) => a.logged_at.getTime() - b.logged_at.getTime()
              );
              return updated;
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'activity_logs',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const deletedId = (payload.old as { id: string }).id;
          setChartData((prev) => prev.filter((p) => p.time !== deletedId));
          // Refetch to ensure consistency
          fetchLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const avgGlucose = chartData.length > 0 
    ? Math.round(chartData.reduce((sum, d) => sum + d.glucose, 0) / chartData.length)
    : 0;
  const timeInRange = chartData.length > 0
    ? Math.round((chartData.filter(d => d.glucose >= 70 && d.glucose <= 180).length / chartData.length) * 100)
    : 0;

  if (!user) {
    return (
      <Card variant="elevated" className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Today's Glucose
          </CardTitle>
          <CardDescription>Sign in to see your glucose trends</CardDescription>
        </CardHeader>
      </Card>
    );
  }

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
          {chartData.length > 0 && (
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
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[260px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[260px] flex flex-col items-center justify-center text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No activity logged today</p>
            <p className="text-sm text-muted-foreground/70">Log your activities to see glucose trends</p>
          </div>
        ) : (
          <>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
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
                    formatter={(value: number, name: string, props: any) => [
                      `${value} mg/dL`,
                      props.payload.type.charAt(0).toUpperCase() + props.payload.type.slice(1)
                    ]}
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
          </>
        )}
      </CardContent>
    </Card>
  );
};