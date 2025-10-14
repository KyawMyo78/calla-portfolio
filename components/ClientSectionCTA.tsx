'use client';

import { useState, useEffect } from 'react';
import SectionCTA from './SectionCTA';

interface ClientSectionCTAProps {
  currentSection: 'home' | 'about' | 'skills' | 'experience' | 'projects' | 'blog' | 'contact';
  className?: string;
}

export default function ClientSectionCTA({ currentSection, className }: ClientSectionCTAProps) {
  const [siteSettings, setSiteSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/site-settings?t=${timestamp}`);
        const result = await response.json();
        if (result.success) {
          setSiteSettings(result.data);
        }
      } catch (error) {
        console.error('Error fetching site settings:', error);
      }
    };

    fetchSettings();
  }, []);

  return <SectionCTA currentSection={currentSection} siteSettings={siteSettings} className={className} />;
}
