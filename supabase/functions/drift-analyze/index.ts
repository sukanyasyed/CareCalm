import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Drift detection thresholds
const THRESHOLDS = {
  FREQUENCY_DROP: {
    mild: 0.7,      // 70% of baseline
    moderate: 0.5,  // 50% of baseline
    significant: 0.3 // 30% of baseline
  },
  TIMING_VARIANCE: {
    mild: 2,        // 2 hours variance
    moderate: 4,    // 4 hours variance
    significant: 6  // 6+ hours variance
  },
  VARIETY_SCORE: {
    mild: 0.6,      // 60% variety
    moderate: 0.4,  // 40% variety
    significant: 0.2 // 20% variety
  }
};

// Empathetic nudge templates (non-clinical, no fear language)
const NUDGE_TEMPLATES = {
  encouragement: {
    en: [
      "You're doing a wonderful job staying consistent. Every small step matters!",
      "Your dedication to self-care is truly inspiring. Keep it up!",
      "We noticed you've been on track lately. That's amazing progress!"
    ],
    es: [
      "¡Estás haciendo un trabajo maravilloso manteniéndote constante!",
      "Tu dedicación al autocuidado es verdaderamente inspiradora.",
      "Hemos notado que has estado en el buen camino. ¡Es un progreso increíble!"
    ],
    hi: [
      "आप निरंतर रहने में अद्भुत काम कर रहे हैं। हर छोटा कदम मायने रखता है!",
      "आत्म-देखभाल के प्रति आपका समर्पण वास्तव में प्रेरणादायक है।",
      "हमने देखा कि आप हाल ही में सही रास्ते पर हैं। यह अद्भुत प्रगति है!"
    ]
  },
  gentle_reminder: {
    en: [
      "Life gets busy sometimes. Would you like to log a quick update when you have a moment?",
      "We're here whenever you're ready. No pressure, just support.",
      "It's been a little quiet. Everything okay? We're here for you."
    ],
    es: [
      "La vida se pone ocupada a veces. ¿Te gustaría registrar una actualización rápida?",
      "Estamos aquí cuando estés listo. Sin presión, solo apoyo.",
      "Ha estado un poco tranquilo. ¿Todo bien? Estamos aquí para ti."
    ],
    hi: [
      "जीवन कभी-कभी व्यस्त हो जाता है। क्या आप एक त्वरित अपडेट लॉग करना चाहेंगे?",
      "जब भी आप तैयार हों, हम यहां हैं। कोई दबाव नहीं, बस समर्थन।",
      "थोड़ी शांति रही है। सब ठीक है? हम आपके लिए यहां हैं।"
    ]
  },
  supportive: {
    en: [
      "Looks like your routine's been busy lately. Would a lighter plan for the next few days help?",
      "We understand routines can be challenging. How about we simplify things for now?",
      "Taking a step back is okay. Would you like us to adjust your daily goals?"
    ],
    es: [
      "Parece que tu rutina ha estado ocupada últimamente. ¿Te ayudaría un plan más ligero?",
      "Entendemos que las rutinas pueden ser desafiantes. ¿Qué tal si simplificamos las cosas?",
      "Está bien dar un paso atrás. ¿Te gustaría que ajustemos tus metas diarias?"
    ],
    hi: [
      "लगता है आपकी दिनचर्या व्यस्त रही है। क्या कुछ दिनों के लिए हल्की योजना मदद करेगी?",
      "हम समझते हैं कि दिनचर्या चुनौतीपूर्ण हो सकती है। चीजों को सरल बनाएं?",
      "एक कदम पीछे लेना ठीक है। क्या आप चाहेंगे कि हम आपके दैनिक लक्ष्यों को समायोजित करें?"
    ]
  },
  celebration: {
    en: [
      "🎉 You're back on track! Your consistency is really shining through.",
      "Welcome back! We're so glad to see you engaging again.",
      "Your comeback is inspiring! Every effort counts."
    ],
    es: [
      "🎉 ¡Estás de vuelta en el camino! Tu consistencia realmente brilla.",
      "¡Bienvenido de vuelta! Nos alegra mucho verte comprometido de nuevo.",
      "¡Tu regreso es inspirador! Cada esfuerzo cuenta."
    ],
    hi: [
      "🎉 आप वापस रास्ते पर हैं! आपकी निरंतरता वास्तव में चमक रही है।",
      "वापसी पर स्वागत है! आपको फिर से जुड़े हुए देखकर खुशी हुई।",
      "आपकी वापसी प्रेरणादायक है! हर प्रयास मायने रखता है।"
    ]
  }
};

