'use client'

import { useEffect, useRef } from 'react'

export function HomeHero() {
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = titleRef.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(30px)'
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.8s ease, transform 0.8s ease'
      el.style.opacity = '1'
      el.style.transform = 'translateY(0)'
    })
  }, [])

  return (
    <div className="text-center pt-16 pb-12 relative">
      {/* Decorative golden rectangle outline */}
      <div
        className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] pointer-events-none golden-spiral"
        style={{
          width: 'min(618px, 90vw)',
          aspectRatio: '1.618',
          border: '1px solid rgba(201,168,76,0.08)',
          borderRadius: '24px',
        }}
        aria-hidden="true"
      />

      <h1
        ref={titleRef}
        className="font-display font-black tracking-[-0.04em] leading-none"
        style={{
          fontSize: 'clamp(56px, 10vw, 96px)',
          color: 'var(--color-text)',
        }}
      >
        Idiots
      </h1>

      {/* Golden rectangle tagline */}
      <div
        className="mt-4 mx-auto inline-flex items-center px-8 py-3"
        style={{
          border: '1px solid rgba(201,168,76,0.3)',
          borderRadius: '4px',
          background: 'rgba(201,168,76,0.04)',
          aspectRatio: 'auto',
        }}
      >
        <p
          className="text-xs tracking-[0.3em] uppercase font-mono"
          style={{ color: 'var(--color-gold)' }}
        >
          Explore&nbsp;&nbsp;·&nbsp;&nbsp;Validate&nbsp;&nbsp;·&nbsp;&nbsp;Experiment
        </p>
      </div>

      <p
        className="mt-6 text-base max-w-[382px] mx-auto"
        style={{ color: 'var(--color-secondary)', lineHeight: 1.7 }}
      >
        The most audacious ideas, ranked purely by the community.
        No algorithms. No ads. Just votes.
      </p>

      {/* Golden spiral indicator */}
      <div className="mt-8 flex items-center justify-center gap-6">
        <div className="h-px flex-1 max-w-[80px]" style={{ background: 'var(--color-border)' }} />
        <div className="flex items-center gap-2">
          <span className="realtime-dot" />
          <span className="text-xs font-mono" style={{ color: 'var(--color-gold)' }}>
            Live Rankings
          </span>
        </div>
        <div className="h-px flex-1 max-w-[80px]" style={{ background: 'var(--color-border)' }} />
      </div>
    </div>
  )
}
