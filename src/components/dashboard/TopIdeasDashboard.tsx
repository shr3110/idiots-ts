'use client'

import { useTopIdeas } from '@/lib/hooks/useTopIdeas'
import { DashboardIdeaCard } from './DashboardIdeaCard'
import { DashboardSkeleton } from './DashboardSkeleton'
import { formatDistanceToNow } from 'date-fns'

export function TopIdeasDashboard() {
  const { ideas, isLoading, lastUpdated } = useTopIdeas(10)

  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2
          className="font-display font-bold"
          style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', color: 'var(--color-text)' }}
        >
          Top 10 Ideas
        </h2>
        <div className="flex items-center gap-2">
          <span className="realtime-dot" />
          <span className="text-xs font-mono" style={{ color: 'var(--color-secondary)' }}>
            Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Grid — φ-based layout */}
      {isLoading ? (
        <DashboardSkeleton />
      ) : ideas.length === 0 ? (
        <EmptyDashboard />
      ) : (
        <div className="space-y-3">
          {/* Top 3 — Prominent */}
          <div className="grid gap-3 sm:grid-cols-3 mb-1">
            {ideas.slice(0, 3).map((idea, i) => (
              <DashboardIdeaCard key={idea.id} idea={idea} rank={i + 1} prominent />
            ))}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 py-1">
            <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
            <span className="text-xs font-mono" style={{ color: 'var(--color-secondary)' }}>
              also trending
            </span>
            <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
          </div>

          {/* 4–10 — Compact list */}
          <div className="grid gap-2 sm:grid-cols-2">
            {ideas.slice(3, 10).map((idea, i) => (
              <DashboardIdeaCard key={idea.id} idea={idea} rank={i + 4} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyDashboard() {
  return (
    <div
      className="rounded-card p-16 text-center"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="text-5xl mb-4 opacity-20 font-display">∅</div>
      <p style={{ color: 'var(--color-secondary)' }}>
        No ideas yet. Be the first to post one!
      </p>
    </div>
  )
}
