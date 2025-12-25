import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useBackendApi, LogType } from "@/hooks/useBackendApi";
import { useAuth } from "@/hooks/useAuth";
import { Droplet, Heart, Activity, Utensils, Pill, Scale, Plus, Check, Loader2 } from "lucide-react";

const logTypes: { type: LogType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: "glucose", label: "Glucose", icon: <Droplet className="h-5 w-5" />, color: "text-primary" },
  { type: "bp", label: "Blood Pressure", icon: <Heart className="h-5 w-5" />, color: "text-destructive" },
  { type: "activity", label: "Activity", icon: <Activity className="h-5 w-5" />, color: "text-success" },
  { type: "diet", label: "Diet", icon: <Utensils className="h-5 w-5" />, color: "text-warning" },
  { type: "medication", label: "Medication", icon: <Pill className="h-5 w-5" />, color: "text-accent-foreground" },
  { type: "weight", label: "Weight", icon: <Scale className="h-5 w-5" />, color: "text-muted-foreground" },
];

export function LogEntryForm() {
  const { user } = useAuth();
  const { createLog } = useBackendApi();
  const { toast } = useToast();
  const [loadingType, setLoadingType] = useState<LogType | null>(null);
  const [recentlyLogged, setRecentlyLogged] = useState<LogType[]>([]);

  const handleLog = async (logType: LogType) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to track your health data.",
        variant: "destructive",
      });
      return;
    }

    setLoadingType(logType);
    try {
      await createLog(logType);
      setRecentlyLogged((prev) => [...prev, logType]);
      toast({
        title: "Logged Successfully",
        description: `Your ${logType} entry has been recorded.`,
      });
      
      // Remove from recently logged after 3 seconds
      setTimeout(() => {
        setRecentlyLogged((prev) => prev.filter((t) => t !== logType));
      }, 3000);
    } catch (error) {
      console.error("Failed to log entry:", error);
      toast({
        title: "Failed to Log",
        description: "There was an error recording your entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingType(null);
    }
  };

  const isRecentlyLogged = (type: LogType) => recentlyLogged.includes(type);

  if (!user) {
    return (
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="h-5 w-5 text-primary" />
            Quick Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Log in to track your glucose, blood pressure, activity, and more.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Plus className="h-5 w-5 text-primary" />
          Quick Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          Tap to log an entry. Your logs help improve drift detection and personalized insights.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {logTypes.map(({ type, label, icon, color }) => {
            const isLoading = loadingType === type;
            const isLogged = isRecentlyLogged(type);

            return (
              <Button
                key={type}
                variant={isLogged ? "default" : "outline"}
                className={`flex h-auto flex-col gap-1.5 py-4 transition-all ${
                  isLogged ? "bg-success hover:bg-success/90" : ""
                }`}
                onClick={() => handleLog(type)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isLogged ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className={color}>{icon}</span>
                )}
                <span className="text-xs font-medium">{label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
