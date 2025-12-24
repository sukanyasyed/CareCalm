import { supabase } from "@/integrations/supabase/client";

export type LogType = 'glucose' | 'bp' | 'activity' | 'diet' | 'medication' | 'weight';

interface LogEntry {
  id: string;
  log_type: LogType;
  logged_at: string;
  created_at: string;
}

interface LogsResponse {
  logs: LogEntry[];
  summary: {
    total: number;
    byType: Record<string, number>;
    daysWithLogs: number;
  };
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
  disclaimer: string;
}

interface DriftAnalysisResponse {
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

interface NudgesResponse {
  nudges: Array<{
    id: string;
    message: string;
    nudge_type: string;
    tone: string;
    language: string;
    is_read: boolean;
    sent_at: string;
  }>;
  unreadCount: number;
  disclaimer: string;
}

export function useBackendApi() {
  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }
    return {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  };

  const createLog = async (logType: LogType, loggedAt?: string): Promise<{ success: boolean; log: LogEntry }> => {
    const { data, error } = await supabase.functions.invoke('logs', {
      method: 'POST',
      body: { log_type: logType, logged_at: loggedAt },
    });

    if (error) throw error;
    return data;
  };

  const getLogHistory = async (options?: {
    limit?: number;
    offset?: number;
    logType?: LogType;
    days?: number;
  }): Promise<LogsResponse> => {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.offset) params.set('offset', options.offset.toString());
    if (options?.logType) params.set('log_type', options.logType);
    if (options?.days) params.set('days', options.days.toString());

    const { data, error } = await supabase.functions.invoke('logs', {
      method: 'GET',
      body: Object.fromEntries(params),
    });

    if (error) throw error;
    return data;
  };

  const analyzeDrift = async (): Promise<DriftAnalysisResponse> => {
    const { data, error } = await supabase.functions.invoke('drift-analyze', {
      method: 'POST',
    });

    if (error) throw error;
    return data;
  };

  const getNudges = async (options?: {
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<NudgesResponse> => {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.unreadOnly) params.set('unread', 'true');

    const { data, error } = await supabase.functions.invoke('nudges', {
      method: 'GET',
      body: Object.fromEntries(params),
    });

    if (error) throw error;
    return data;
  };

  const markNudgesAsRead = async (nudgeIds: string[]): Promise<{ success: boolean }> => {
    const { data, error } = await supabase.functions.invoke('nudges', {
      method: 'PATCH',
      body: { nudge_ids: nudgeIds },
    });

    if (error) throw error;
    return data;
  };

  return {
    createLog,
    getLogHistory,
    analyzeDrift,
    getNudges,
    markNudgesAsRead,
  };
}
