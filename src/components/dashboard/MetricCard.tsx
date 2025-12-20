import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  unit: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  status?: "normal" | "warning" | "alert";
  icon: React.ReactNode;
}

export const MetricCard = ({
  title,
  value,
  unit,
  trend = "stable",
  trendValue,
  status = "normal",
  icon,
}: MetricCardProps) => {
  const statusStyles = {
    normal: "border-success/30 bg-success/5",
    warning: "border-warning/30 bg-warning/5",
    alert: "border-destructive/30 bg-destructive/5",
  };

  const trendStyles = {
    up: "text-success",
    down: "text-destructive",
    stable: "text-muted-foreground",
  };

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <Card variant="metric" className={cn("animate-slide-up", statusStyles[status])}>
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        {trendValue && (
          <div className={cn("flex items-center gap-1 text-sm font-medium", trendStyles[trend])}>
            <TrendIcon className="h-4 w-4" />
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-3xl font-bold text-foreground">{value}</span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
      </div>
    </Card>
  );
};
