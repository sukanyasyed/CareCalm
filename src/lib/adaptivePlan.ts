// Adaptive care plan system
// Adjusts task load based on engagement, not safety thresholds

import { DriftAnalysis, DriftLevel } from './driftDetection';

export type PlanMode = 'full' | 'reduced' | 'minimal';

export interface TaskCategory {
  id: string;
  name: string;
  isSafetyRelated: boolean; // Never reduce safety-related tasks
  fullModeCount: number;
  reducedModeCount: number;
  minimalModeCount: number;
}

export interface AdaptivePlan {
  currentMode: PlanMode;
  previousMode: PlanMode;
  modeChangedAt: Date;
  autoRestoreAt?: Date;
  taskCategories: TaskCategory[];
  totalTasks: number;
  activeTasks: number;
  reductionPercent: number;
  disclaimer: string;
}

// Default task categories for diabetes care
const DEFAULT_TASK_CATEGORIES: TaskCategory[] = [
  {
    id: 'glucose',
    name: 'Glucose Monitoring',
    isSafetyRelated: true, // Never reduce
    fullModeCount: 4,
    reducedModeCount: 4,
    minimalModeCount: 4,
  },
  {
    id: 'medication',
    name: 'Medication Reminders',
    isSafetyRelated: true, // Never reduce
    fullModeCount: 3,
    reducedModeCount: 3,
    minimalModeCount: 3,
  },
  {
    id: 'meals',
    name: 'Meal Logging',
    isSafetyRelated: false,
    fullModeCount: 3,
    reducedModeCount: 2,
    minimalModeCount: 1,
  },
  {
    id: 'activity',
    name: 'Activity Tracking',
    isSafetyRelated: false,
    fullModeCount: 2,
    reducedModeCount: 1,
    minimalModeCount: 0,
  },
  {
    id: 'wellness',
    name: 'Wellness Check-ins',
    isSafetyRelated: false,
    fullModeCount: 2,
    reducedModeCount: 1,
    minimalModeCount: 0,
  },
  {
    id: 'education',
    name: 'Health Tips',
    isSafetyRelated: false,
    fullModeCount: 1,
    reducedModeCount: 0,
    minimalModeCount: 0,
  },
];

// Helper function to get task count for a mode
function getTaskCountForMode(category: TaskCategory, mode: PlanMode): number {
  switch (mode) {
    case 'minimal':
      return category.minimalModeCount;
    case 'reduced':
      return category.reducedModeCount;
    case 'full':
    default:
      return category.fullModeCount;
  }
}

// Determine appropriate plan mode based on drift analysis
function determinePlanMode(analysis: DriftAnalysis): PlanMode {
  const { driftLevel, trend } = analysis;
  
  // If improving, start restoring
  if (trend === 'improving') {
    if (driftLevel === 'significant') return 'reduced';
    if (driftLevel === 'moderate') return 'reduced';
    return 'full';
  }
  
  // Based on drift level
  switch (driftLevel) {
    case 'significant':
      return 'minimal';
    case 'moderate':
      return 'reduced';
    case 'mild':
      return 'reduced';
    case 'none':
    default:
      return 'full';
  }
}

// Generate adaptive plan based on analysis
export function generateAdaptivePlan(
  analysis: DriftAnalysis,
  previousPlan?: AdaptivePlan
): AdaptivePlan {
  const newMode = determinePlanMode(analysis);
  const previousMode = previousPlan?.currentMode || 'full';
  const modeChanged = newMode !== previousMode;
  
  const taskCategories = DEFAULT_TASK_CATEGORIES.map(category => ({
    ...category,
  }));
  
  // Calculate totals
  const fullTotal = taskCategories.reduce((sum, c) => sum + c.fullModeCount, 0);
  const activeTotal = taskCategories.reduce((sum, c) => sum + getTaskCountForMode(c, newMode), 0);
  const reductionPercent = Math.round((1 - activeTotal / fullTotal) * 100);
  
  // Auto-restore timing
  let autoRestoreAt: Date | undefined;
  if (newMode !== 'full') {
    autoRestoreAt = new Date();
    autoRestoreAt.setDate(autoRestoreAt.getDate() + 7); // Check in 7 days
  }
  
  return {
    currentMode: newMode,
    previousMode,
    modeChangedAt: modeChanged ? new Date() : (previousPlan?.modeChangedAt || new Date()),
    autoRestoreAt,
    taskCategories,
    totalTasks: fullTotal,
    activeTasks: activeTotal,
    reductionPercent,
    disclaimer: "Task adjustments are for engagement support only. All safety-critical tasks (glucose monitoring, medications) remain unchanged. This is not medical advice.",
  };
}

// Get mode-specific messaging
export function getPlanModeInfo(mode: PlanMode): { 
  label: string; 
  description: string; 
  color: string;
  icon: string;
} {
  switch (mode) {
    case 'minimal':
      return {
        label: 'Light Mode',
        description: 'Focusing on essentials while you recharge',
        color: 'text-info',
        icon: '🌙',
      };
    case 'reduced':
      return {
        label: 'Balanced Mode',
        description: 'A lighter load to help you ease back in',
        color: 'text-primary',
        icon: '🌤️',
      };
    case 'full':
    default:
      return {
        label: 'Full Plan',
        description: 'Your complete care routine',
        color: 'text-success',
        icon: '☀️',
      };
  }
}

// Check if plan should auto-restore
export function shouldRestorePlan(plan: AdaptivePlan, analysis: DriftAnalysis): boolean {
  if (plan.currentMode === 'full') return false;
  
  // Restore if engagement is back to good levels
  if (analysis.driftLevel === 'none' && analysis.overallScore >= 70) {
    return true;
  }
  
  // Restore if improving trend persists
  if (analysis.trend === 'improving' && analysis.overallScore >= 60) {
    return true;
  }
  
  return false;
}

// Export plan as structured JSON
export function exportPlanAsJSON(plan: AdaptivePlan): string {
  const safetyTasks = plan.taskCategories.filter(c => c.isSafetyRelated);
  const adjustableTasks = plan.taskCategories.filter(c => !c.isSafetyRelated);
  
  return JSON.stringify({
    disclaimer: plan.disclaimer,
    privacyNote: "Plan adjustments are computed locally. No personal data is stored or shared.",
    plan: {
      mode: plan.currentMode,
      modeInfo: getPlanModeInfo(plan.currentMode),
      taskSummary: {
        total: plan.totalTasks,
        active: plan.activeTasks,
        reductionPercent: plan.reductionPercent,
      },
      safetyTasks: safetyTasks.map(t => ({
        name: t.name,
        count: t.fullModeCount,
        note: 'Never reduced',
      })),
      adjustableTasks: adjustableTasks.map(t => ({
        name: t.name,
        fullCount: t.fullModeCount,
        currentCount: getTaskCountForMode(t, plan.currentMode),
      })),
      autoRestoreDate: plan.autoRestoreAt?.toISOString(),
    },
  }, null, 2);
}