interface DriftAnalysis {
  userId: string;
  driftLevel: 'none' | 'mild' | 'moderate' | 'significant';
  driftType: string | null;
  engagementScore: number;
  frequencyScore: number;
  timingScore: number;
  varietyScore: number;
  trend: 'improving' | 'stable' | 'declining';
  metadata: Record<string, unknown>;
}

function analyzeDrift(logs: Array<{ log_type: string; logged_at: string }>): Omit<DriftAnalysis, 'userId'> {
  if (logs.length === 0) {
    return {
      driftLevel: 'significant',
      driftType: 'frequency_drop',
      engagementScore: 0,
      frequencyScore: 0,
      timingScore: 0,
      varietyScore: 0,
      trend: 'declining',
      metadata: { logsCount: 0, daysAnalyzed: 14 }
    };
  }

  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Split logs into two weeks for trend analysis
  const recentLogs = logs.filter(l => new Date(l.logged_at) >= sevenDaysAgo);
  const olderLogs = logs.filter(l => new Date(l.logged_at) >= fourteenDaysAgo && new Date(l.logged_at) < sevenDaysAgo);

  // Calculate frequency score (logs per day)
  const recentDays = 7;
  const olderDays = 7;
  const recentFrequency = recentLogs.length / recentDays;
  const olderFrequency = olderLogs.length / olderDays;
  const baselineFrequency = Math.max(olderFrequency, 2); // Assume at least 2 logs/day as baseline
  
  const frequencyRatio = recentFrequency / baselineFrequency;
  const frequencyScore = Math.min(100, Math.round(frequencyRatio * 100));

  // Calculate timing consistency (variance in log times)
  const logHours = recentLogs.map(l => new Date(l.logged_at).getHours());
  const avgHour = logHours.reduce((a, b) => a + b, 0) / (logHours.length || 1);
  const variance = logHours.reduce((sum, h) => sum + Math.pow(h - avgHour, 2), 0) / (logHours.length || 1);
  const stdDev = Math.sqrt(variance);
  const timingScore = Math.max(0, Math.min(100, Math.round((6 - stdDev) / 6 * 100)));

  // Calculate variety score (different log types)
  const logTypes = new Set(recentLogs.map(l => l.log_type));
  const expectedTypes = 4; // glucose, bp, activity, diet
  const varietyScore = Math.round((logTypes.size / expectedTypes) * 100);

  // Calculate overall engagement score
  const engagementScore = Math.round((frequencyScore * 0.4 + timingScore * 0.3 + varietyScore * 0.3));

  // Determine drift level and type
  let driftLevel: 'none' | 'mild' | 'moderate' | 'significant' = 'none';
  let driftType: string | null = null;

  if (frequencyRatio < THRESHOLDS.FREQUENCY_DROP.significant) {
    driftLevel = 'significant';
    driftType = 'frequency_drop';
  } else if (frequencyRatio < THRESHOLDS.FREQUENCY_DROP.moderate) {
    driftLevel = 'moderate';
    driftType = 'frequency_drop';
  } else if (frequencyRatio < THRESHOLDS.FREQUENCY_DROP.mild) {
    driftLevel = 'mild';
    driftType = 'frequency_drop';
  } else if (stdDev > THRESHOLDS.TIMING_VARIANCE.significant) {
    driftLevel = 'significant';
    driftType = 'irregular_timing';
  } else if (stdDev > THRESHOLDS.TIMING_VARIANCE.moderate) {
    driftLevel = 'moderate';
    driftType = 'irregular_timing';
  } else if (varietyScore < THRESHOLDS.VARIETY_SCORE.significant * 100) {
    driftLevel = 'moderate';
    driftType = 'sparse_variety';
  }

  // Determine trend
  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (recentFrequency > olderFrequency * 1.2) {
    trend = 'improving';
  } else if (recentFrequency < olderFrequency * 0.8) {
    trend = 'declining';
  }

  return {
    driftLevel,
    driftType,
    engagementScore,
    frequencyScore,
    timingScore,
    varietyScore,
    trend,
    metadata: {
      logsCount: logs.length,
      recentLogsCount: recentLogs.length,
      olderLogsCount: olderLogs.length,
      logTypes: Array.from(logTypes),
      frequencyRatio: Math.round(frequencyRatio * 100) / 100,
      timingVariance: Math.round(stdDev * 100) / 100,
      daysAnalyzed: 14
    }
  };
}

