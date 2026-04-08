'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Idea } from '@/types'

const PAGE_SIZE = 10

export function useFeed(userId?: string) {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const pageRef = useRef(0)
  const supabase = createClient()

  const fetchIdeas = useCallback(async (page: number) => {
    setIsLoading(true)

    const { data, error } = await supabase
      .from('ideas')
      .select(`
        *,
        profiles (id, username, full_name, avatar_url),
        comment_count:comments(count)
      `)
      .eq('moderation_status', 'approved')
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (!error && data) {
      if (page === 0) {
        setIdeas(data as Idea[])
      } else {
        setIdeas((prev) => [...prev, ...(data as Idea[])])
      }
      setHasMore(data.length === PAGE_SIZE)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchIdeas(0)
  }, [fetchIdeas])

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      pageRef.current += 1
      fetchIdeas(pageRef.current)
    }
  }, [isLoading, hasMore, fetchIdeas])

  const goNext = useCallback(() => {
    if (currentIndex < ideas.length - 1) {
      setCurrentIndex((i) => i + 1)
      if (currentIndex >= ideas.length - 3) loadMore()
    }
  }, [currentIndex, ideas.length, loadMore])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1)
  }, [currentIndex])

  const updateIdeaRating = useCallback((ideaId: string, newAvg: number, newCount: number) => {
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === ideaId
          ? { ...idea, avg_rating: newAvg, vote_count: newCount }
          : idea
      )
    )
  }, [])

  return {
    ideas,
    currentIdea: ideas[currentIndex] ?? null,
    currentIndex,
    isLoading,
    hasMore,
    goNext,
    goPrev,
    loadMore,
    updateIdeaRating,
  }
}
