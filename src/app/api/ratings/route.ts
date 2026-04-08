import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { idea_id, rating, device_fingerprint } = await request.json()

    if (!idea_id || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid rating data' }, { status: 400 })
    }

    // Upsert rating (one per user per idea)
    const { error: ratingError } = await supabase
      .from('ratings')
      .upsert(
        { user_id: user.id, idea_id, rating, device_fingerprint },
        { onConflict: 'user_id,idea_id' }
      )

    if (ratingError) throw ratingError

    // Recalculate score via DB function
    const { data: updated, error: scoreError } = await supabase
      .rpc('recalculate_idea_score', { p_idea_id: idea_id })

    if (scoreError) console.error('Score recalculation error:', scoreError)

    return NextResponse.json({ success: true, score: updated })
  } catch (err: any) {
    console.error('POST /api/ratings error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
