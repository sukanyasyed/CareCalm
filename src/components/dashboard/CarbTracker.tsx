import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const meals = [
  { 
    meal: "Breakfast", 
    time: "7:30 AM", 
    carbs: 45, 
    foods: "Oatmeal, berries, almonds",
    preGlucose: 95,
    postGlucose: 145,
  },
  { 
    meal: "Lunch", 
    time: "12:30 PM", 
    carbs: 55, 
    foods: "Grilled chicken salad, whole grain bread",
    preGlucose: 105,
    postGlucose: 168,
  },
];

export const CarbTracker = () => {
  const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
  const targetCarbs = 150;

  return (
    <Card variant="elevated" className="animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Utensils className="h-5 w-5 text-primary" />
            Today's Carb Intake
          </CardTitle>
          <Badge variant="secondary">
            {totalCarbs}g / {targetCarbs}g
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {meals.map((meal, i) => {
          const glucoseRise = meal.postGlucose - meal.preGlucose;
          return (
            <div key={i} className="rounded-lg border p-3 bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{meal.meal}</p>
                  <p className="text-xs text-muted-foreground">{meal.time} • {meal.foods}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="font-mono">
                    {meal.carbs}g carbs
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span>Pre: {meal.preGlucose}</span>
                <TrendingUp className="h-3 w-3" />
                <span>Post: {meal.postGlucose}</span>
                <Badge 
                  variant={glucoseRise > 50 ? "destructive" : "secondary"} 
                  className="text-[10px]"
                >
                  +{glucoseRise} mg/dL
                </Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
