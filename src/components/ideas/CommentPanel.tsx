'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { getAvatarUrl, formatTimeAgo } from '@/lib/utils'
import type { Comment } from '@/types'
import toast from 'react-hot-toast'

interface Props {
  ideaId: string
  currentUserId?: string
  onClose: () => void
}

export function CommentPanel({ ideaId, currentUserId, onClose }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchComments()
    // Trap focus
    inputRef.current?.focus()

    // Real-time comments subscription
    const channel = supabase
      .channel(`comments-${ideaId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `idea_id=eq.${ideaId}` },
        async (payload) => {
          // Fetch new comment with profile joined
          const { data } = await supabase
            .from('comments')
            .select('*, profiles(id, username, full_name, avatar_url)')
            .eq('id', payload.new.id)
            .single()
          if (data) setComments((prev) => [...prev, data as Comment])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [ideaId])

  const fetchComments = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(id, username, full_name, avatar_url)')
      .eq('idea_id', ideaId)
      .is('parent_id', null)
      .order('created_at', { ascending: true })

    setComments((data as Comment[]) || [])
    setIsLoading(false)
  }

  const handleSubmit = async () => {
    if (!currentUserId) { toast.error('Sign in to comment'); return }
    if (!newComment.trim()) return
    if (newComment.trim().length > 1000) { toast.error('Comment too long'); return }

    setIsSubmitting(true)
    const { error } = await supabase
      .from('comments')
      .insert({ user_id: currentUserId, idea_id: ideaId, content: newComment.trim() })

    if (error) toast.error(error.message)
    else setNewComment('')
    setIsSubmitting(false)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[24px] flex flex-col"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          maxHeight: '75vh',
          animation: 'slideUp 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        {/* Handle + header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="mx-auto w-10 h-1 rounded-full absolute top-3 left-1/2 -translate-x-1/2" style={{ background: 'var(--color-border)' }} />
          <h3 className="font-display font-bold pt-2" style={{ color: 'var(--color-text)' }}>
            Comments {comments.length > 0 && <span style={{ color: 'var(--color-secondary)' }}>({comments.length})</span>}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ color: 'var(--color-secondary)', background: 'var(--color-surface-raised)' }}
          >
            ✕
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3 w-24 rounded" />
                    <div className="skeleton h-4 w-full rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-3xl mb-2 opacity-20">💬</p>
              <p className="text-sm" style={{ color: 'var(--color-secondary)' }}>
                No comments yet. Start the conversation!
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentRow key={comment.id} comment={comment} />
            ))
          )}
        </div>

        {/* Input */}
        <div className="px-4 py-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          {currentUserId ? (
            <div className="flex gap-3 items-end">
              <textarea
                ref={inputRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
                }}
                placeholder="Add a comment…"
                rows={2}
                maxLength={1000}
                className="input-base flex-1 resize-none text-sm"
                style={{ minHeight: '56px' }}
              />
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !newComment.trim()}
                className="btn-primary h-10 px-4 text-sm"
              >
                {isSubmitting ? '…' : '→'}
              </button>
            </div>
          ) : (
            <p className="text-center text-sm py-2" style={{ color: 'var(--color-secondary)' }}>
              <a href="/auth" style={{ color: 'var(--color-gold)' }}>Sign in</a> to comment
            </p>
          )}
        </div>
      </div>
    </>
  )
}

function CommentRow({ comment }: { comment: Comment }) {
  if (!comment.profiles) return null
  return (
    <div className="flex gap-3">
      <div className="relative w-8 h-8 flex-shrink-0">
        <Image
          src={getAvatarUrl(comment.profiles)}
          alt={comment.profiles.username}
          fill
          className="rounded-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            {comment.profiles.username}
          </span>
          <span className="text-xs font-mono" style={{ color: 'var(--color-secondary)' }}>
            {formatTimeAgo(comment.created_at)}
          </span>
        </div>
        <p className="text-sm mt-0.5 leading-relaxed" style={{ color: 'var(--color-accent)' }}>
          {comment.content}
        </p>
      </div>
    </div>
  )
}
