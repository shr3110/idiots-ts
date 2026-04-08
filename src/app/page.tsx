import { Suspense } from 'react'
import { TopIdeasDashboard } from '@/components/dashboard/TopIdeasDashboard'
import { HomeHero } from '@/components/layout/HomeHero'
import { NavBar } from '@/components/layout/NavBar'
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton'

export default function HomePage() {
  return (
    <main className="min-h-screen relative overflow-x-hidden noise-bg">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-[-20%] left-[50%] translate-x-[-50%] w-[600px] h-[600px] rounded-full opacity-[0.04] blur-[120px]"
          style={{ background: 'radial-gradient(circle, #C9A84C, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-[0.03] blur-[100px]"
          style={{ background: 'radial-gradient(circle, #B0B0B0, transparent 70%)' }}
        />
      </div>

      <NavBar />

      <div className="relative z-10 max-w-[1024px] mx-auto px-4 pb-24">
        {/* Hero */}
        <HomeHero />

        {/* Top 10 Dashboard */}
        <section className="mt-8">
          <Suspense fallback={<DashboardSkeleton />}>
            <TopIdeasDashboard />
          </Suspense>
        </section>
      </div>
    </main>
  )
}
