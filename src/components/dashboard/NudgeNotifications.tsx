import { useState, useEffect } from "react";
import { Bell, Check, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBackendApi } from "@/hooks/useBackendApi";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Nudge {
  id: string;
  message: string;
  nudge_type: string;
  tone: string;
  language: string;
  is_read: boolean;
  sent_at: string;
}

export function NudgeNotifications() {
  const { user } = useAuth();
  const { getNudges, markNudgesAsRead } = useBackendApi();
  const { toast } = useToast();
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingRead, setMarkingRead] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const fetchNudges = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await getNudges({ limit: 10 });
      setNudges(response.nudges);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error("Failed to fetch nudges:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNudges();
    }
  }, [user]);

  useEffect(() => {
    if (open && user) {
      fetchNudges();
    }
  }, [open, user]);

  const handleMarkAsRead = async (nudgeId: string) => {
    setMarkingRead(nudgeId);
    try {
      await markNudgesAsRead([nudgeId]);
      setNudges((prev) =>
        prev.map((n) => (n.id === nudgeId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark nudge as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark nudge as read.",
        variant: "destructive",
      });
    } finally {
      setMarkingRead(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadNudges = nudges.filter((n) => !n.is_read);
    if (unreadNudges.length === 0) return;

    setLoading(true);
    try {
      await markNudgesAsRead(unreadNudges.map((n) => n.id));
      setNudges((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast({
        title: "All Caught Up",
        description: "All nudges marked as read.",
      });
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark nudges as read.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getNudgeTypeColor = (type: string) => {
    switch (type) {
      case "encouragement":
        return "bg-success/10 text-success";
      case "reminder":
        return "bg-warning/10 text-warning";
      case "celebration":
        return "bg-primary/10 text-primary";
      case "gentle_check":
        return "bg-accent text-accent-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  if (!user) {
    return (
      <Button variant="ghost" size="icon" className="relative" disabled>
        <Bell className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="font-semibold">Notifications</h4>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={fetchNudges}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={handleMarkAllAsRead}
                disabled={loading}
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-80">
          {loading && nudges.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : nudges.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground/70">
                Log your activities to receive personalized nudges
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {nudges.map((nudge) => (
                <div
                  key={nudge.id}
                  className={`relative p-4 transition-colors ${
                    nudge.is_read ? "bg-background" : "bg-accent/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getNudgeTypeColor(
                            nudge.nudge_type
                          )}`}
                        >
                          {nudge.nudge_type.replace("_", " ")}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(nudge.sent_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{nudge.message}</p>
                    </div>
                    {!nudge.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => handleMarkAsRead(nudge.id)}
                        disabled={markingRead === nudge.id}
                      >
                        {markingRead === nudge.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
