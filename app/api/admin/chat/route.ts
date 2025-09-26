import { NextResponse } from 'next/server';
// @ts-ignore optional dependency
import { GoogleGenAI } from '@google/genai';
import adminDefault, { adminDb } from '../../../../lib/firebase-admin';


const SYSTEM_PROMPT_BASE = `You are the admin assistant for this portfolio site. Answer concisely, politely, and give actionable admin steps. Only provide guidance relevant to site administration (profile, projects, blog, site settings, uploads, publishing, and navigation). If user asks about unrelated topics, politely say you can only help with site admin tasks.`;

// Always pass an options object to the constructor to satisfy the SDK's required parameter.
const genaiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
  const message = body?.message || '';
  const history = Array.isArray(body?.history) ? body.history : [];
  let chatId = typeof body?.chatId === 'string' && body.chatId ? body.chatId : null;

    if (!message) return NextResponse.json({ success: false, error: 'No message provided' }, { status: 400 });

    const hasKeyOrCreds = !!process.env.GEMINI_API_KEY || !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!hasKeyOrCreds) {
      return NextResponse.json({ success: false, error: 'AI credentials are not configured on the server. Please set GEMINI_API_KEY or GOOGLE_APPLICATION_CREDENTIALS.' }, { status: 500 });
    }

    // Fetch site/admin data from Firestore to enrich the system prompt.
    let siteSummary = '';
    try {
      const [profileDoc, siteSettingsDoc, projectsSnap, skillsSnap, experienceSnap] = await Promise.all([
        adminDb.collection('profile').doc('main').get().catch(() => null),
        adminDb.collection('siteSettings').doc('main').get().catch(() => null),
        adminDb.collection('projects').orderBy('order', 'asc').limit(10).get().catch(() => null),
        adminDb.collection('skills').orderBy('order', 'asc').limit(20).get().catch(() => null),
        adminDb.collection('experience').orderBy('order', 'asc').limit(10).get().catch(() => null),
      ]);

      if (profileDoc && profileDoc.exists) {
        const p = profileDoc.data();
        siteSummary += `Profile: name=${p?.name || ''}, title=${p?.title || ''}. `;
      }
      if (siteSettingsDoc && siteSettingsDoc.exists) {
        const s = siteSettingsDoc.data();
        siteSummary += `Site settings: public=${s?.public || false}, theme=${s?.theme || 'default'}. `;
      }
      if (projectsSnap && projectsSnap.docs) {
        const projectTitles = projectsSnap.docs.slice(0,5).map((d: any) => d.data()?.title).filter(Boolean);
        if (projectTitles.length) siteSummary += `Projects: ${projectTitles.join(', ')}. `;
      }

      // Skills summary
      if (skillsSnap && skillsSnap.docs) {
        const skillNames = skillsSnap.docs.slice(0,10).map((d: any) => d.data()?.name).filter(Boolean);
        if (skillNames.length) siteSummary += `Skills: ${skillNames.join(', ')}. `;
      }

      // Experience summary (roles/companies)
      if (experienceSnap && experienceSnap.docs) {
        const experiences = experienceSnap.docs.slice(0,5).map((d: any) => {
          const data = d.data() || {};
          const role = data?.title || data?.role || '';
          const org = data?.company || data?.organization || '';
          return [role, org].filter(Boolean).join(' at ');
        }).filter(Boolean);
        if (experiences.length) siteSummary += `Experience: ${experiences.join(' | ')}. `;
      }
    } catch (e) {
      // ignore Firestore read errors; continue without enriched context
    }

    let combined = SYSTEM_PROMPT_BASE + (siteSummary ? `\n\nContext from site: ${siteSummary}` : '') + '\n\n';
    for (const h of history) {
      if (!h || !h.role || !h.text) continue;
      const role = h.role === 'assistant' ? 'Assistant' : h.role === 'system' ? 'System' : 'User';
      combined += `${role}: ${h.text}\n`;
    }
    combined += `User: ${message}\nAssistant:`;

    let res: any = null;
    try {
      res = await (genaiClient as any).models?.generateContent?.({
        model: 'gemini-2.5',
        contents: [ { type: 'text', text: combined } ],
        temperature: 0.2,
        candidateCount: 1,
      });
    } catch (e) {
      // ignore
    }

    let reply: string | null = null;
    if (!res) {
      try {
        const alt: any = await (genaiClient as any).generate?.({ model: 'gemini-2.5', prompt: combined, temperature: 0.2 });
        reply = alt?.text || alt?.output?.[0]?.content || null;
      } catch (e) {
        // ignore
      }
    } else {
      reply = res?.text || res?.output?.[0]?.content || res?.candidates?.[0]?.content || res?.candidates?.[0]?.text || null;
      if (!reply && Array.isArray(res?.outputs)) {
        const first = res.outputs[0];
        if (first?.content) {
          if (typeof first.content === 'string') reply = first.content;
          else if (Array.isArray(first.content)) {
            for (const c of first.content) {
              if (c?.text) { reply = c.text; break; }
            }
          }
        }
      }
    }

  if (reply) {
      // Persist chat to Firestore. Create chat doc if missing and persist user+assistant messages.
      try {
        // create chat doc if missing
        if (!chatId) {
          const newRef = adminDb.collection('adminChats').doc();
          chatId = newRef.id;
          await newRef.set({ createdAt: new Date(), updatedAt: new Date(), title: 'New Chat' });
        }

        const chatRef = adminDb.collection('adminChats').doc(chatId);

        // Persist the incoming user message
        try {
          await chatRef.collection('messages').add({ role: 'user', text: message, createdAt: new Date() });
        } catch (e) {
          // ignore
        }

        // Persist assistant reply
        try {
          await chatRef.collection('messages').add({ role: 'assistant', text: reply, createdAt: new Date() });
        } catch (e) {
          // ignore
        }

        // update updatedAt on chat doc
        try { await chatRef.set({ updatedAt: new Date() }, { merge: true }); } catch (e) { /* ignore */ }
      } catch (e) {
        // ignore persistence errors
      }
      return NextResponse.json({ success: true, reply, chatId });
    }
    // No reply from the AI
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ success: false, error: 'No reply from AI', debug: res }, { status: 500 });
    }
    return NextResponse.json({ success: false, error: 'No reply from AI' }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unknown error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const chatId = typeof body?.chatId === 'string' && body.chatId ? body.chatId : null;
    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    if (!chatId) return NextResponse.json({ success: false, error: 'Missing chatId' }, { status: 400 });
    if (!title) return NextResponse.json({ success: false, error: 'Missing title' }, { status: 400 });

    const chatRef = adminDb.collection('adminChats').doc(chatId);
    await chatRef.set({ title, updatedAt: new Date() }, { merge: true });
    return NextResponse.json({ success: true, chatId, title });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
