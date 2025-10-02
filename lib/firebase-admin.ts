import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    let privateKey = '';

    // First, support a base64-encoded private key env var (safer for platforms)
    if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
      try {
        const decoded = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('utf8');
        privateKey = decoded.trim();
        console.log('Using FIREBASE_PRIVATE_KEY_BASE64 for Firebase Admin initialization.');
      } catch (e) {
        console.error('Failed to decode FIREBASE_PRIVATE_KEY_BASE64:', e instanceof Error ? e.message : e);
      }
    }

    // Fallback to FIREBASE_PRIVATE_KEY if base64 not provided or decoding failed
    if (!privateKey && process.env.FIREBASE_PRIVATE_KEY) {
      // Read raw env value
      let rawKey = process.env.FIREBASE_PRIVATE_KEY || '';

      // If key was pasted with surrounding quotes in Vercel UI, remove matching leading/trailing quotes
      if ((rawKey.startsWith('"') && rawKey.endsWith('"')) || (rawKey.startsWith("'") && rawKey.endsWith("'"))) {
        rawKey = rawKey.slice(1, -1);
      }

      // Normalize escaped newlines ("\\n") into real newlines
      privateKey = rawKey.replace(/\\n/g, '\n').trim();
      console.log('Using FIREBASE_PRIVATE_KEY for Firebase Admin initialization.');
    }

    if (!privateKey || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PROJECT_ID) {
      console.error('Firebase Admin initialization failed: missing FIREBASE_PRIVATE_KEY (or base64), FIREBASE_CLIENT_EMAIL, or FIREBASE_PROJECT_ID.');
      // allow initializeApp to throw the original error for logs
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });

  } catch (initErr: any) {
    // Log the error with extra context so Vercel logs show whether it's a key parsing/openssl issue
    console.error('Firebase Admin initialization error:', initErr && initErr.message ? initErr.message : initErr);
    throw initErr;
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();

export default admin;
