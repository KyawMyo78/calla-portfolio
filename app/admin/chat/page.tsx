
import ChatUI from "../../../components/ChatUI";
import { adminDb } from "../../../lib/firebase-admin";

async function getServerUserSummary() {
  try {
    const [personalSnap, skillsSnap, projectsSnap, blogsSnap, expSnap] = await Promise.all([
      adminDb.collection('personalInfo').doc('main').get().catch(() => null),
      adminDb.collection('skills').orderBy('order', 'asc').limit(8).get().catch(() => null),
      adminDb.collection('projects').orderBy('order', 'asc').limit(4).get().catch(() => null),
      adminDb.collection('blogPosts').orderBy('publishedAt', 'desc').limit(5).get().catch(() => null),
      adminDb.collection('experience').orderBy('order', 'asc').limit(3).get().catch(() => null),
    ]);

    const parts: string[] = [];
    if (personalSnap && personalSnap.exists) {
      const p = personalSnap.data();
      if (p?.fullName || p?.name) parts.push(`Name: ${p.fullName || p.name}`);
      if (p?.title) parts.push(`Title: ${p.title}`);
    }
  if (skillsSnap && skillsSnap.docs.length) parts.push(`Top skills: ${skillsSnap.docs.map((d: any) => d.data()?.name).filter(Boolean).slice(0,8).join(', ')}`);
  if (projectsSnap && projectsSnap.docs.length) parts.push(`Recent projects: ${projectsSnap.docs.map((d: any) => d.data()?.title).filter(Boolean).slice(0,4).join(' | ')}`);
  if (blogsSnap && blogsSnap.docs.length) parts.push(`Recent blogs: ${blogsSnap.docs.map((d: any) => d.data()?.title).filter(Boolean).slice(0,5).join(' | ')}`);
  if (expSnap && expSnap.docs.length) parts.push(`Recent experience: ${expSnap.docs.map((d: any) => `${d.data()?.title} @ ${d.data()?.company}`).filter(Boolean).slice(0,3).join(' | ')}`);

    if (!parts.length) {
      // No Firestore data found — return empty summary
      return '';
    }

    const summary = parts.join('; ');
    return summary.length > 900 ? summary.slice(0,900) + '...' : summary;
  } catch (e) {
    return '';
  }
}

export default async function AdminChatPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const promptParam = Array.isArray(searchParams?.prompt) ? searchParams?.prompt[0] : (searchParams?.prompt as string | undefined);
  // Mascot image path
  const mascotPath = "/apclover.jpg";

  const userSummary = await getServerUserSummary();

  return (
    <div className="p-6">
      <ChatUI initialPrompt={promptParam || ""} mascot={mascotPath} initialUserSummary={userSummary} />
    </div>
  );
}

