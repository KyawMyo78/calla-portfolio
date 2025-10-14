// Force dynamic rendering so pages are fresh on each request
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import NavigationWithChat from '@/components/NavigationWithChat'
import About from '@/components/About'
import Footer from '@/components/Footer'
import SectionCTA from '@/components/SectionCTA'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getCached, setCached } from '@/lib/server-cache'

// Initialize Firebase Admin SDK for server-side fetches (reuse pattern from other pages)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

async function getProfileServer() {
  try {
    const cacheKey = 'profile:main';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const doc = await db.collection('profile').doc('main').get();
    if (doc.exists) {
      const data = doc.data();
      // cache profile for 10 seconds to reduce repeated reads during navigation
      setCached(cacheKey, data, 10 * 1000);
      return data;
    }
  } catch (e) {
    console.error('Server getProfile error', e);
  }
  return null;
}

async function getSiteSettingsServer() {
  try {
    const cacheKey = 'siteSettings:main';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const doc = await db.collection('siteSettings').doc('main').get();
    if (doc.exists) {
      const data = doc.data();
      setCached(cacheKey, data, 30 * 1000);
      return data;
    }
  } catch (e) {
    console.error('Server getSiteSettings error', e);
  }
  return null;
}

export default async function AboutPage() {
  let [profile, siteSettings] = await Promise.all([getProfileServer(), getSiteSettingsServer()]);

  // Fallback: if server SDK fetch failed (null), call the internal API route
  if (!profile) {
    try {
      const res = await fetch('/api/profile', { cache: 'no-store' });
      const json = await res.json();
      if (json && json.success) {
        profile = json.data;
      }
    } catch (e) {
      console.error('Fallback fetch to /api/profile failed', e);
    }
  }

  return (
    <main className="min-h-screen">
      <NavigationWithChat siteSettings={siteSettings} />
      <div className="pt-20">
        <About profile={profile} />
        <SectionCTA currentSection="about" siteSettings={siteSettings} />
      </div>
      <Footer profile={profile} siteSettings={siteSettings} />
    </main>
  )
}
