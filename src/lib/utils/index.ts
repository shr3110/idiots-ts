import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow } from 'date-fns'

// ─── Class Name Utility ───────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Time-Decay Ranking Formula ───────────────────────────────────────────────
// score = (avg_rating ^ 1.8) × sqrt(votes) / (gravity × age_hours ^ 1.8)
export function calculateScore(
  avgRating: number,
  voteCount: number,
  createdAt: string,
  gravity: number = 4
): number {
  if (voteCount === 0 || avgRating === 0) return 0

  const ageMs = Date.now() - new Date(createdAt).getTime()
  const ageHours = Math.max(ageMs / (1000 * 60 * 60), 0.1)

  const score =
    (Math.pow(avgRating, 1.8) * Math.sqrt(voteCount)) /
    (gravity * Math.pow(ageHours, 1.8))

  return Math.round(score * 10000) / 10000
}

// ─── Format Helpers ───────────────────────────────────────────────────────────
export function formatTimeAgo(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatScore(score: number): string {
  if (score >= 1000) return `${(score / 1000).toFixed(1)}k`
  return score.toFixed(2)
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '…'
}

// ─── Tag Utilities ────────────────────────────────────────────────────────────
export function parseTags(tagsInput: string): string[] {
  return tagsInput
    .split(',')
    .map(t => t.trim().toLowerCase().replace(/\s+/g, '-'))
    .filter(t => t.length > 0 && t.length <= 30)
    .slice(0, 5)
}

// ─── Validation ───────────────────────────────────────────────────────────────
export function validateUsername(username: string): string | null {
  if (username.length < 3) return 'Username must be at least 3 characters'
  if (username.length > 30) return 'Username must be 30 characters or less'
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Only letters, numbers, and underscores'
  return null
}

export function validateIdea(title: string, pitch: string): string | null {
  if (title.trim().length < 5) return 'Title must be at least 5 characters'
  if (title.trim().length > 100) return 'Title must be 100 characters or less'
  if (pitch.trim().length < 10) return 'Pitch must be at least 10 characters'
  if (pitch.trim().length > 280) return 'Pitch must be 280 characters or less'
  return null
}

// ─── Device Fingerprint ───────────────────────────────────────────────────────
export async function getDeviceFingerprint(): Promise<string | null> {
  try {
    const FingerprintJS = await import('@fingerprintjs/fingerprintjs')
    const fp = await FingerprintJS.load()
    const result = await fp.get()
    return result.visitorId
  } catch {
    return null
  }
}

// ─── Image Utilities ──────────────────────────────────────────────────────────
export function getAvatarUrl(profile: { avatar_url?: string | null; full_name?: string | null; username?: string }): string {
  if (profile.avatar_url) return profile.avatar_url
  const name = encodeURIComponent(profile.full_name || profile.username || 'U')
  return `https://ui-avatars.com/api/?name=${name}&background=3A3836&color=B0B0B0&bold=true&size=128`
}

// ─── Rank Badge Colors ────────────────────────────────────────────────────────
export function getRankStyle(rank: number): { bg: string; text: string; label: string } {
  const styles: Record<number, { bg: string; text: string; label: string }> = {
    1: { bg: 'bg-gold/20', text: 'text-gold', label: '🥇 #1' },
    2: { bg: 'bg-accent/20', text: 'text-accent', label: '🥈 #2' },
    3: { bg: 'bg-amber-800/20', text: 'text-amber-600', label: '🥉 #3' },
  }
  return styles[rank] || { bg: 'bg-surface', text: 'text-secondary', label: `#${rank}` }
}
