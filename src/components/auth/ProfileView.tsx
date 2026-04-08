'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/hooks/useAuthStore'
import { getAvatarUrl, formatTimeAgo } from '@/lib/utils'
import type { Profile, Idea } from '@/types'
import { IdeaPostModal } from '@/components/ideas/IdeaPostModal'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface Props {
  profile: Profile | null
  myIdeas: Idea[]
  savedIdeas: any[]
}

export function ProfileView({ profile, myIdeas, savedIdeas }: Props) {
  const [tab, setTab] = useState<'ideas' | 'saved'>('ideas')
  const [showPostModal, setShowPostModal] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/')
    router.refresh()
  }

  if (!profile) return null

  return (
    <div>
      {/* Profile Header */}
      <div className="flex items-start gap-5 mb-8">
        <div className="relative w-16 h-16 flex-shrink-0">
          <Image
            src={getAvatarUrl(profile)}
            alt={profile.username}
            fill
            className="rounded-full object-cover"
            style={{ border: '2px solid var(--color-border)' }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="font-display text-2xl font-bold truncate" style={{ color: 'var(--color-text)' }}>
            {profile.full_name || profile.username}
          </h1>
          <p className="font-mono text-sm" style={{ color: 'var(--color-secondary)' }}>
            @{profile.username}
          </p>
          {profile.bio && (
            <p className="text-sm mt-2" style={{ color: 'var(--color-accent)' }}>
              {profile.bio}
            </p>
          )}
        </div>

        <button onClick={handleSignOut} className="btn-ghost text-xs flex-shrink-0">
          Sign out
        </button>
      </div>

      {/* Stats Row */}
      <div
        className="grid grid-cols-3 gap-4 rounded-card p-4 mb-8"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        {[
          { label: 'Ideas', value: myIdeas.length },
          { label: 'Saved', value: savedIdeas.length },
          {
            label: 'Avg Rating',
            value:
              myIdeas.length > 0
                ? (myIdeas.reduce((acc, i) => acc + (i.avg_rating || 0), 0) / myIdeas.length).toFixed(1)
                : '—',
          },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <div className="font-display text-2xl font-bold" style={{ color: 'var(--color-gold)' }}>
              {value}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-secondary)' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Post Idea Button */}
      <button
        onClick={() => setShowPostModal(true)}
        className="btn-primary w-full justify-center mb-8"
      >
        <span>+</span> Post a New Idea
      </button>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-[12px]" style={{ background: 'var(--color-surface)' }}>
        {(['ideas', 'saved'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-[10px] text-sm font-medium capitalize transition-all duration-200"
            style={{
              background: tab === t ? 'var(--color-surface-raised)' : 'transparent',
              color: tab === t ? 'var(--color-text)' : 'var(--color-secondary)',
            }}
          >
            {t === 'ideas' ? `My Ideas (${myIdeas.length})` : `Saved (${savedIdeas.length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {tab === 'ideas' &&
          (myIdeas.length === 0 ? (
            <EmptyState message="No ideas yet. Post your first one!" />
          ) : (
            myIdeas.map((idea) => <ProfileIdeaRow key={idea.id} idea={idea} />)
          ))}

        {tab === 'saved' &&
          (savedIdeas.length === 0 ? (
            <EmptyState message="No saved ideas yet." />
          ) : (
            savedIdeas.map((s: any) => (
              s.ideas && <ProfileIdeaRow key={s.id} idea={s.ideas} />
            ))
          ))}
      </div>

      {showPostModal && <IdeaPostModal onClose={() => setShowPostModal(false)} />}
    </div>
  )
}

function ProfileIdeaRow({ idea }: { idea: Idea }) {
  return (
    <div
      className="rounded-card p-4 transition-all duration-200 hover:-translate-y-0.5"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold truncate" style={{ color: 'var(--color-text)' }}>
            {idea.title}
          </h3>
          <p className="text-sm mt-0.5 line-clamp-2" style={{ color: 'var(--color-secondary)' }}>
            {idea.pitch}
          </p>
          <p className="text-xs mt-2 font-mono" style={{ color: 'var(--color-secondary)' }}>
            {formatTimeAgo(idea.created_at)}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-sm font-bold" style={{ color: 'var(--color-gold)' }}>
            ★ {(idea.avg_rating || 0).toFixed(1)}
          </div>
          <div className="text-xs" style={{ color: 'var(--color-secondary)' }}>
            {idea.vote_count} votes
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16" style={{ color: 'var(--color-secondary)' }}>
      <div className="text-4xl mb-3 opacity-30">◎</div>
      <p className="text-sm">{message}</p>
    </div>
  )
}
