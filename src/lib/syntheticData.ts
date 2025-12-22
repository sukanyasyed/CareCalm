// Synthetic data generator for behavioral drift detection
// All data is artificially generated - no real patient data

export interface LogEntry {
  id: string;
  type: 'glucose' | 'meal' | 'activity' | 'medication' | 'weight';
  timestamp: Date;
  value?: number;
  notes?: string;
}

export interface DailyEngagement {
  date: Date;
  logsCount: number;
  expectedLogs: number;
  timingConsistency: number; // 0-1 score
  completedTasks: number;
  totalTasks: number;
  activityMinutes: number;
  mealLogsCount: number;
  glucoseChecks: number;
}

export interface PatientBehaviorData {
  patientId: string;
  dailyEngagement: DailyEngagement[];
  recentLogs: LogEntry[];
  averageLogsPerDay: number;
  streakDays: number;
  lastActiveDate: Date;
}

// Generate synthetic log entries
function generateSyntheticLogs(days: number, engagementLevel: number): LogEntry[] {
  const logs: LogEntry[] = [];
  const now = new Date();
  
  for (let d = 0; d < days; d++) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    
    // Vary engagement based on the level (simulating drift)
    const dailyEngagement = Math.max(0.1, engagementLevel - (d * 0.02));
    const logsToday = Math.floor(Math.random() * 8 * dailyEngagement);
    
    for (let l = 0; l < logsToday; l++) {
      const types: LogEntry['type'][] = ['glucose', 'meal', 'activity', 'medication', 'weight'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      const logTime = new Date(date);
      logTime.setHours(6 + Math.floor(Math.random() * 16));
      logTime.setMinutes(Math.floor(Math.random() * 60));
      
      logs.push({
        id: `log-${d}-${l}`,
        type,
        timestamp: logTime,
        value: type === 'glucose' ? 80 + Math.random() * 120 : undefined,
      });
    }
  }
  
  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// Generate daily engagement metrics
function generateDailyEngagement(days: number, driftPattern: 'stable' | 'declining' | 'recovering'): DailyEngagement[] {
  const engagement: DailyEngagement[] = [];
  const now = new Date();
  
  for (let d = 0; d < days; d++) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    
    let engagementMultiplier = 1;
    
    if (driftPattern === 'declining') {
      // Recent days have lower engagement
      engagementMultiplier = Math.max(0.2, 1 - (days - d) * 0.08);
    } else if (driftPattern === 'recovering') {
      // V-shaped: low in middle, recovering recently
      const midpoint = days / 2;
      engagementMultiplier = d < midpoint 
        ? 0.4 + (midpoint - d) * 0.08 
        : 0.4 + (d - midpoint) * 0.08;
    }
    
    const expectedLogs = 6;
    const logsCount = Math.round(expectedLogs * engagementMultiplier * (0.8 + Math.random() * 0.4));
    const expectedTasks = 5;
    const completedTasks = Math.round(expectedTasks * engagementMultiplier * (0.7 + Math.random() * 0.5));
    
    engagement.push({
      date,
      logsCount: Math.max(0, logsCount),
      expectedLogs,
      timingConsistency: Math.min(1, Math.max(0, engagementMultiplier * (0.7 + Math.random() * 0.3))),
      completedTasks: Math.min(expectedTasks, Math.max(0, completedTasks)),
      totalTasks: expectedTasks,
      activityMinutes: Math.round(30 * engagementMultiplier * (0.5 + Math.random())),
      mealLogsCount: Math.round(3 * engagementMultiplier * (0.6 + Math.random() * 0.6)),
      glucoseChecks: Math.round(4 * engagementMultiplier * (0.5 + Math.random() * 0.7)),
    });
  }
  
  return engagement;
}

// Main function to generate synthetic patient data
export function generateSyntheticPatientData(
  patientId: string = 'patient-001',
  driftPattern: 'stable' | 'declining' | 'recovering' = 'declining'
): PatientBehaviorData {
  const days = 14;
  const dailyEngagement = generateDailyEngagement(days, driftPattern);
  
  const engagementLevel = driftPattern === 'stable' ? 0.85 
    : driftPattern === 'declining' ? 0.4 
    : 0.7;
  
  const recentLogs = generateSyntheticLogs(days, engagementLevel);
  
  const averageLogsPerDay = dailyEngagement.reduce((sum, d) => sum + d.logsCount, 0) / days;
  
  // Calculate streak
  let streakDays = 0;
  for (const day of dailyEngagement) {
    if (day.logsCount >= day.expectedLogs * 0.5) {
      streakDays++;
    } else {
      break;
    }
  }
  
  return {
    patientId,
    dailyEngagement,
    recentLogs,
    averageLogsPerDay,
    streakDays,
    lastActiveDate: recentLogs[0]?.timestamp || new Date(),
  };
}

// Export sample scenarios for demo
export const SAMPLE_SCENARIOS = {
  engaged: () => generateSyntheticPatientData('sukanya-001', 'stable'),
  drifting: () => generateSyntheticPatientData('sukanya-001', 'declining'),
  recovering: () => generateSyntheticPatientData('sukanya-001', 'recovering'),
};
