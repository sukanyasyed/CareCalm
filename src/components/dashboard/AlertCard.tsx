import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Alert {
  id: string;
  type: "warning" | "urgent";
  title: string;
  message: string;
  action?: string;
}

const initialAlerts: Alert[] = [
  {
    id: "1",
    type: "warning",
    title: "Blood pressure elevated",
    message: "Your last reading (145/92 mmHg) was above target. Consider resting and retaking in 30 minutes.",
    action: "Log new reading",
  },
  {
    id: "2",
    type: "warning",
    title: "Medication reminder",
    message: "You haven't logged your evening Lisinopril dose yet today.",
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
    <Card variant="warning" className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-warning">
          <AlertTriangle className="h-5 w-5" />
          Attention Needed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-start gap-3 rounded-lg bg-card p-3 border"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground">{alert.title}</p>
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
            If symptoms persist, contact your healthcare provider.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
