import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Phone, X, ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface Alert {
  id: string;
  type: "hypo" | "hyper" | "reminder";
  title: string;
  message: string;
  value?: string;
  action?: string;
  threshold?: string;
}

const initialAlerts: Alert[] = [
  {
    id: "1",
    type: "hyper",
    title: "High glucose detected",
    message: "Your post-lunch reading was 185 mg/dL. Consider a correction dose or light physical activity.",
    value: "185",
    threshold: ">180 mg/dL",
    action: "Log correction dose",
  },
  {
    id: "2",
    type: "reminder",
    title: "Insulin reminder",
    message: "You haven't logged your lunchtime rapid-acting insulin yet.",
    action: "Mark as taken",
  },
];

export const AlertCard = () => {
  const [alerts, setAlerts] = useState(initialAlerts);

  const dismissAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  if (alerts.length === 0) return null;

  return (
    <Card variant="warning" className="animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-warning">
          <AlertTriangle className="h-5 w-5" />
          Attention Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-start gap-3 rounded-lg bg-card p-3 border"
          >
            {alert.type === "hyper" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <ArrowUp className="h-4 w-4 text-destructive" />
              </div>
            )}
            {alert.type === "hypo" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning/10">
                <ArrowDown className="h-4 w-4 text-warning" />
              </div>
            )}
            {alert.type === "reminder" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <AlertTriangle className="h-4 w-4 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm text-foreground">{alert.title}</p>
                {alert.threshold && (
                  <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30">
                    {alert.threshold}
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {alert.message}
              </p>
              {alert.action && (
                <Button variant="soft" size="sm" className="mt-2">
                  {alert.action}
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={() => dismissAlert(alert.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            <strong>Severe hypo (&lt;54 mg/dL)?</strong> Treat immediately with fast-acting glucose. Contact your care team if needed.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
