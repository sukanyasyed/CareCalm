import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Clock, Droplet, Activity, Pill, Apple } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  time: string;
  category: "medication" | "monitoring" | "activity" | "diet";
  completed: boolean;
  priority?: "high" | "medium" | "low";
}

const initialTasks: Task[] = [
  { id: "1", title: "Morning glucose check", time: "7:00 AM", category: "monitoring", completed: true, priority: "high" },
  { id: "2", title: "Take Metformin (500mg)", time: "8:00 AM", category: "medication", completed: true, priority: "high" },
  { id: "3", title: "30-min morning walk", time: "9:00 AM", category: "activity", completed: false, priority: "medium" },
  { id: "4", title: "Healthy breakfast (low GI)", time: "8:30 AM", category: "diet", completed: true },
  { id: "5", title: "Blood pressure check", time: "10:00 AM", category: "monitoring", completed: false, priority: "high" },
  { id: "6", title: "Lunch - balanced meal", time: "12:30 PM", category: "diet", completed: false },
  { id: "7", title: "Afternoon glucose check", time: "2:00 PM", category: "monitoring", completed: false },
  { id: "8", title: "Evening medication", time: "6:00 PM", category: "medication", completed: false, priority: "high" },
];

const categoryIcons = {
  medication: Pill,
  monitoring: Droplet,
  activity: Activity,
  diet: Apple,
};

const categoryStyles = {
  medication: "bg-chart-5/10 text-chart-5",
  monitoring: "bg-primary/10 text-primary",
  activity: "bg-success/10 text-success",
  diet: "bg-warning/10 text-warning",
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
    <Card variant="elevated" className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Today's Care Plan
          </CardTitle>
          <Badge variant="secondary" className="font-semibold">
            {completedCount}/{tasks.length} completed
          </Badge>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div 
            className="h-full rounded-full gradient-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="max-h-[400px] overflow-y-auto">
        <div className="space-y-3">
          {tasks.map((task) => {
            const Icon = categoryIcons[task.category];
            return (
              <div
                key={task.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 transition-all duration-200",
                  task.completed 
                    ? "bg-muted/50 opacity-60" 
                    : "bg-card hover:shadow-card"
                )}
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                  className="h-5 w-5"
                />
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", categoryStyles[task.category])}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium text-sm",
                    task.completed && "line-through text-muted-foreground"
                  )}>
                    {task.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{task.time}</p>
                </div>
                {task.priority === "high" && !task.completed && (
                  <Badge variant="destructive" className="text-xs">
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
