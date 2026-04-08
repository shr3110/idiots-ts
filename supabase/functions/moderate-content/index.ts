// supabase/functions/moderate-content/index.ts
// Deploy with: supabase functions deploy moderate-content

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
    const { text, idea_id } = await req.json()

    if (!text) {
      return new Response(JSON.stringify({ safe: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY')

    let isSafe = true
    let moderationResult: any = null

    if (openaiKey) {
      // Use OpenAI Moderation API
      const response = await fetch('https://api.openai.com/v1/moderations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({ input: text }),
      })

      const data = await response.json()
      moderationResult = data.results?.[0]
      isSafe = !moderationResult?.flagged
    } else {
      // Fallback: basic keyword filter
      const blocked = ['spam', 'violence', 'hate', 'xxx', 'abuse']
      const lower = text.toLowerCase()
      isSafe = !blocked.some((w) => lower.includes(w))
    }

    // If idea_id provided, update moderation status in DB
    if (idea_id) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      await supabase
        .from('ideas')
        .update({
          moderation_status: isSafe ? 'approved' : 'rejected',
          is_moderated: true,
        })
        .eq('id', idea_id)
    }

    return new Response(
      JSON.stringify({ safe: isSafe, result: moderationResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
