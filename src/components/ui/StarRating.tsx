'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { StarRatingProps } from '@/types'

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
}

export function StarRating({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) {
  const [hovered, setHovered] = useState(0)

  const display = hovered || value

  return (
    <div
      className="flex items-center gap-1"
      role={readonly ? undefined : 'radiogroup'}
      aria-label="Rating"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          aria-label={`${star} star`}
          className={cn(
            'star-btn transition-all duration-100',
            sizes[size],
            readonly && 'cursor-default'
          )}
          style={{
            color: star <= display ? 'var(--color-gold)' : 'var(--color-border)',
          }}
        >
          <StarIcon filled={star <= display} />
        </button>
      ))}
      {!readonly && value > 0 && (
        <span className="text-xs ml-1 font-mono" style={{ color: 'var(--color-secondary)' }}>
          {value}/5
        </span>
      )}
    </div>
  )
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
      <path
        fillRule="evenodd"
        d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
        clipRule="evenodd"
      />
    </svg>
  )
}
