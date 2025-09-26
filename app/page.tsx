// Force dynamic rendering so pages are fresh on each request
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import IconScroller from '../components/IconScroller'
import Footer from '@/components/Footer'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getCached, setCached } from '@/lib/server-cache'

// Initialize Firebase Admin SDK for server-side fetches
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

export default async function HomePage() {
  const [profile, siteSettings] = await Promise.all([
    getProfileServer(),
    getSiteSettingsServer(),
  ]);

  return (
    <main className="min-h-screen">
      <Navigation siteSettings={siteSettings} />
      <Hero profile={profile} siteSettings={siteSettings} />
  <IconScroller profile={profile} siteSettings={siteSettings} />
      <Footer profile={profile} siteSettings={siteSettings} />
    </main>
  )
}
