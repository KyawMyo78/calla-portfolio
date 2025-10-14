'use client';

import NavigationWithChat from '@/components/NavigationWithChat'
import Skills from '@/components/Skills'
import Footer from '@/components/Footer'
import ClientSectionCTA from '@/components/ClientSectionCTA'
import { useScrollTracking } from '@/hooks/useAnalytics'

export default function SkillsPage() {
  useScrollTracking();

  return (
    <main className="min-h-screen">
      <NavigationWithChat />
      <div className="pt-20">
        <Skills />
        <ClientSectionCTA currentSection="skills" />
      </div>
      <Footer />
    </main>
  )
}
