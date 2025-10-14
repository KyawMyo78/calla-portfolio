'use client';

import NavigationWithChat from '@/components/NavigationWithChat'
import Projects from '@/components/Projects'
import Footer from '@/components/Footer'
import ClientSectionCTA from '@/components/ClientSectionCTA'
import { useScrollTracking } from '@/hooks/useAnalytics'

export default function ProjectsPage() {
  useScrollTracking();

  return (
    <main className="min-h-screen">
      <NavigationWithChat />
      <div className="pt-20">
        <Projects />
        <ClientSectionCTA currentSection="projects" />
      </div>
      <Footer />
    </main>
  )
}
