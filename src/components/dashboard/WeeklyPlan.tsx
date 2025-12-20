import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, Circle, ArrowRight, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const weeklyGoals = [
  { id: "1", title: "Glucose checks completed", target: 28, current: 22, unit: "checks" },
  { id: "2", title: "Time in range (70-180 mg/dL)", target: 70, current: 68, unit: "%" },
  { id: "3", title: "Insulin doses logged", target: 14, current: 13, unit: "doses" },
  { id: "4", title: "30-min daily activity", target: 7, current: 5, unit: "days" },
  { id: "5", title: "Carb logs recorded", target: 21, current: 18, unit: "meals" },
];

const adjustments = [
  { text: "Post-lunch glucose tends to spike. Consider adjusting your lunch insulin-to-carb ratio.", type: "action" },
  { text: "Morning fasting glucose is well-controlled (avg 98 mg/dL). Great work!", type: "positive" },
  { text: "Add a 10-minute walk after dinner to help with evening glucose levels.", type: "tip" },
];

export const WeeklyPlan = () => {
  return (
    <Card variant="elevated" className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Weekly Diabetes Goals
            </CardTitle>
            <CardDescription className="mt-1">
              Dec 15 - Dec 21, 2024
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            Full report
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
                      isComplete ? "bg-success" : "bg-primary"
                    )}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-lg bg-secondary/50 p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            AI-Powered Insights
          </h4>
          <ul className="space-y-2.5">
            {adjustments.map((adj, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className={cn(
                  "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                  adj.type === "positive" ? "bg-success" : adj.type === "action" ? "bg-warning" : "bg-primary"
                )} />
                {adj.text}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground italic">
            Suggestions based on ADA Standards of Care and your recent patterns.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
