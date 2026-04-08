'use client'

import { useEffect, useRef } from 'react'
import { useFeed } from '@/lib/hooks/useFeed'
import { useAuthStore } from '@/lib/hooks/useAuthStore'
import { useRating } from '@/lib/hooks/useRating'
import { useSaved } from '@/lib/hooks/useSaved'
import { FeedCard } from './FeedCard'
import { IdeaPostModal } from './IdeaPostModal'
import { useState } from 'react'
import Link from 'next/link'

export function IdeaFeed() {
  const { profile } = useAuthStore()
  const { ideas, isLoading, hasMore, goNext, goPrev, currentIndex, loadMore, updateIdeaRating } = useFeed(profile?.id)
  const { submitRating, submitting } = useRating(profile?.id)
  const { savedIds, toggleSave } = useSaved(profile?.id)
  const [showPostModal, setShowPostModal] = useState(false)
  const feedRef = useRef<HTMLDivElement>(null)

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') goNext()
      if (e.key === 'ArrowUp') goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goNext, goPrev])

  // Touch / scroll snap navigation
  useEffect(() => {
    const container = feedRef.current
    if (!container) return

    let lastScrollTop = 0
    let ticking = false

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = container.scrollTop
          const itemHeight = container.clientHeight
          const newIndex = Math.round(scrollTop / itemHeight)

          if (newIndex !== Math.round(lastScrollTop / itemHeight)) {
            if (newIndex > ideas.length - 3 && hasMore) loadMore()
          }
          lastScrollTop = scrollTop
          ticking = false
        })
        ticking = true
      }
    }

    container.addEventListener('scroll', onScroll, { passive: true })
    return () => container.removeEventListener('scroll', onScroll)
  }, [ideas.length, hasMore, loadMore])

  // Scroll to current index programmatically when using arrow/buttons
  useEffect(() => {
    const container = feedRef.current
    if (!container) return
    const target = container.children[currentIndex] as HTMLElement
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [currentIndex])

  const handleRate = async (ideaId: string, rating: number) => {
    const success = await submitRating(ideaId, rating)
    // Optimistic update of average would go here
  }

  if (isLoading && ideas.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-gold)' }}
          />
          <p className="text-sm" style={{ color: 'var(--color-secondary)' }}>Loading ideas…</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Feed container — scroll snap */}
      <div
        ref={feedRef}
        className="feed-container"
        style={{ paddingTop: '0' }}
      >
        {ideas.map((idea, idx) => (
          <div key={idea.id} className="feed-item">
            <FeedCard
              idea={idea}
              onRate={handleRate}
              onSave={() => toggleSave(idea.id)}
              isSaved={savedIds.has(idea.id)}
              isSubmittingRating={submitting[idea.id] || false}
              currentUserId={profile?.id}
            />
          </div>
        ))}

        {/* Load more indicator */}
        {isLoading && (
          <div className="feed-item">
            <div className="text-center">
              <div
                className="w-6 h-6 border-2 rounded-full animate-spin mx-auto"
                style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-gold)' }}
              />
            </div>
          </div>
        )}

        {!hasMore && ideas.length > 0 && (
          <div className="feed-item">
            <div className="text-center px-8">
              <p className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                You've seen it all
              </p>
              <p className="text-sm" style={{ color: 'var(--color-secondary)' }}>
                Be the first to post a new idea
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Navigation Buttons */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50">
        <button
          className="feed-nav-btn"
          onClick={goPrev}
          disabled={currentIndex === 0}
          style={{ opacity: currentIndex === 0 ? 0.3 : 1 }}
          aria-label="Previous idea"
        >
          <ChevronUp />
        </button>
        <button
          className="feed-nav-btn"
          onClick={goNext}
          disabled={!hasMore && currentIndex >= ideas.length - 1}
          aria-label="Next idea"
        >
          <ChevronDown />
        </button>
      </div>

      {/* Post FAB */}
      {profile && (
        <button
          onClick={() => setShowPostModal(true)}
          className="fixed bottom-6 right-16 z-50 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-200 hover:scale-110"
          style={{ background: 'var(--color-gold)', color: 'var(--color-primary)' }}
          aria-label="Post idea"
        >
          +
        </button>
      )}

      {/* Index counter */}
      <div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-3 py-1 rounded-full text-xs font-mono"
        style={{
          background: 'rgba(42,40,37,0.85)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-secondary)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {currentIndex + 1} / {ideas.length}
      </div>

      {showPostModal && <IdeaPostModal onClose={() => setShowPostModal(false)} />}
    </>
  )
}

const ChevronUp = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3,10 8,5 13,10" />
  </svg>
)

const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3,6 8,11 13,6" />
  </svg>
)