function selectNudge(analysis: Omit<DriftAnalysis, 'userId'>, language: string = 'en'): { message: string; type: string; tone: string } {
  const lang = ['en', 'es', 'hi'].includes(language) ? language : 'en';
  
  let category: keyof typeof NUDGE_TEMPLATES;
  let tone: string;

  if (analysis.trend === 'improving' && analysis.driftLevel === 'none') {
    category = 'celebration';
    tone = 'celebratory';
  } else if (analysis.driftLevel === 'none' || analysis.driftLevel === 'mild') {
    category = 'encouragement';
    tone = 'warm';
  } else if (analysis.driftLevel === 'moderate') {
    category = 'gentle_reminder';
    tone = 'gentle';
  } else {
    category = 'supportive';
    tone = 'understanding';
  }

  const templates = NUDGE_TEMPLATES[category][lang as keyof typeof NUDGE_TEMPLATES['encouragement']];
  const message = templates[Math.floor(Math.random() * templates.length)];

  return { message, type: category, tone };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Running drift analysis for user: ${user.id}`);

    // Get user's language preference
    const { data: profile } = await supabase
      .from('profiles')
      .select('language')
      .eq('user_id', user.id)
      .maybeSingle();

    const language = profile?.language || 'en';

    // Get logs from last 14 days
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const { data: logs, error: logsError } = await supabase
      .from('activity_logs')
      .select('log_type, logged_at')
      .eq('user_id', user.id)
      .gte('logged_at', fourteenDaysAgo)
      .order('logged_at', { ascending: false });

    if (logsError) {
      console.error('Error fetching logs:', logsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch activity logs' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Analyze drift
    const analysis = analyzeDrift(logs || []);
    const fullAnalysis: DriftAnalysis = { userId: user.id, ...analysis };

    console.log('Drift analysis result:', JSON.stringify(fullAnalysis, null, 2));

    // Store drift event if drift detected
    if (analysis.driftLevel !== 'none' && analysis.driftType) {
      const { error: insertError } = await supabase
        .from('drift_events')
        .insert({
          user_id: user.id,
          drift_type: analysis.driftType,
          drift_level: analysis.driftLevel,
          engagement_score: analysis.engagementScore,
          metadata: analysis.metadata
        });

      if (insertError) {
        console.error('Error storing drift event:', insertError);
      }
    }

    // Generate and store nudge
    const nudge = selectNudge(analysis, language);
    const { error: nudgeError } = await supabase
      .from('nudges')
      .insert({
        user_id: user.id,
        message: nudge.message,
        nudge_type: nudge.type,
        tone: nudge.tone,
        language
      });

    if (nudgeError) {
      console.error('Error storing nudge:', nudgeError);
    }

    // Return structured JSON response
    const response = {
      disclaimer: "This analysis is for engagement tracking only. It is not medical advice and does not assess health conditions.",
      analysis: {
        engagementScore: analysis.engagementScore,
        driftLevel: analysis.driftLevel,
        driftType: analysis.driftType,
        trend: analysis.trend,
        scores: {
          frequency: analysis.frequencyScore,
          timing: analysis.timingScore,
          variety: analysis.varietyScore
        },
        metadata: analysis.metadata
      },
      nudge: {
        message: nudge.message,
        type: nudge.type,
        tone: nudge.tone,
        language
      },
      recommendations: analysis.driftLevel === 'significant' ? {
        suggestReducedPlan: true,
        message: language === 'es' 
          ? "Consideramos reducir temporalmente tus tareas diarias para ayudarte a retomar el ritmo."
          : language === 'hi'
          ? "हम आपको फिर से शुरू करने में मदद के लिए अस्थायी रूप से दैनिक कार्यों को कम करने पर विचार कर रहे हैं।"
          : "We're considering temporarily reducing daily tasks to help you get back on track."
      } : null,
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Drift analysis error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
