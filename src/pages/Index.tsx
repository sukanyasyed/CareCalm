import { Header } from "@/components/dashboard/Header";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { DailyTasks } from "@/components/dashboard/DailyTasks";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { MotivationalCard } from "@/components/dashboard/MotivationalCard";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { WeeklyPlan } from "@/components/dashboard/WeeklyPlan";
import { CarbTracker } from "@/components/dashboard/CarbTracker";
import { Disclaimer } from "@/components/dashboard/Disclaimer";
import { Droplet, Activity, Syringe, Target } from "lucide-react";

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
            Here's your personalized diabetes care plan for today.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <MetricCard
            title="Current Glucose"
            value="128"
            unit="mg/dL"
            trend="stable"
            trendValue="In range"
            status="normal"
            icon={<Droplet className="h-5 w-5" />}
            subtitle="Last check: 2:15 PM"
          />
          <MetricCard
            title="Time in Range"
            value="68"
            unit="%"
            trend="down"
            trendValue="+6%"
            status="normal"
            icon={<Target className="h-5 w-5" />}
            subtitle="Target: 70%+"
          />
          <MetricCard
            title="Today's Insulin"
            value="24"
            unit="units"
            trend="stable"
            status="normal"
            icon={<Syringe className="h-5 w-5" />}
            subtitle="2 doses logged"
          />
          <MetricCard
            title="Daily Steps"
            value="4,250"
            unit="/ 6,000"
            trend="down"
            trendValue="71%"
            status="normal"
            icon={<Activity className="h-5 w-5" />}
            subtitle="Keep moving!"
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
            <CarbTracker />
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
