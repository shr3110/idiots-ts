// ─── Database Types ───────────────────────────────────────────────────────────

export interface Profile {
  id: string
  email: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  device_fingerprint: string | null
  created_at: string
  updated_at: string
}

export interface Idea {
  id: string
  user_id: string
  title: string
  pitch: string
  description: string | null
  tags: string[]
  media_urls: string[]
  avg_rating: number
  vote_count: number
  score: number
  rank: number | null
  is_moderated: boolean
  moderation_status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  // Joined fields
  profiles?: Profile
  user_rating?: number | null
  is_saved?: boolean
  comment_count?: number
}

export interface Rating {
  id: string
  user_id: string
  idea_id: string
  rating: number
  device_fingerprint: string | null
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  user_id: string
  idea_id: string
  content: string
  parent_id: string | null
  created_at: string
  updated_at: string
  // Joined
  profiles?: Profile
  replies?: Comment[]
}

export interface SavedIdea {
  id: string
  user_id: string
  idea_id: string
  created_at: string
  ideas?: Idea
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  hasMore: boolean
}

// ─── Store Types ──────────────────────────────────────────────────────────────

export interface AuthState {
  user: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface FeedState {
  ideas: Idea[]
  currentIndex: number
  isLoading: boolean
  hasMore: boolean
}

// ─── Component Props ──────────────────────────────────────────────────────────

export interface IdeaCardProps {
  idea: Idea
  onRate?: (ideaId: string, rating: number) => void
  onSave?: (ideaId: string) => void
  onComment?: (ideaId: string) => void
  showRank?: boolean
  compact?: boolean
}

export interface StarRatingProps {
  value: number
  onChange?: (rating: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

// ─── Realtime Types ───────────────────────────────────────────────────────────

export interface RealtimePayload<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: T
  old: T
  schema: string
  table: string
}

export interface TopIdeasUpdate {
  ideas: Idea[]
  updatedAt: string
}

// ─── Form Types ───────────────────────────────────────────────────────────────

export interface IdeaFormData {
  title: string
  pitch: string
  description: string
  tags: string
  media?: FileList
}

export interface ProfileFormData {
  username: string
  full_name: string
  bio: string
}
