'use client';

import NavigationWithChat from '@/components/NavigationWithChat'
import Experience from '@/components/Experience'
import Footer from '@/components/Footer'
import { useScrollTracking } from '@/hooks/useAnalytics'

export default function ExperiencePage() {
  useScrollTracking();

  return (
    <main className="min-h-screen">
      <NavigationWithChat />
      <div className="pt-20">
        <Experience />
      </div>
      <Footer />
    </main>
  )
}
