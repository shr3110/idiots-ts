import { AuthCard } from '@/components/auth/AuthCard'

export default function AuthPage() {
  return (
    <main className="min-h-screen flex items-center justify-center relative noise-bg px-4">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-[30%] left-[50%] translate-x-[-50%] w-[500px] h-[500px] rounded-full opacity-[0.05] blur-[100px]"
          style={{ background: 'radial-gradient(circle, #C9A84C, transparent 70%)' }}
        />
      </div>

      <AuthCard />
    </main>
  )
}
