'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export function useSaved(userId?: string) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return
    supabase
      .from('saved_ideas')
      .select('idea_id')
      .eq('user_id', userId)
      .then(({ data }) => {
        if (data) setSavedIds(new Set(data.map((r) => r.idea_id)))
      })
  }, [userId])

  const toggleSave = async (ideaId: string) => {
    if (!userId) {
      toast.error('Sign in to save ideas')
      return
    }

    const isSaved = savedIds.has(ideaId)

    if (isSaved) {
      const { error } = await supabase
        .from('saved_ideas')
        .delete()
        .eq('user_id', userId)
        .eq('idea_id', ideaId)

      if (!error) {
        setSavedIds((prev) => {
          const next = new Set(prev)
          next.delete(ideaId)
          return next
        })
        toast.success('Removed from saved')
      }
    } else {
      const { error } = await supabase
        .from('saved_ideas')
        .insert({ user_id: userId, idea_id: ideaId })

      if (!error) {
        setSavedIds((prev) => new Set([...prev, ideaId]))
        toast.success('Saved to profile')
      }
    }
  }

  return { savedIds, toggleSave, isSaved: (id: string) => savedIds.has(id) }
}
