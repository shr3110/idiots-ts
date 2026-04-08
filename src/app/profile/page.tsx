import { createClient } from '@/lib/supabase/server'
import { ProfileView } from '@/components/auth/ProfileView'
import { NavBar } from '@/components/layout/NavBar'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: myIdeas } = await supabase
    .from('ideas')
    .select('*, ratings(rating)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: savedIdeas } = await supabase
    .from('saved_ideas')
    .select('*, ideas(*, profiles(username, full_name, avatar_url))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen noise-bg">
      <NavBar />
      <div className="max-w-[768px] mx-auto px-4 pb-24 pt-20">
        <ProfileView
          profile={profile}
          myIdeas={myIdeas || []}
          savedIdeas={savedIdeas || []}
        />
      </div>
    </main>
  )
}
