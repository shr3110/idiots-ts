import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateIdea, parseTags } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, pitch, description, tags } = body

    const validationError = validateIdea(title, pitch)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    // Basic content moderation check
    const moderationResult = await moderateContent(`${title} ${pitch} ${description || ''}`)

    if (!moderationResult.safe) {
      return NextResponse.json(
        { error: 'Content flagged by moderation. Please revise and resubmit.' },
        { status: 422 }
      )
    }

    const parsedTags = parseTags(tags || '')

    const { data: idea, error } = await supabase
      .from('ideas')
      .insert({
        user_id: user.id,
        title: title.trim(),
        pitch: pitch.trim(),
        description: description?.trim() || null,
        tags: parsedTags,
        moderation_status: 'approved', // Can set to 'pending' if using async moderation
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data: idea })
  } catch (err: any) {
    console.error('POST /api/ideas error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Simple content moderation — replace with OpenAI Moderation API for production
async function moderateContent(text: string): Promise<{ safe: boolean; reason?: string }> {
  const blocked = ['spam', 'xxx', 'hate']
  const lower = text.toLowerCase()
  for (const word of blocked) {
    if (lower.includes(word)) return { safe: false, reason: 'Blocked content' }
  }
  return { safe: true }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sort = searchParams.get('sort') || 'created_at'

    const { data, error, count } = await supabase
      .from('ideas')
      .select('*, profiles(id, username, full_name, avatar_url)', { count: 'exact' })
      .eq('moderation_status', 'approved')
      .order(sort, { ascending: false })
      .range(page * limit, (page + 1) * limit - 1)

    if (error) throw error

    return NextResponse.json({
      data,
      count,
      page,
      hasMore: (count ?? 0) > (page + 1) * limit,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
