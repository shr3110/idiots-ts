// supabase/functions/process-vote/index.ts
// Deploy with: supabase functions deploy process-vote

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // Verify JWT
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { idea_id, rating, device_fingerprint } = await req.json()

    if (!idea_id || !rating || rating < 1 || rating > 5) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check: user cannot rate their own idea
    const { data: idea } = await supabaseClient
      .from('ideas')
      .select('user_id')
      .eq('id', idea_id)
      .single()

    if (idea?.user_id === user.id) {
      return new Response(JSON.stringify({ error: 'Cannot rate your own idea' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Upsert rating
    const { error: ratingError } = await supabaseClient
      .from('ratings')
      .upsert(
        { user_id: user.id, idea_id, rating, device_fingerprint },
        { onConflict: 'user_id,idea_id' }
      )

    if (ratingError) throw ratingError

    // Recalculate score via DB function
    const { data: newScore, error: scoreError } = await supabaseClient
      .rpc('recalculate_idea_score', { p_idea_id: idea_id })

    if (scoreError) console.error('Score error:', scoreError)

    return new Response(
      JSON.stringify({ success: true, score: newScore }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
