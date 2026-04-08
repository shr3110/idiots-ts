'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { validateIdea, parseTags } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Props {
  onClose: () => void
}

export function IdeaPostModal({ onClose }: Props) {
  const [title, setTitle] = useState('')
  const [pitch, setPitch] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const modalRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async () => {
    const validationError = validateIdea(title, pitch)
    if (validationError) { toast.error(validationError); return }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, pitch, description, tags }),
      })

      const result = await res.json()

      if (!res.ok) throw new Error(result.error || 'Failed to post idea')

      toast.success('Idea posted! 🎉')
      router.refresh()
      onClose()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const pitchRemaining = 280 - pitch.length
  const titleRemaining = 100 - title.length

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 rounded-card overflow-hidden"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-hover)',
          maxWidth: '520px',
          margin: '0 auto',
          animation: 'slideUp 0.3s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <h2 className="font-display font-bold text-lg" style={{ color: 'var(--color-text)' }}>
            Post an Idea
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-sm"
            style={{ background: 'var(--color-surface-raised)', color: 'var(--color-secondary)' }}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto" style={{ maxHeight: '60vh' }}>
          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--color-secondary)' }}>
                Title *
              </label>
              <span className="text-xs font-mono" style={{ color: titleRemaining < 20 ? '#ef4444' : 'var(--color-secondary)' }}>
                {titleRemaining}
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Your big idea in a headline…"
              maxLength={100}
              className="input-base"
              autoFocus
            />
          </div>

          {/* Pitch */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--color-secondary)' }}>
                One-line Pitch *
              </label>
              <span className="text-xs font-mono" style={{ color: pitchRemaining < 30 ? '#ef4444' : 'var(--color-secondary)' }}>
                {pitchRemaining}
              </span>
            </div>
            <textarea
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              placeholder="The problem it solves in one sentence…"
              maxLength={280}
              rows={2}
              className="input-base resize-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--color-secondary)' }}>
              Details <span style={{ color: 'var(--color-secondary)', opacity: 0.5 }}>(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain your idea in more detail…"
              maxLength={2000}
              rows={3}
              className="input-base resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--color-secondary)' }}>
              Tags <span style={{ opacity: 0.5 }}>(comma separated, max 5)</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tech, health, climate, startup…"
              className="input-base"
            />
            {/* Preview tags */}
            {tags && (
              <div className="flex flex-wrap gap-2 mt-2">
                {parseTags(tags).map((t) => (
                  <span key={t} className="tag-pill">{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <p className="text-xs" style={{ color: 'var(--color-secondary)' }}>
            Ideas go live after moderation
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-ghost text-sm">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !title.trim() || !pitch.trim()}
              className="btn-primary text-sm"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 border rounded-full animate-spin" style={{ borderColor: 'rgba(31,29,27,0.3)', borderTopColor: 'var(--color-primary)' }} />
                  Posting…
                </span>
              ) : (
                'Post Idea →'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
