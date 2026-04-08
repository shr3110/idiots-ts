'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Idea } from '@/types'
import { getRankStyle, truncate } from '@/lib/utils'
import { StarRating } from '@/components/ui/StarRating'
import { useAuthStore } from '@/lib/hooks/useAuthStore'
import { useRating } from '@/lib/hooks/useRating'

interface Props {
  idea: Idea
  rank: number
  prominent?: boolean
}

export function DashboardIdeaCard({ idea, rank, prominent = false }: Props) {
  const { profile } = useAuthStore()
  const { submitRating, submitting } = useRating(profile?.id)
  const [localRating, setLocalRating] = useState(0)

  const rankStyle = getRankStyle(rank)

  const handleRate = async (rating: number) => {
    setLocalRating(rating)
    await submitRating(idea.id, rating)
  }

  if (prominent) {
    return (
      <div
        className="rounded-card p-5 relative flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 cursor-default"
        style={{
          background: 'var(--color-surface)',
          border: `1px solid ${rank === 1 ? 'rgba(201,168,76,0.3)' : 'var(--color-border)'}`,
          boxShadow: rank === 1 ? 'var(--shadow-glow)' : 'var(--shadow-card)',
          minHeight: '200px',
        }}
      >
        {/* Rank Badge */}
        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${rankStyle.bg} ${rankStyle.text}`}
          >
            {rankStyle.label}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-xs" style={{ color: 'var(--color-gold)' }}>★</span>
            <span className="text-sm font-bold" style={{ color: 'var(--color-gold)' }}>
              {(idea.avg_rating || 0).toFixed(1)}
            </span>
            <span className="text-xs" style={{ color: 'var(--color-secondary)' }}>
              ({idea.vote_count})
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="flex-1">
          <h3
            className="font-display font-bold leading-tight"
            style={{
              fontSize: prominent ? '1.1rem' : '1rem',
              color: 'var(--color-text)',
            }}
          >
            {truncate(idea.title, 60)}
          </h3>
          <p
            className="text-sm mt-1 line-clamp-2"
            style={{ color: 'var(--color-secondary)' }}
          >
            {idea.pitch}
          </p>
        </div>

        {/* Author */}
        {idea.profiles && (
          <p className="text-xs font-mono" style={{ color: 'var(--color-secondary)' }}>
            by @{idea.profiles.username}
          </p>
        )}

        {/* Rate inline */}
        {profile && profile.id !== idea.user_id && (
          <div className="pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <StarRating
              value={localRating || idea.user_rating || 0}
              onChange={handleRate}
              size="sm"
            />
          </div>
        )}
      </div>
    )
  }

  // Compact row for ranks 4–10
  return (
    <div
      className="rounded-[12px] px-4 py-3 flex items-center gap-3 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      <span
        className="text-xs font-bold font-mono w-6 text-center flex-shrink-0"
        style={{ color: 'var(--color-secondary)' }}
      >
        #{rank}
      </span>
      <div className="flex-1 min-w-0">
        <h3
          className="font-medium text-sm truncate"
          style={{ color: 'var(--color-text)' }}
        >
          {idea.title}
        </h3>
        <p
          className="text-xs truncate"
          style={{ color: 'var(--color-secondary)' }}
        >
          {idea.pitch}
        </p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-xs" style={{ color: 'var(--color-gold)' }}>★</span>
        <span className="text-sm font-bold" style={{ color: 'var(--color-gold)' }}>
          {(idea.avg_rating || 0).toFixed(1)}
        </span>
      </div>
    </div>
  )
}
