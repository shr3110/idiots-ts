import { IdeaFeed } from '@/components/ideas/IdeaFeed'
import { NavBar } from '@/components/layout/NavBar'

export default function FeedPage() {
  return (
    <div className="h-screen overflow-hidden bg-primary">
      <NavBar overlay />
      <IdeaFeed />
    </div>
  )
}
