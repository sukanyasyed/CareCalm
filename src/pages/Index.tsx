import { Header } from "@/components/dashboard/Header";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { DailyTasks } from "@/components/dashboard/DailyTasks";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { MotivationalCard } from "@/components/dashboard/MotivationalCard";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { WeeklyPlan } from "@/components/dashboard/WeeklyPlan";
import { Disclaimer } from "@/components/dashboard/Disclaimer";
import { Droplet, Heart, Activity, Scale } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
            Good morning, Sarah 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here's your personalized care plan for today.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <MetricCard
            title="Blood Glucose"
            value="105"
            unit="mg/dL"
            trend="down"
            trendValue="8%"
            status="normal"
            icon={<Droplet className="h-5 w-5" />}
          />
          <MetricCard
            title="Blood Pressure"
            value="128/82"
            unit="mmHg"
            trend="stable"
            trendValue="stable"
            status="normal"
            icon={<Heart className="h-5 w-5" />}
          />
          <MetricCard
            title="Daily Steps"
            value="4,250"
            unit="/ 6,000"
            trend="up"
            trendValue="12%"
            status="normal"
            icon={<Activity className="h-5 w-5" />}
          />
          <MetricCard
            title="Weight"
            value="168"
            unit="lbs"
            trend="down"
            trendValue="2 lbs"
            status="normal"
            icon={<Scale className="h-5 w-5" />}
          />
        </div>

        {/* Alert Section */}
        <div className="mb-6">
          <AlertCard />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <DailyTasks />
            <MotivationalCard />
          </div>
          <div className="space-y-6">
            <TrendChart />
            <WeeklyPlan />
          </div>
        </div>

        <Disclaimer />
      </main>
    </div>
  );
};

export default Index;
