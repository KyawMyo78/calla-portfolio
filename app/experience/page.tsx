'use client';

import NavigationWithChat from '@/components/NavigationWithChat'
import Experience from '@/components/Experience'
import Footer from '@/components/Footer'
import ClientSectionCTA from '@/components/ClientSectionCTA'
import { useScrollTracking } from '@/hooks/useAnalytics'

export default function ExperiencePage() {
  useScrollTracking();

  return (
    <main className="min-h-screen">
      <NavigationWithChat />
      <div className="pt-20">
        <Experience />
        <ClientSectionCTA currentSection="experience" />
      </div>
      <Footer />
    </main>
  )
}
