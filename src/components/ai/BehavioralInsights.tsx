import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Brain, TrendingUp, TrendingDown, Minus, Shield, Download, AlertCircle, Heart, Sparkles, Calendar, X, RefreshCw, Wifi, WifiOff, LogIn } from "lucide-react";
import { SAMPLE_SCENARIOS } from "@/lib/syntheticData";
import { analyzeBehavioralDrift, DriftAnalysis, exportAnalysisAsJSON } from "@/lib/driftDetection";
import { generateNudges, Nudge, getNudgeStyling } from "@/lib/nudgeSystem";
import { generateAdaptivePlan, AdaptivePlan, getPlanModeInfo, exportPlanAsJSON } from "@/lib/adaptivePlan";
import { t, Language, SUPPORTED_LANGUAGES } from "@/lib/translations";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface LiveAnalysisResponse {
  disclaimer: string;
  analysis: {
    engagementScore: number;
    driftLevel: 'none' | 'mild' | 'moderate' | 'significant';
    driftType: string | null;
    trend: 'improving' | 'stable' | 'declining';
    scores: {
      frequency: number;
      timing: number;
      variety: number;
    };
    metadata: Record<string, unknown>;
  };
  nudge: {
    message: string;
    type: string;
    tone: string;
    language: string;
  };
  recommendations: {
    suggestReducedPlan: boolean;
    message: string;
  } | null;
  timestamp: string;
}

