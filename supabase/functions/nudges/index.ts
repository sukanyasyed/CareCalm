import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    if (req.method === 'GET') {
      // Get nudges
      const url = new URL(req.url);
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const unreadOnly = url.searchParams.get('unread') === 'true';

      let query = supabase
        .from('nudges')
        .select('id, message, nudge_type, tone, language, is_read, sent_at')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(limit);

      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching nudges:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch nudges' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get unread count
      const { count: unreadCount } = await supabase
        .from('nudges')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      return new Response(
        JSON.stringify({ 
          nudges: data,
          unreadCount: unreadCount || 0,
          disclaimer: "These are motivational messages only, not medical advice."
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (req.method === 'PATCH') {
      // Mark nudge(s) as read
      const body = await req.json();
      const { nudge_ids } = body;

      if (!nudge_ids || !Array.isArray(nudge_ids)) {
        return new Response(
          JSON.stringify({ error: 'nudge_ids array required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabase
        .from('nudges')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .in('id', nudge_ids);

      if (error) {
        console.error('Error updating nudges:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to update nudges' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, updated: nudge_ids.length }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Nudges endpoint error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
