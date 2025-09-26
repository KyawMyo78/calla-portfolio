import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const gemini = !!process.env.GEMINI_API_KEY;
    return NextResponse.json({ success: true, gemini });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