export const BehavioralInsights = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [useLiveData, setUseLiveData] = useState(true);
  const [scenario, setScenario] = useState<'engaged' | 'drifting' | 'recovering'>('drifting');
  const [language, setLanguage] = useState<Language>('en');
  const [dismissedNudges, setDismissedNudges] = useState<string[]>([]);
  
  // Live data state
  const [liveAnalysis, setLiveAnalysis] = useState<LiveAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch live analysis
  const fetchLiveAnalysis = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('drift-analyze', {
        method: 'POST',
      });

      if (error) throw error;
      
      setLiveAnalysis(data);
      setLastUpdated(new Date());
      toast.success("Analysis updated");
    } catch (error) {
      console.error('Error fetching live analysis:', error);
      toast.error("Failed to fetch analysis. Using demo data.");
      setUseLiveData(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch on mount if logged in
  useEffect(() => {
    if (user && useLiveData && !liveAnalysis) {
      fetchLiveAnalysis();
    }
  }, [user, useLiveData]);

  // Synthetic data fallback
  const patientData = useMemo(() => SAMPLE_SCENARIOS[scenario](), [scenario]);
  const syntheticAnalysis = useMemo(() => analyzeBehavioralDrift(patientData), [patientData]);
  const syntheticNudges = useMemo(() => generateNudges(syntheticAnalysis, language), [syntheticAnalysis, language]);
  const syntheticPlan = useMemo(() => generateAdaptivePlan(syntheticAnalysis), [syntheticAnalysis]);

  // Decide which data to use
  const isLiveMode = useLiveData && user && liveAnalysis;
  
  // Map live analysis to the format expected by the UI
  const analysis: DriftAnalysis = isLiveMode ? {
    overallScore: liveAnalysis.analysis.engagementScore,
    driftLevel: liveAnalysis.analysis.driftLevel,
    trend: liveAnalysis.analysis.trend,
    indicators: [{
      id: 'frequency',
      category: 'frequency' as const,
      label: 'Logging Frequency',
      description: `${liveAnalysis.analysis.scores.frequency}% of expected logs`,
      severity: liveAnalysis.analysis.driftLevel,
      confidence: 1,
      dataPoints: (liveAnalysis.analysis.metadata.logsCount as number) || 0,
    }, {
      id: 'timing',
      category: 'timing' as const,
      label: 'Timing Consistency',
      description: `${liveAnalysis.analysis.scores.timing}% consistency`,
      severity: liveAnalysis.analysis.scores.timing < 50 ? 'moderate' : 'none',
      confidence: 1,
      dataPoints: 14,
    }, {
      id: 'variety',
      category: 'variety' as const,
      label: 'Log Variety',
      description: `${liveAnalysis.analysis.scores.variety}% variety`,
      severity: liveAnalysis.analysis.scores.variety < 50 ? 'mild' : 'none',
      confidence: 1,
      dataPoints: 14,
    }],
    daysAnalyzed: 14,
    lastUpdated: new Date(liveAnalysis.timestamp),
    explanation: liveAnalysis.analysis.driftType 
      ? `Detected ${liveAnalysis.analysis.driftType.replace('_', ' ')}`
      : 'Engagement patterns are healthy',
    contributingFactors: liveAnalysis.analysis.driftType ? [liveAnalysis.analysis.driftType.replace('_', ' ')] : [],
  } : syntheticAnalysis;

  // Map live nudge to nudge format
  const getNudgeTitle = (type: string): string => {
    switch(type) {
      case 'celebration': return 'Great Progress!';
      case 'supportive': return 'We\'re Here For You';
      case 'gentle_reminder': return 'A Gentle Thought';
      default: return 'Keep Going!';
    }
  };

  const nudges: Nudge[] = isLiveMode && liveAnalysis.nudge ? [{
    id: 'live-nudge-1',
    type: liveAnalysis.nudge.type as any,
    tone: liveAnalysis.nudge.tone as any,
    title: getNudgeTitle(liveAnalysis.nudge.type),
    message: liveAnalysis.nudge.message,
    emoji: liveAnalysis.nudge.type === 'celebration' ? '🎉' :
           liveAnalysis.nudge.type === 'supportive' ? '💪' :
           liveAnalysis.nudge.type === 'gentle_reminder' ? '💭' : '✨',
    priority: 1,
  }].filter(n => !dismissedNudges.includes(n.id)) : syntheticNudges.filter(n => !dismissedNudges.includes(n.id));

  const plan = isLiveMode ? generateAdaptivePlan(analysis) : syntheticPlan;
  const planInfo = getPlanModeInfo(plan.currentMode);

  const getTrendIcon = () => {
    if (analysis.trend === 'improving') return <TrendingUp className="h-4 w-4 text-success" />;
    if (analysis.trend === 'declining') return <TrendingDown className="h-4 w-4 text-warning" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getDriftColor = () => {
    if (analysis.driftLevel === 'none') return 'text-success';
    if (analysis.driftLevel === 'mild') return 'text-primary';
    if (analysis.driftLevel === 'moderate') return 'text-warning';
    return 'text-destructive';
  };

  const handleExport = () => {
    const data = isLiveMode ? {
      source: 'live',
      analysis: liveAnalysis,
      plan: JSON.parse(exportPlanAsJSON(plan)),
      exportedAt: new Date().toISOString(),
    } : {
      source: 'synthetic',
      scenario,
      analysis: JSON.parse(exportAnalysisAsJSON(analysis)),
      plan: JSON.parse(exportPlanAsJSON(plan)),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'behavioral-insights.json';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{t('behavioralInsights', language)}</h2>
            <p className="text-sm text-muted-foreground">{t('notMedicalAdvice', language)}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Live/Demo toggle */}
          <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
            {isLiveMode ? (
              <Wifi className="h-4 w-4 text-success" />
            ) : (
              <WifiOff className="h-4 w-4 text-muted-foreground" />
            )}
            <Label htmlFor="live-mode" className="text-sm cursor-pointer">
              {isLiveMode ? "Live" : "Demo"}
            </Label>
            <Switch
              id="live-mode"
              checked={useLiveData}
              onCheckedChange={setUseLiveData}
              disabled={!user}
            />
          </div>
          
          {!isLiveMode && (
            <Select value={scenario} onValueChange={(v: any) => setScenario(v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="engaged">Engaged</SelectItem>
                <SelectItem value="drifting">Drifting</SelectItem>
                <SelectItem value="recovering">Recovering</SelectItem>
              </SelectContent>
            </Select>
          )}
          
          <Select value={language} onValueChange={(v: Language) => setLanguage(v)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map(lang => (
                <SelectItem key={lang.code} value={lang.code}>{lang.nativeName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {isLiveMode && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchLiveAnalysis}
              disabled={isLoading}
            >
              <RefreshCw className={`mr-1 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
          
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-1 h-4 w-4" />
            {t('exportData', language)}
          </Button>
        </div>
      </div>

      {/* Login prompt for live data */}
      {!user && useLiveData && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <LogIn className="h-5 w-5 text-primary" />
              <p className="text-sm">
                <strong>Sign in</strong> to see your real engagement analysis, or switch to Demo mode to explore with sample data.
              </p>
            </div>
            <Button size="sm" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Last updated indicator */}
      {isLiveMode && lastUpdated && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
            <Wifi className="mr-1 h-3 w-3" />
            Live Data
          </Badge>
          <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
        </div>
      )}

      {/* Disclaimer */}
      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="flex items-center gap-3 p-4">
          <AlertCircle className="h-5 w-5 text-warning shrink-0" />
          <p className="text-sm">
            <strong>{t('disclaimer', language)}:</strong> {isLiveMode && liveAnalysis?.disclaimer ? liveAnalysis.disclaimer : t('privacyNote', language)}
          </p>
        </CardContent>
      </Card>

      {/* Loading state */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin text-primary mr-2" />
            <span className="text-muted-foreground">Analyzing your engagement patterns...</span>
          </CardContent>
        </Card>
      )}

      {/* Main metrics */}
      {!isLoading && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('engagementScore', language)}</span>
                {getTrendIcon()}
              </div>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-3xl font-bold">{analysis.overallScore}</span>
                <span className="text-muted-foreground">/100</span>
              </div>
              <Progress value={analysis.overallScore} className="mt-3 h-2" />
            </Card>

            <Card className="p-4">
              <span className="text-sm text-muted-foreground">{t('driftLevel', language)}</span>
              <div className={`mt-2 text-2xl font-bold capitalize ${getDriftColor()}`}>
                {t(analysis.driftLevel, language)}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{analysis.explanation}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('planMode', language)}</span>
                <span className="text-xl">{planInfo.icon}</span>
              </div>
              <div className={`mt-2 text-2xl font-bold ${planInfo.color}`}>{planInfo.label}</div>
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                {plan.activeTasks}/{plan.totalTasks} {t('tasksActive', language)}
              </div>
            </Card>
          </div>

          {/* Score breakdown for live mode */}
          {isLiveMode && liveAnalysis && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Score Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Frequency</span>
                      <span className="font-medium">{liveAnalysis.analysis.scores.frequency}%</span>
                    </div>
                    <Progress value={liveAnalysis.analysis.scores.frequency} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Timing Consistency</span>
                      <span className="font-medium">{liveAnalysis.analysis.scores.timing}%</span>
                    </div>
                    <Progress value={liveAnalysis.analysis.scores.timing} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Variety</span>
                      <span className="font-medium">{liveAnalysis.analysis.scores.variety}%</span>
                    </div>
                    <Progress value={liveAnalysis.analysis.scores.variety} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations for significant drift */}
          {isLiveMode && liveAnalysis?.recommendations && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <h4 className="font-medium">Recommendation</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{liveAnalysis.recommendations.message}</p>
                    <Button variant="soft" size="sm" className="mt-3">
                      Switch to Lighter Plan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Nudges */}
          {nudges.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="h-5 w-5 text-primary" />
                  {t('yourNudges', language)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {nudges.map(nudge => {
                  const styling = getNudgeStyling(nudge.tone);
                  return (
                    <div key={nudge.id} className={`relative rounded-lg border p-4 ${styling.bgClass} ${styling.borderClass}`}>
                      <button 
                        onClick={() => setDismissedNudges(prev => [...prev, nudge.id])}
                        className="absolute right-2 top-2 p-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{nudge.emoji}</span>
                        <div className="flex-1">
                          <h4 className="font-medium">{nudge.title}</h4>
                          <p className="mt-1 text-sm text-muted-foreground">{nudge.message}</p>
                          {nudge.actionLabel && (
                            <Button variant="soft" size="sm" className="mt-2">
                              {nudge.actionLabel}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {nudges.length === 0 && (
            <Card className="border-success/30 bg-success/5">
              <CardContent className="flex items-center gap-3 p-6">
                <Sparkles className="h-6 w-6 text-success" />
                <p className="text-success font-medium">{t('noNudges', language)}</p>
              </CardContent>
            </Card>
          )}

          {/* Plan details */}
          {plan.autoRestoreAt && (
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">
                    {t('autoRestore', language)}: {plan.autoRestoreAt.toLocaleDateString()}
                  </span>
                </div>
                <Badge variant="secondary">{t('safetyTasksNote', language)}</Badge>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
