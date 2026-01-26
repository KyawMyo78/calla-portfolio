import { NextResponse } from 'next/server'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

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

// Helper function to check admin authentication
function isAuthorized(req: Request) {
  const headerSecret = req.headers.get('x-admin-secret');
  const serverSecretExists = !!process.env.ADMIN_SECRET;
  const isMatch = headerSecret && process.env.ADMIN_SECRET && headerSecret === process.env.ADMIN_SECRET;
  console.debug('[admin/blog] debug: ADMIN_SECRET present on server?', serverSecretExists, 'x-admin-secret header present?', !!headerSecret, 'header matches?', !!isMatch);
  return isMatch;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const snapshot = await db
      .collection('blogPosts')
      .orderBy('createdAt', 'desc')
      .get();

    const posts = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        views: data.views || 0, // Ensure views is always a number
        publishedAt: data.publishedAt?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      };
    });

    return NextResponse.json({ success: true, data: posts });
  } catch (error: any) {
    console.error('Error fetching all blog posts:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      category,
      tags,
      status,
      author,
      readTime,
      featured
    } = body;

    // Validate required fields
    if (!title || !slug || !excerpt || !content || !category || !author) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingPost = await db
      .collection('blogPosts')
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (!existingPost.empty) {
      return NextResponse.json(
        { success: false, error: 'A post with this slug already exists' },
        { status: 400 }
      );
    }

    const now = new Date();
    const postData = {
      title,
      slug,
      excerpt,
      content,
      featuredImage: featuredImage || null,
      category,
      tags: tags || [],
      status: status || 'draft',
      publishedAt: status === 'published' ? now : null,
      author,
      readTime: readTime || 5,
      views: 0,
      featured: featured || false,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection('blogPosts').add(postData);

    return NextResponse.json({ 
      success: true, 
      data: { id: docRef.id, ...postData } 
    });
  } catch (error: any) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create blog post' },
      { status: 500 }
    );
  }
}
