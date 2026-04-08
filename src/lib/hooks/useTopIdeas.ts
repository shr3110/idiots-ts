'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Idea } from '@/types'

export function useTopIdeas(limit = 10) {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const supabase = createClient()

  const fetchTopIdeas = useCallback(async () => {
    const { data, error } = await supabase
      .from('ideas')
      .select(`
        *,
        profiles (id, username, full_name, avatar_url)
      `)
      .eq('moderation_status', 'approved')
      .order('score', { ascending: false })
      .limit(limit)

    if (!error && data) {
      setIdeas(data as Idea[])
      setLastUpdated(new Date())
    }
    setIsLoading(false)
  }, [limit])

  useEffect(() => {
    fetchTopIdeas()

    // Realtime subscription on ratings table changes
    const channel = supabase
      .channel('top-ideas-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ratings' },
        () => {
          // Debounce — wait 500ms before refetch
          setTimeout(fetchTopIdeas, 500)
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'ideas' },
        (payload) => {
          setIdeas((prev) =>
            prev.map((idea) =>
              idea.id === payload.new.id ? { ...idea, ...payload.new } : idea
            )
          )
          setLastUpdated(new Date())
        }
      )
      .subscribe()

    // Refresh every 60 seconds
    const interval = setInterval(fetchTopIdeas, 60_000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [fetchTopIdeas])

  return { ideas, isLoading, lastUpdated, refetch: fetchTopIdeas }
}
