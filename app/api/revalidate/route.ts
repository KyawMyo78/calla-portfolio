import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const secret = body?.secret || (req.headers.get('x-revalidate-secret'));

    if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ success: false, message: 'Invalid secret' }, { status: 401 });
    }

    const paths = body.paths || ['/','/about'];
    for (const p of paths) {
      try { revalidatePath(p); } catch (e) { console.error('revalidatePath error', e); }
    }

    return NextResponse.json({ success: true, revalidated: paths });
  } catch (e) {
    console.error('Revalidate route error', e);
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
