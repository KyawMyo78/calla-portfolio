'use client';

import NavigationWithChat from '@/components/NavigationWithChat'
import Projects from '@/components/Projects'
import Footer from '@/components/Footer'
import { useScrollTracking } from '@/hooks/useAnalytics'

export default function ProjectsPage() {
  useScrollTracking();

  return (
    <main className="min-h-screen">
      <NavigationWithChat />
      <div className="pt-20">
        <Projects />
      </div>
      <Footer />
    </main>
  )
}
