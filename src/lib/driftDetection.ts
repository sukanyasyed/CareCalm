// Behavioral drift detection algorithms
// Non-clinical analysis for engagement patterns only

import { PatientBehaviorData, DailyEngagement } from './syntheticData';

export type DriftLevel = 'none' | 'mild' | 'moderate' | 'significant';
export type TrendDirection = 'improving' | 'stable' | 'declining';

export interface DriftIndicator {
  id: string;
  category: 'frequency' | 'timing' | 'completeness' | 'variety';
  label: string;
  description: string;
  severity: DriftLevel;
  confidence: number; // 0-1
  dataPoints: number;
}

export interface DriftAnalysis {
  overallScore: number; // 0-100, higher = more engaged
  driftLevel: DriftLevel;
  trend: TrendDirection;
  indicators: DriftIndicator[];
  daysAnalyzed: number;
  lastUpdated: Date;
  // Explainability
  explanation: string;
  contributingFactors: string[];
}

// Calculate logging frequency score
function analyzeLoggingFrequency(engagement: DailyEngagement[]): DriftIndicator {
  const recent = engagement.slice(0, 7);
  const previous = engagement.slice(7, 14);
  
  const recentAvg = recent.reduce((sum, d) => sum + d.logsCount / d.expectedLogs, 0) / recent.length;
  const previousAvg = previous.length > 0 
    ? previous.reduce((sum, d) => sum + d.logsCount / d.expectedLogs, 0) / previous.length
    : recentAvg;
  
  const change = recentAvg - previousAvg;
  
  let severity: DriftLevel = 'none';
  if (recentAvg < 0.3) severity = 'significant';
  else if (recentAvg < 0.5) severity = 'moderate';
  else if (recentAvg < 0.7 || change < -0.2) severity = 'mild';
  
  return {
    id: 'frequency',
    category: 'frequency',
    label: 'Logging Frequency',
    description: `${Math.round(recentAvg * 100)}% of expected logs recorded this week`,
    severity,
    confidence: Math.min(1, recent.length / 7),
    dataPoints: recent.length,
  };
}

// Analyze timing consistency
function analyzeTimingConsistency(engagement: DailyEngagement[]): DriftIndicator {
  const recent = engagement.slice(0, 7);
  const avgConsistency = recent.reduce((sum, d) => sum + d.timingConsistency, 0) / recent.length;
  
  let severity: DriftLevel = 'none';
  if (avgConsistency < 0.3) severity = 'significant';
  else if (avgConsistency < 0.5) severity = 'moderate';
  else if (avgConsistency < 0.7) severity = 'mild';
  
  return {
    id: 'timing',
    category: 'timing',
    label: 'Timing Consistency',
    description: avgConsistency >= 0.7 
      ? 'Logging at consistent times'
      : `Timing varies more than usual (${Math.round(avgConsistency * 100)}% consistency)`,
    severity,
    confidence: Math.min(1, recent.length / 7),
    dataPoints: recent.length,
  };
}

// Analyze task completion
function analyzeTaskCompletion(engagement: DailyEngagement[]): DriftIndicator {
  const recent = engagement.slice(0, 7);
  const completionRate = recent.reduce((sum, d) => sum + d.completedTasks / d.totalTasks, 0) / recent.length;
  
  let severity: DriftLevel = 'none';
  if (completionRate < 0.3) severity = 'significant';
  else if (completionRate < 0.5) severity = 'moderate';
  else if (completionRate < 0.7) severity = 'mild';
  
  return {
    id: 'tasks',
    category: 'completeness',
    label: 'Task Completion',
    description: `${Math.round(completionRate * 100)}% of daily tasks completed`,
    severity,
    confidence: Math.min(1, recent.length / 7),
    dataPoints: recent.length,
  };
}

// Analyze activity variety
function analyzeLogVariety(engagement: DailyEngagement[]): DriftIndicator {
  const recent = engagement.slice(0, 7);
  
  // Check if all log types are represented
  const hasGlucose = recent.some(d => d.glucoseChecks > 0);
  const hasMeals = recent.some(d => d.mealLogsCount > 0);
  const hasActivity = recent.some(d => d.activityMinutes > 0);
  
  const varietyScore = [hasGlucose, hasMeals, hasActivity].filter(Boolean).length / 3;
  
  let severity: DriftLevel = 'none';
  if (varietyScore < 0.4) severity = 'moderate';
  else if (varietyScore < 0.7) severity = 'mild';
  
  return {
    id: 'variety',
    category: 'variety',
    label: 'Log Variety',
    description: varietyScore >= 0.7 
      ? 'Good variety of health data logged'
      : 'Some log types are missing recently',
    severity,
    confidence: Math.min(1, recent.length / 7),
    dataPoints: recent.length,
  };
}

