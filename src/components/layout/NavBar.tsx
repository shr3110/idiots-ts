'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/hooks/useAuthStore'
import { getAvatarUrl, cn } from '@/lib/utils'
import Image from 'next/image'

interface Props {
  overlay?: boolean
}

export function NavBar({ overlay = false }: Props) {
  const pathname = usePathname()
  const { profile } = useAuthStore()

  return (
    <nav
      className={cn(
        'w-full z-50 px-4 py-3',
        overlay ? 'fixed top-0 left-0 right-0' : 'sticky top-0'
      )}
      style={{
        background: overlay
          ? 'linear-gradient(to bottom, rgba(31,29,27,0.95) 0%, transparent 100%)'
          : 'rgba(31,29,27,0.95)',
        backdropFilter: overlay ? 'none' : 'blur(20px)',
        borderBottom: overlay ? 'none' : '1px solid var(--color-border)',
      }}
    >
      <div className="max-w-[1024px] mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-display font-black text-xl tracking-[-0.03em]" style={{ color: 'var(--color-text)' }}>
          Idiots
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          <NavLink href="/" label="Top 10" active={pathname === '/'} />
          <NavLink href="/feed" label="Feed" active={pathname === '/feed'} />
        </div>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {profile ? (
            <Link href="/profile" className="flex items-center gap-2 group">
              <div className="relative w-7 h-7">
                <Image
                  src={getAvatarUrl(profile)}
                  alt={profile.username}
                  fill
                  className="rounded-full object-cover"
                  style={{ border: '1px solid var(--color-border)' }}
                />
              </div>
              <span className="text-sm hidden sm:block" style={{ color: 'var(--color-accent)' }}>
                {profile.username}
              </span>
            </Link>
          ) : (
            <Link href="/auth" className="btn-ghost text-sm">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-[8px] text-sm font-medium transition-all duration-200"
      style={{
        background: active ? 'var(--color-surface)' : 'transparent',
        color: active ? 'var(--color-text)' : 'var(--color-secondary)',
      }}
    >
      {label}
    </Link>
  )
}
