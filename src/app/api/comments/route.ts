import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { idea_id, content, parent_id } = await request.json()

    if (!idea_id || !content?.trim()) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    if (content.trim().length > 1000) {
      return NextResponse.json({ error: 'Comment too long (max 1000 chars)' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: user.id,
        idea_id,
        content: content.trim(),
        parent_id: parent_id || null,
      })
      .select('*, profiles(id, username, full_name, avatar_url)')
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const idea_id = searchParams.get('idea_id')

    if (!idea_id) return NextResponse.json({ error: 'idea_id required' }, { status: 400 })

    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles(id, username, full_name, avatar_url)')
      .eq('idea_id', idea_id)
      .is('parent_id', null)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
