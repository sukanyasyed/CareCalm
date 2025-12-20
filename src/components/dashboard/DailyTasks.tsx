import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Clock, Droplet, Activity, Syringe, Apple, Footprints } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  time: string;
  category: "insulin" | "glucose" | "activity" | "diet" | "care";
  completed: boolean;
  priority?: "high" | "medium" | "low";
  notes?: string;
}

const initialTasks: Task[] = [
  { id: "1", title: "Fasting glucose check", time: "7:00 AM", category: "glucose", completed: true, priority: "high", notes: "Before breakfast" },
  { id: "2", title: "Rapid-acting insulin (Humalog)", time: "7:15 AM", category: "insulin", completed: true, priority: "high", notes: "With breakfast" },
  { id: "3", title: "Low-GI breakfast", time: "7:30 AM", category: "diet", completed: true, notes: "Log carbs: 45g" },
  { id: "4", title: "30-min morning walk", time: "9:00 AM", category: "activity", completed: false, priority: "medium" },
  { id: "5", title: "Post-meal glucose check", time: "9:30 AM", category: "glucose", completed: false, priority: "high", notes: "2 hours after breakfast" },
  { id: "6", title: "Pre-lunch glucose check", time: "12:00 PM", category: "glucose", completed: false },
  { id: "7", title: "Lunch insulin dose", time: "12:15 PM", category: "insulin", completed: false, priority: "high" },
  { id: "8", title: "Balanced lunch", time: "12:30 PM", category: "diet", completed: false, notes: "Target: 50-60g carbs" },
  { id: "9", title: "Afternoon glucose check", time: "3:00 PM", category: "glucose", completed: false },
  { id: "10", title: "Daily foot inspection", time: "8:00 PM", category: "care", completed: false, priority: "medium", notes: "Check for cuts, blisters" },
  { id: "11", title: "Long-acting insulin (Lantus)", time: "9:00 PM", category: "insulin", completed: false, priority: "high" },
];

const categoryIcons = {
  insulin: Syringe,
  glucose: Droplet,
  activity: Activity,
  diet: Apple,
  care: Footprints,
};

const categoryStyles = {
  insulin: "bg-chart-5/10 text-chart-5",
  glucose: "bg-primary/10 text-primary",
  activity: "bg-success/10 text-success",
  diet: "bg-warning/10 text-warning",
  care: "bg-chart-1/10 text-chart-1",
};

const categoryLabels = {
  insulin: "Insulin",
  glucose: "Glucose",
  activity: "Exercise",
  diet: "Nutrition",
  care: "Self-care",
};

export const DailyTasks = () => {
  const [tasks, setTasks] = useState(initialTasks);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = Math.round((completedCount / tasks.length) * 100);

  return (
    <Card variant="elevated" className="animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Today's Diabetes Care Plan
          </CardTitle>
          <Badge variant="secondary" className="font-semibold">
            {completedCount}/{tasks.length} done
          </Badge>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div 
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="max-h-[420px] overflow-y-auto">
        <div className="space-y-3">
          {tasks.map((task) => {
            const Icon = categoryIcons[task.category];
            return (
              <div
                key={task.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 transition-all duration-200",
                  task.completed 
                    ? "bg-muted/50 opacity-60" 
                    : "bg-card hover:shadow-sm"
                )}
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                  className="mt-0.5 h-5 w-5"
                />
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", categoryStyles[task.category])}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn(
                      "font-medium text-sm",
                      task.completed && "line-through text-muted-foreground"
                    )}>
                      {task.title}
                    </p>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {categoryLabels[task.category]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-muted-foreground">{task.time}</p>
                    {task.notes && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <p className="text-xs text-muted-foreground">{task.notes}</p>
                      </>
                    )}
                  </div>
                </div>
                {task.priority === "high" && !task.completed && (
                  <Badge variant="destructive" className="text-[10px] shrink-0">
                    Priority
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
