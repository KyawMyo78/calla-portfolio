'use client';

import NavigationWithChat from '@/components/NavigationWithChat'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import { useScrollTracking } from '@/hooks/useAnalytics'

export default function ContactPage() {
  useScrollTracking();

  return (
    <main className="min-h-screen">
      <NavigationWithChat />
      <div className="pt-20">
        <Contact />
      </div>
      <Footer />
    </main>
  )
}
