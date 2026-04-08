'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getDeviceFingerprint } from '@/lib/utils'
import toast from 'react-hot-toast'

export function useRating(userId?: string) {
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({})
  const supabase = createClient()

  const submitRating = async (ideaId: string, rating: number): Promise<boolean> => {
    if (!userId) {
      toast.error('Sign in to rate ideas')
      return false
    }

    setSubmitting((s) => ({ ...s, [ideaId]: true }))

    try {
      const fingerprint = await getDeviceFingerprint()

      const { error } = await supabase
        .from('ratings')
        .upsert(
          {
            user_id: userId,
            idea_id: ideaId,
            rating,
            device_fingerprint: fingerprint,
          },
          { onConflict: 'user_id,idea_id' }
        )

      if (error) throw error

      toast.success(`Rated ${rating} ★`)
      return true
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit rating')
      return false
    } finally {
      setSubmitting((s) => ({ ...s, [ideaId]: false }))
    }
  }

  return { submitRating, submitting }
}
