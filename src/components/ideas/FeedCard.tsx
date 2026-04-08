'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Idea } from '@/types'
import { StarRating } from '@/components/ui/StarRating'
import { CommentPanel } from './CommentPanel'
import { getAvatarUrl, formatTimeAgo } from '@/lib/utils'

interface Props {
  idea: Idea
  onRate: (ideaId: string, rating: number) => void
  onSave: (ideaId: string) => void
  isSaved: boolean
  isSubmittingRating: boolean
  currentUserId?: string
}

export function FeedCard({ idea, onRate, onSave, isSaved, isSubmittingRating, currentUserId }: Props) {
  const [showComments, setShowComments] = useState(false)
  const [localRating, setLocalRating] = useState<number>(idea.user_rating || 0)

  const isOwnIdea = currentUserId === idea.user_id

  const handleRate = (rating: number) => {
    setLocalRating(rating)
    onRate(idea.id, rating)
  }

  return (
    <>
      <div
        className="w-full max-w-[520px] mx-auto px-4 flex flex-col gap-4"
        style={{ paddingTop: '80px', paddingBottom: '80px' }}
      >
        {/* Card */}
        <div
          className="rounded-card overflow-hidden"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {/* Author Header */}
          <div
            className="flex items-center gap-3 px-5 pt-5 pb-4"
            style={{ borderBottom: '1px solid var(--color-border)' }}
          >
            {idea.profiles && (
              <>
                <div className="relative w-9 h-9 flex-shrink-0">
                  <Image
                    src={getAvatarUrl(idea.profiles)}
                    alt={idea.profiles.username}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                    {idea.profiles.full_name || idea.profiles.username}
                  </p>
                  <p className="text-xs font-mono" style={{ color: 'var(--color-secondary)' }}>
                    @{idea.profiles.username} · {formatTimeAgo(idea.created_at)}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Content */}
          <div className="px-5 py-5">
            <h2
              className="font-display font-bold mb-3 leading-tight"
              style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', color: 'var(--color-text)' }}
            >
              {idea.title}
            </h2>
            <p
              className="text-base leading-relaxed"
              style={{ color: 'var(--color-accent)' }}
            >
              {idea.pitch}
            </p>
            {idea.description && (
              <p
                className="text-sm mt-3 leading-relaxed"
                style={{ color: 'var(--color-secondary)' }}
              >
                {idea.description}
              </p>
            )}

            {/* Tags */}
            {idea.tags && idea.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {idea.tags.map((tag) => (
                  <span key={tag} className="tag-pill">{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Stats Bar */}
          <div
            className="flex items-center gap-4 px-5 py-3"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center gap-1.5">
              <span style={{ color: 'var(--color-gold)' }}>★</span>
              <span className="text-sm font-bold" style={{ color: 'var(--color-gold)' }}>
                {(idea.avg_rating || 0).toFixed(1)}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-secondary)' }}>
                ({idea.vote_count} {idea.vote_count === 1 ? 'vote' : 'votes'})
              </span>
            </div>

            {idea.rank && (
              <span
                className="ml-auto text-xs font-mono font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: idea.rank <= 3 ? 'rgba(201,168,76,0.15)' : 'var(--color-surface-raised)',
                  color: idea.rank <= 3 ? 'var(--color-gold)' : 'var(--color-secondary)',
                }}
              >
                #{idea.rank}
              </span>
            )}
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex items-center gap-3">
          {/* Rating */}
          {!isOwnIdea && currentUserId && (
            <div
              className="flex-1 rounded-[12px] px-4 py-3 flex items-center gap-2"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <span className="text-xs" style={{ color: 'var(--color-secondary)' }}>Rate:</span>
              <StarRating
                value={localRating}
                onChange={handleRate}
                size="sm"
                readonly={isSubmittingRating}
              />
            </div>
          )}

          {/* Save */}
          <button
            onClick={() => onSave(idea.id)}
            className="w-12 h-12 rounded-[12px] flex items-center justify-center transition-all duration-200"
            style={{
              background: isSaved ? 'rgba(201,168,76,0.15)' : 'var(--color-surface)',
              border: `1px solid ${isSaved ? 'rgba(201,168,76,0.4)' : 'var(--color-border)'}`,
              color: isSaved ? 'var(--color-gold)' : 'var(--color-secondary)',
            }}
            aria-label={isSaved ? 'Unsave' : 'Save'}
          >
            <BookmarkIcon filled={isSaved} />
          </button>

          {/* Comment */}
          <button
            onClick={() => setShowComments(true)}
            className="w-12 h-12 rounded-[12px] flex items-center justify-center transition-all duration-200"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-secondary)',
            }}
            aria-label="Comments"
          >
            <CommentIcon />
          </button>
        </div>
      </div>

      {/* Comment Panel */}
      {showComments && (
        <CommentPanel
          ideaId={idea.id}
          currentUserId={currentUserId}
          onClose={() => setShowComments(false)}
        />
      )}
    </>
  )
}

const BookmarkIcon = ({ filled }: { filled: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
    <path d="M5 2a1 1 0 0 0-1 1v14l6-3 6 3V3a1 1 0 0 0-1-1H5z" />
  </svg>
)

const CommentIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6l-4 3V5z" />
  </svg>
)
