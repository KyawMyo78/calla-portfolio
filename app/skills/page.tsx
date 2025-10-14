'use client';

import { useState, useEffect } from 'react'
import NavigationWithChat from '@/components/NavigationWithChat'
import Skills from '@/components/Skills'
import Footer from '@/components/Footer'
import ClientSectionCTA from '@/components/ClientSectionCTA'
import { useScrollTracking } from '@/hooks/useAnalytics'
import { getCachedData, CACHE_KEYS } from '@/hooks/useDataPrefetch'

export default function SkillsPage() {
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useScrollTracking();

  useEffect(() => {
    // Try to get from cache first
    const cachedSettings = getCachedData(CACHE_KEYS.SITE_SETTINGS);
    const cachedProfile = getCachedData(CACHE_KEYS.PROFILE);
    
    if (cachedSettings) setSiteSettings(cachedSettings);
    if (cachedProfile) setProfile(cachedProfile);

    // Fetch if not cached
    if (!cachedSettings) {
      fetch('/api/site-settings')
        .then(res => res.json())
        .then(result => {
          if (result.success) setSiteSettings(result.data);
        })
        .catch(err => console.error('Error fetching site settings:', err));
    }

    if (!cachedProfile) {
      fetch('/api/profile')
        .then(res => res.json())
        .then(result => {
          if (result.success) setProfile(result.data);
        })
        .catch(err => console.error('Error fetching profile:', err));
    }
  }, []);

  return (
    <main className="min-h-screen">
      <NavigationWithChat siteSettings={siteSettings} />
      <div className="pt-20">
        <Skills />
        <ClientSectionCTA currentSection="skills" />
      </div>
      <Footer profile={profile} siteSettings={siteSettings} />
    </main>
  )
}
