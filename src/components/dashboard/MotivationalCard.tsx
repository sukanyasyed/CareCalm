import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ChevronRight, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

export const MotivationalCard = () => {
  return (
    <Card 
      variant="elevated" 
      className="overflow-hidden animate-fade-in border-primary/20"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-success/5" />
      <CardContent className="relative p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Target className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground">You're on track! 🎯</h3>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              Your time in range improved to 68% this week—up from 62% last week. 
              Consistent glucose monitoring is making a real difference!
            </p>
            <Button variant="link" className="mt-2 h-auto p-0 text-primary">
              View your progress trends
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
