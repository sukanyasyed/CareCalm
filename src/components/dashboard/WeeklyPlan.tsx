import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const weeklyGoals = [
  { id: "1", title: "Complete all glucose checks", target: 14, current: 11, unit: "checks" },
  { id: "2", title: "30-min daily activity", target: 7, current: 5, unit: "days" },
  { id: "3", title: "Medication adherence", target: 100, current: 92, unit: "%" },
  { id: "4", title: "Balanced meals logged", target: 21, current: 18, unit: "meals" },
];

const adjustments = [
  "Consider adding a short evening walk to help with post-dinner glucose levels.",
  "Great job on medication consistency! Keep it up.",
  "Try incorporating more leafy greens into your lunch for better glucose control.",
];

export const WeeklyPlan = () => {
  return (
    <Card variant="elevated" className="animate-slide-up" style={{ animationDelay: "0.25s" }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Weekly Progress
            </CardTitle>
            <CardDescription className="mt-1">
              Dec 15 - Dec 21, 2024
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            View details
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {weeklyGoals.map((goal) => {
            const progress = Math.round((goal.current / goal.target) * 100);
            const isComplete = progress >= 100;
            
            return (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={cn("font-medium", isComplete && "text-success")}>
                      {goal.title}
                    </span>
                  </div>
                  <span className="text-muted-foreground">
                    {goal.current}/{goal.target} {goal.unit}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      isComplete ? "bg-success" : "gradient-primary"
                    )}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-lg bg-secondary/50 p-4">
          <h4 className="text-sm font-semibold text-foreground mb-2">
            AI-Suggested Adjustments
          </h4>
          <ul className="space-y-2">
            {adjustments.map((adj, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {adj}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground italic">
            Based on ADA/AHA guidelines and your recent trends.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
