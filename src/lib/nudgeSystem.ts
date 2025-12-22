// Empathetic nudge generation system
// Provides gentle, non-judgmental motivational messages

import { DriftAnalysis, DriftLevel, TrendDirection } from './driftDetection';
import { t, Language } from './translations';

export type NudgeType = 'encouragement' | 'reminder' | 'celebration' | 'support' | 'tip';
export type NudgeTone = 'warm' | 'gentle' | 'celebratory' | 'understanding';

export interface Nudge {
  id: string;
  type: NudgeType;
  tone: NudgeTone;
  title: string;
  message: string;
  emoji: string;
  actionLabel?: string;
  actionType?: 'log' | 'view' | 'adjust' | 'dismiss';
  priority: number; // 1-5, lower = more important
  expiresAt?: Date;
}

// Nudge templates based on drift level and trend
const NUDGE_TEMPLATES: Record<string, Omit<Nudge, 'id'>> = {
  // Celebration nudges (no drift)
  'streak_celebration': {
    type: 'celebration',
    tone: 'celebratory',
    title: 'Amazing streak! 🌟',
    message: "You've been consistently logging for {days} days. Your dedication to self-care is inspiring!",
    emoji: '🎉',
    priority: 3,
  },
  'high_engagement': {
    type: 'celebration',
    tone: 'celebratory',
    title: 'Great week!',
    message: "You completed {percent}% of your care tasks this week. That's wonderful consistency!",
    emoji: '⭐',
    priority: 3,
  },
  
  // Gentle reminders (mild drift)
  'missed_logging': {
    type: 'reminder',
    tone: 'gentle',
    title: 'Quick check-in',
    message: "We noticed fewer logs lately. Would you like to add a quick entry? Even a small note helps!",
    emoji: '📝',
    actionLabel: 'Log now',
    actionType: 'log',
    priority: 2,
  },
  'timing_shift': {
    type: 'tip',
    tone: 'warm',
    title: 'Flexible timing',
    message: "Your schedule seems different lately. Would you like to adjust your reminder times to better fit your day?",
    emoji: '⏰',
    actionLabel: 'Adjust times',
    actionType: 'adjust',
    priority: 3,
  },
  
  // Supportive nudges (moderate drift)
  'life_happens': {
    type: 'support',
    tone: 'understanding',
    title: "Life gets busy",
    message: "We understand things can get hectic. Your care plan is still here whenever you're ready. No pressure.",
    emoji: '💙',
    priority: 2,
  },
  'small_steps': {
    type: 'encouragement',
    tone: 'warm',
    title: 'One step at a time',
    message: "Even checking in once today counts. Small steps are still steps forward.",
    emoji: '👣',
    actionLabel: 'Quick log',
    actionType: 'log',
    priority: 2,
  },
  
  // Recovery support (significant drift)
  'welcome_back': {
    type: 'encouragement',
    tone: 'warm',
    title: 'Welcome back!',
    message: "We've simplified your plan while you were away. Ready to ease back in at your own pace?",
    emoji: '🌱',
    actionLabel: 'View plan',
    actionType: 'view',
    priority: 1,
  },
  'reduced_plan': {
    type: 'support',
    tone: 'understanding',
    title: 'Lighter load ahead',
    message: "We've temporarily reduced your daily tasks to make things easier. Focus on what feels manageable.",
    emoji: '🍃',
    priority: 1,
  },
  
  // Improvement recognition
  'improving_trend': {
    type: 'celebration',
    tone: 'celebratory',
    title: "You're doing great!",
    message: "We see you're getting back on track. Your consistency is improving—keep it up!",
    emoji: '📈',
    priority: 2,
  },
};

// Select appropriate nudges based on analysis
export function generateNudges(analysis: DriftAnalysis, language: Language = 'en'): Nudge[] {
  const nudges: Nudge[] = [];
  const now = new Date();
  
  // Celebration for good engagement
  if (analysis.driftLevel === 'none' && analysis.overallScore >= 80) {
    nudges.push({
      ...NUDGE_TEMPLATES['high_engagement'],
      id: 'nudge-celebration-1',
      message: NUDGE_TEMPLATES['high_engagement'].message.replace('{percent}', analysis.overallScore.toString()),
    });
  }
  
  // Improving trend recognition
  if (analysis.trend === 'improving' && analysis.driftLevel !== 'none') {
    nudges.push({
      ...NUDGE_TEMPLATES['improving_trend'],
      id: 'nudge-improving-1',
    });
  }
  
  // Mild drift nudges
  if (analysis.driftLevel === 'mild') {
    const frequencyIssue = analysis.indicators.find(i => i.category === 'frequency' && i.severity !== 'none');
    const timingIssue = analysis.indicators.find(i => i.category === 'timing' && i.severity !== 'none');
    
    if (frequencyIssue) {
      nudges.push({
        ...NUDGE_TEMPLATES['missed_logging'],
        id: 'nudge-frequency-1',
      });
    }
    if (timingIssue) {
      nudges.push({
        ...NUDGE_TEMPLATES['timing_shift'],
        id: 'nudge-timing-1',
      });
    }
  }
  
  // Moderate drift nudges
  if (analysis.driftLevel === 'moderate') {
    nudges.push({
      ...NUDGE_TEMPLATES['life_happens'],
      id: 'nudge-support-1',
    });
    nudges.push({
      ...NUDGE_TEMPLATES['small_steps'],
      id: 'nudge-steps-1',
    });
  }
  
  // Significant drift nudges
  if (analysis.driftLevel === 'significant') {
    nudges.push({
      ...NUDGE_TEMPLATES['reduced_plan'],
      id: 'nudge-reduced-1',
    });
    if (analysis.trend === 'improving') {
      nudges.push({
        ...NUDGE_TEMPLATES['welcome_back'],
        id: 'nudge-welcome-1',
      });
    }
  }
  
  // Sort by priority
  return nudges.sort((a, b) => a.priority - b.priority);
}

// Get tone-appropriate colors for UI
export function getNudgeStyling(tone: NudgeTone): { bgClass: string; borderClass: string; iconClass: string } {
  switch (tone) {
    case 'celebratory':
      return {
        bgClass: 'bg-success/10',
        borderClass: 'border-success/30',
        iconClass: 'text-success',
      };
    case 'warm':
      return {
        bgClass: 'bg-primary/10',
        borderClass: 'border-primary/30',
        iconClass: 'text-primary',
      };
    case 'gentle':
      return {
        bgClass: 'bg-muted/50',
        borderClass: 'border-border',
        iconClass: 'text-muted-foreground',
      };
    case 'understanding':
      return {
        bgClass: 'bg-info/10',
        borderClass: 'border-info/30',
        iconClass: 'text-info',
      };
    default:
      return {
        bgClass: 'bg-card',
        borderClass: 'border-border',
        iconClass: 'text-foreground',
      };
  }
}
