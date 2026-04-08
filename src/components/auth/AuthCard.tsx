'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export function AuthCard() {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (error) {
      toast.error(error.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="relative z-10 w-full max-w-[382px]">
      {/* Logo */}
      <div className="text-center mb-10">
        <h1
          className="font-display text-[62px] font-black tracking-[-0.04em] leading-none"
          style={{ color: 'var(--color-text)' }}
        >
          Idiots
        </h1>
        <div
          className="mt-3 mx-auto px-6 py-2 border rounded-sm inline-block"
          style={{
            borderColor: 'var(--color-gold-dim)',
            background: 'rgba(201,168,76,0.05)',
          }}
        >
          <p
            className="text-xs tracking-[0.2em] uppercase font-mono"
            style={{ color: 'var(--color-gold)' }}
          >
            Explore. Validate. Experiment.
          </p>
        </div>
      </div>

      {/* Card */}
      <div
        className="rounded-card p-8"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <h2
          className="font-display text-xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          Join the community
        </h2>
        <p className="text-sm mb-8" style={{ color: 'var(--color-secondary)' }}>
          Share your ideas. Rate others. Let the community decide.
        </p>

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-[10px] font-medium text-sm transition-all duration-200"
          style={{
            background: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget
            el.style.borderColor = 'var(--color-accent)'
            el.style.background = '#3A3836'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget
            el.style.borderColor = 'var(--color-border)'
            el.style.background = 'var(--color-surface-raised)'
          }}
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-accent)' }} />
          ) : (
            <GoogleIcon />
          )}
          {isLoading ? 'Redirecting…' : 'Continue with Google'}
        </button>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--color-secondary)' }}>
          By continuing, you agree to our{' '}
          <span style={{ color: 'var(--color-accent)' }}>Terms</span>{' '}
          and{' '}
          <span style={{ color: 'var(--color-accent)' }}>Privacy Policy</span>
        </p>
      </div>

      {/* Decorative divider */}
      <div className="flex items-center gap-4 mt-8">
        <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
        <span className="text-xs font-mono" style={{ color: 'var(--color-secondary)' }}>
          community driven
        </span>
        <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
      </div>

      {/* Stats strip */}
      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        {[
          { label: 'Ideas', value: '∞' },
          { label: 'Voters', value: '↑' },
          { label: 'Updated', value: '/min' },
        ].map(({ label, value }) => (
          <div key={label}>
            <div className="font-display text-2xl font-bold" style={{ color: 'var(--color-gold)' }}>
              {value}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-secondary)' }}>
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  )
}
