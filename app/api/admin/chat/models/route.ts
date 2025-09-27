import { NextResponse } from 'next/server';

// Minimal stub for model listing. The project uses a server-side sample in
// `app/admin/chat/page.tsx` to exercise the GEMINI_API_KEY. This route does not
// contact external services and only returns a small informative JSON object.

export async function GET() {
  return NextResponse.json({ success: true, message: 'Model listing disabled. Use server-side sample in app/admin/chat/page.tsx to test your GEMINI_API_KEY.' });
}