// Determine trend direction
function calculateTrend(engagement: DailyEngagement[]): TrendDirection {
  if (engagement.length < 7) return 'stable';
  
  const recent = engagement.slice(0, 3);
  const older = engagement.slice(4, 7);
  
  const recentScore = recent.reduce((sum, d) => sum + d.logsCount / d.expectedLogs, 0) / recent.length;
  const olderScore = older.reduce((sum, d) => sum + d.logsCount / d.expectedLogs, 0) / older.length;
  
  const change = recentScore - olderScore;
  
  if (change > 0.1) return 'improving';
  if (change < -0.1) return 'declining';
  return 'stable';
}

// Generate human-readable explanation
function generateExplanation(indicators: DriftIndicator[], trend: TrendDirection): string {
  const significantIssues = indicators.filter(i => i.severity === 'significant' || i.severity === 'moderate');
  
  if (significantIssues.length === 0) {
    return "You're doing great! Your engagement patterns show consistent self-care habits.";
  }
  
  if (trend === 'improving') {
    return "We notice you're getting back on track. Small steps make a big difference!";
  }
  
  const issueDescriptions = significantIssues.map(i => i.label.toLowerCase()).join(' and ');
  return `We've noticed some changes in your ${issueDescriptions}. Life gets busy sometimes, and that's okay.`;
}

// Main drift analysis function
export function analyzeBehavioralDrift(data: PatientBehaviorData): DriftAnalysis {
  const { dailyEngagement } = data;
  
  const indicators: DriftIndicator[] = [
    analyzeLoggingFrequency(dailyEngagement),
    analyzeTimingConsistency(dailyEngagement),
    analyzeTaskCompletion(dailyEngagement),
    analyzeLogVariety(dailyEngagement),
  ];
  
  // Calculate overall score (weighted average)
  const weights = { frequency: 0.35, timing: 0.2, completeness: 0.3, variety: 0.15 };
  const severityScores: Record<DriftLevel, number> = { none: 100, mild: 70, moderate: 40, significant: 15 };
  
  let totalWeight = 0;
  let weightedScore = 0;
  
  for (const indicator of indicators) {
    const weight = weights[indicator.category];
    weightedScore += severityScores[indicator.severity] * weight * indicator.confidence;
    totalWeight += weight * indicator.confidence;
  }
  
  const overallScore = Math.round(totalWeight > 0 ? weightedScore / totalWeight : 50);
  
  // Determine drift level from score
  let driftLevel: DriftLevel = 'none';
  if (overallScore < 30) driftLevel = 'significant';
  else if (overallScore < 50) driftLevel = 'moderate';
  else if (overallScore < 70) driftLevel = 'mild';
  
  const trend = calculateTrend(dailyEngagement);
  
  // Contributing factors for explainability
  const contributingFactors = indicators
    .filter(i => i.severity !== 'none')
    .map(i => i.description);
  
  return {
    overallScore,
    driftLevel,
    trend,
    indicators,
    daysAnalyzed: dailyEngagement.length,
    lastUpdated: new Date(),
    explanation: generateExplanation(indicators, trend),
    contributingFactors,
  };
}

// Export as structured JSON (for API responses)
export function exportAnalysisAsJSON(analysis: DriftAnalysis): string {
  return JSON.stringify({
    disclaimer: "This analysis is for informational purposes only and does not constitute medical advice.",
    generated: new Date().toISOString(),
    privacyNote: "All data is processed locally. No personal health information is stored or transmitted.",
    analysis: {
      engagementScore: analysis.overallScore,
      driftLevel: analysis.driftLevel,
      trend: analysis.trend,
      explanation: analysis.explanation,
      indicators: analysis.indicators.map(i => ({
        category: i.category,
        label: i.label,
        severity: i.severity,
        confidence: Math.round(i.confidence * 100) + '%',
      })),
      contributingFactors: analysis.contributingFactors,
    },
  }, null, 2);
}
