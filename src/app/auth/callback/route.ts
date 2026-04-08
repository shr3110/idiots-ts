import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Upsert profile on first login
      await supabase.from('profiles').upsert(
        {
          id: data.user.id,
          email: data.user.email!,
          username:
            data.user.user_metadata?.preferred_username ||
            data.user.email!.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_'),
          full_name: data.user.user_metadata?.full_name || null,
          avatar_url: data.user.user_metadata?.avatar_url || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id', ignoreDuplicates: false }
      )

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=auth_callback_failed`)
}
