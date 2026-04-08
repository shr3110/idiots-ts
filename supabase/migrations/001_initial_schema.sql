-- ============================================================
-- IDIOTS PLATFORM — Supabase Migration
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─── PROFILES ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL UNIQUE,
  username        TEXT NOT NULL UNIQUE,
  full_name       TEXT,
  avatar_url      TEXT,
  bio             TEXT,
  device_fingerprint TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles (username);

-- ─── IDEAS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ideas (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title               TEXT NOT NULL CHECK (char_length(title) BETWEEN 5 AND 100),
  pitch               TEXT NOT NULL CHECK (char_length(pitch) BETWEEN 10 AND 280),
  description         TEXT,
  tags                TEXT[] NOT NULL DEFAULT '{}',
  media_urls          TEXT[] NOT NULL DEFAULT '{}',
  avg_rating          NUMERIC(3,2) NOT NULL DEFAULT 0,
  vote_count          INTEGER NOT NULL DEFAULT 0,
  score               NUMERIC(12,6) NOT NULL DEFAULT 0,
  rank                INTEGER,
  moderation_status   TEXT NOT NULL DEFAULT 'approved'
                        CHECK (moderation_status IN ('pending','approved','rejected')),
  is_moderated        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for ranking queries
CREATE INDEX IF NOT EXISTS ideas_score_idx         ON public.ideas (score DESC);
CREATE INDEX IF NOT EXISTS ideas_user_id_idx       ON public.ideas (user_id);
CREATE INDEX IF NOT EXISTS ideas_moderation_idx    ON public.ideas (moderation_status);
CREATE INDEX IF NOT EXISTS ideas_created_at_idx    ON public.ideas (created_at DESC);
CREATE INDEX IF NOT EXISTS ideas_tags_gin_idx      ON public.ideas USING GIN (tags);

-- ─── RATINGS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ratings (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  idea_id             UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  rating              SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  device_fingerprint  TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, idea_id)   -- One vote per user per idea
);

CREATE INDEX IF NOT EXISTS ratings_idea_id_idx ON public.ratings (idea_id);
CREATE INDEX IF NOT EXISTS ratings_user_id_idx ON public.ratings (user_id);

-- ─── COMMENTS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  idea_id     UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  content     TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  parent_id   UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS comments_idea_id_idx   ON public.comments (idea_id);
CREATE INDEX IF NOT EXISTS comments_parent_id_idx ON public.comments (parent_id);

-- ─── SAVED IDEAS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.saved_ideas (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  idea_id     UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, idea_id)
);

CREATE INDEX IF NOT EXISTS saved_ideas_user_id_idx ON public.saved_ideas (user_id);

-- ============================================================
-- TIME-DECAY SCORE FUNCTION
-- score = (avg_rating ^ 1.8) × sqrt(votes) / (gravity × age_hours ^ 1.8)
-- ============================================================
CREATE OR REPLACE FUNCTION public.recalculate_idea_score(p_idea_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_avg_rating  NUMERIC;
  v_vote_count  INTEGER;
  v_created_at  TIMESTAMPTZ;
  v_age_hours   NUMERIC;
  v_score       NUMERIC;
  v_gravity     NUMERIC := 4.0;
BEGIN
  -- Aggregate ratings
  SELECT
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO v_avg_rating, v_vote_count
  FROM public.ratings
  WHERE idea_id = p_idea_id;

  -- Get idea creation time
  SELECT created_at INTO v_created_at
  FROM public.ideas
  WHERE id = p_idea_id;

  -- Calculate age in hours (minimum 0.1 to avoid division by zero)
  v_age_hours := GREATEST(
    EXTRACT(EPOCH FROM (NOW() - v_created_at)) / 3600,
    0.1
  );

  -- Apply formula
  IF v_vote_count = 0 OR v_avg_rating = 0 THEN
    v_score := 0;
  ELSE
    v_score := (
      POWER(v_avg_rating, 1.8) * SQRT(v_vote_count::NUMERIC)
    ) / (
      v_gravity * POWER(v_age_hours, 1.8)
    );
  END IF;

  -- Update idea
  UPDATE public.ideas
  SET
    avg_rating  = v_avg_rating,
    vote_count  = v_vote_count,
    score       = v_score,
    updated_at  = NOW()
  WHERE id = p_idea_id;

  -- Recompute rank for all approved ideas
  WITH ranked AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY score DESC) AS new_rank
    FROM public.ideas
    WHERE moderation_status = 'approved'
  )
  UPDATE public.ideas i
  SET rank = r.new_rank
  FROM ranked r
  WHERE i.id = r.id;

  RETURN v_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- TRIGGER: Auto recalculate score on rating INSERT/UPDATE
-- ============================================================
CREATE OR REPLACE FUNCTION public.trigger_recalculate_score()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.recalculate_idea_score(
    CASE WHEN TG_OP = 'DELETE' THEN OLD.idea_id ELSE NEW.idea_id END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS ratings_score_trigger ON public.ratings;
CREATE TRIGGER ratings_score_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.ratings
FOR EACH ROW EXECUTE FUNCTION public.trigger_recalculate_score();

-- ============================================================
-- TRIGGER: Auto update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at  BEFORE UPDATE ON public.profiles  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER ideas_updated_at     BEFORE UPDATE ON public.ideas      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER ratings_updated_at   BEFORE UPDATE ON public.ratings    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER comments_updated_at  BEFORE UPDATE ON public.comments   FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_ideas  ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Profiles are publicly readable"
  ON public.profiles FOR SELECT USING (TRUE);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- IDEAS
CREATE POLICY "Approved ideas are publicly readable"
  ON public.ideas FOR SELECT USING (moderation_status = 'approved');

CREATE POLICY "Authenticated users can post ideas"
  ON public.ideas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ideas"
  ON public.ideas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ideas"
  ON public.ideas FOR DELETE
  USING (auth.uid() = user_id);

-- RATINGS
CREATE POLICY "Ratings are publicly readable"
  ON public.ratings FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can rate"
  ON public.ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON public.ratings FOR UPDATE
  USING (auth.uid() = user_id);

-- COMMENTS
CREATE POLICY "Comments are publicly readable"
  ON public.comments FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can comment"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- SAVED IDEAS
CREATE POLICY "Users can view their own saved ideas"
  ON public.saved_ideas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save ideas"
  ON public.saved_ideas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave ideas"
  ON public.saved_ideas FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- REALTIME: Enable on key tables
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.ideas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ratings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;

-- ============================================================
-- STORAGE BUCKET for avatars and idea media
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('idea-media', 'idea-media', TRUE)
ON CONFLICT DO NOTHING;

CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Idea media is publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'idea-media');

CREATE POLICY "Authenticated users can upload idea media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'idea-media' AND auth.role() = 'authenticated');
