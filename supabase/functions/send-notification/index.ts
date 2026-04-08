// supabase/functions/send-notification/index.ts
// Deploy with: supabase functions deploy send-notification

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailPayload {
  to: string
  subject: string
  type: 'welcome' | 'comment' | 'rating_milestone'
  data: Record<string, string>
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, type, data }: EmailPayload = await req.json()

    const resendKey = Deno.env.get('RESEND_API_KEY')
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') ?? 'noreply@idiots.app'

    if (!resendKey) {
      console.warn('RESEND_API_KEY not set — skipping email')
      return new Response(JSON.stringify({ skipped: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const html = buildEmailHtml(type, data)

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: `Idiots <${fromEmail}>`,
        to,
        subject,
        html,
      }),
    })

    const result = await response.json()

    if (!response.ok) throw new Error(result.message || 'Resend error')

    return new Response(JSON.stringify({ sent: true, id: result.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

function buildEmailHtml(type: string, data: Record<string, string>): string {
  const base = `
    <div style="font-family: 'DM Sans', sans-serif; background: #1F1D1B; color: #E8E4E0; padding: 40px; max-width: 520px; margin: 0 auto; border-radius: 16px;">
      <h1 style="font-family: Georgia, serif; font-size: 32px; color: #E8E4E0; margin-bottom: 8px;">Idiots</h1>
      <p style="color: #C9A84C; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 32px;">Explore · Validate · Experiment</p>
  `
  const footer = `
      <hr style="border: none; border-top: 1px solid #3A3836; margin: 32px 0;" />
      <p style="color: #7D7D7D; font-size: 12px;">You received this because you're a member of Idiots.</p>
    </div>
  `

  switch (type) {
    case 'welcome':
      return `${base}
        <h2 style="color: #C9A84C;">Welcome, ${data.username}!</h2>
        <p style="color: #B0B0B0; line-height: 1.7;">Your account is ready. Share your first idea and let the community decide.</p>
        <a href="${data.appUrl}/feed" style="display: inline-block; background: #C9A84C; color: #1F1D1B; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; margin-top: 20px;">Explore Ideas →</a>
      ${footer}`

    case 'comment':
      return `${base}
        <h2 style="color: #E8E4E0;">New comment on your idea</h2>
        <p style="color: #B0B0B0;"><strong style="color: #E8E4E0;">@${data.commenter}</strong> commented on <em>${data.ideaTitle}</em>:</p>
        <blockquote style="border-left: 2px solid #C9A84C; margin: 16px 0; padding-left: 16px; color: #B0B0B0; font-style: italic;">"${data.comment}"</blockquote>
      ${footer}`

    case 'rating_milestone':
      return `${base}
        <h2 style="color: #C9A84C;">🎉 Your idea is trending!</h2>
        <p style="color: #B0B0B0;"><strong style="color: #E8E4E0;">${data.ideaTitle}</strong> just hit <strong style="color: #C9A84C;">rank #${data.rank}</strong> on the leaderboard with ${data.votes} votes.</p>
      ${footer}`

    default:
      return `${base}<p>${JSON.stringify(data)}</p>${footer}`
  }
}
