import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, TrendingUp, TrendingDown, Minus, Shield, Download, AlertCircle, Heart, Sparkles, Calendar, X } from "lucide-react";
import { SAMPLE_SCENARIOS, PatientBehaviorData } from "@/lib/syntheticData";
import { analyzeBehavioralDrift, DriftAnalysis, exportAnalysisAsJSON } from "@/lib/driftDetection";
import { generateNudges, Nudge, getNudgeStyling } from "@/lib/nudgeSystem";
import { generateAdaptivePlan, AdaptivePlan, getPlanModeInfo, exportPlanAsJSON } from "@/lib/adaptivePlan";
import { t, Language, SUPPORTED_LANGUAGES } from "@/lib/translations";

export const BehavioralInsights = () => {
  const [scenario, setScenario] = useState<'engaged' | 'drifting' | 'recovering'>('drifting');
  const [language, setLanguage] = useState<Language>('en');
  const [dismissedNudges, setDismissedNudges] = useState<string[]>([]);

  const patientData = useMemo(() => SAMPLE_SCENARIOS[scenario](), [scenario]);
  const analysis = useMemo(() => analyzeBehavioralDrift(patientData), [patientData]);
  const nudges = useMemo(() => generateNudges(analysis, language).filter(n => !dismissedNudges.includes(n.id)), [analysis, language, dismissedNudges]);
  const plan = useMemo(() => generateAdaptivePlan(analysis), [analysis]);
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
    const data = {
      analysis: JSON.parse(exportAnalysisAsJSON(analysis)),
      plan: JSON.parse(exportPlanAsJSON(plan)),
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
        <div className="flex flex-wrap gap-2">
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
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-1 h-4 w-4" />
            {t('exportData', language)}
          </Button>
        </div>
      </div>

      {/* Disclaimer */}
      <Card variant="warning" className="border-warning/30">
        <CardContent className="flex items-center gap-3 p-4">
          <AlertCircle className="h-5 w-5 text-warning shrink-0" />
          <p className="text-sm">
            <strong>{t('disclaimer', language)}:</strong> {t('privacyNote', language)}
          </p>
        </CardContent>
      </Card>

      {/* Main metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card variant="metric">
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

        <Card variant="metric">
          <span className="text-sm text-muted-foreground">{t('driftLevel', language)}</span>
          <div className={`mt-2 text-2xl font-bold ${getDriftColor()}`}>
            {t(analysis.driftLevel, language)}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{analysis.explanation}</p>
        </Card>

        <Card variant="metric">
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
    </div>
  );
};
