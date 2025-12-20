import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const messages = [
  {
    title: "Great progress this week! 🎉",
    message: "Your morning glucose levels have improved by 8% compared to last week. Keep up the excellent work!",
  },
  {
    title: "Tip of the day",
    message: "A 15-minute walk after meals can help lower post-meal blood sugar spikes by up to 30%.",
  },
];

export const MotivationalCard = () => {
  const todayMessage = messages[0];

  return (
    <Card 
      variant="elevated" 
      className="overflow-hidden animate-slide-up border-primary/20" 
      style={{ animationDelay: "0.3s" }}
    >
      <div className="absolute inset-0 gradient-primary opacity-5" />
      <CardContent className="relative p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground">{todayMessage.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              {todayMessage.message}
            </p>
            <Button variant="link" className="mt-2 h-auto p-0 text-primary">
              View weekly insights
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
