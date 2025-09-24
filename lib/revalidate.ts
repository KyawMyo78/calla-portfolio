export async function callRevalidate(paths: string[] = ['/','/about']) {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || '';
    const url = `${base}/api/revalidate`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: process.env.REVALIDATE_SECRET, paths })
    });
  } catch (e) {
    console.warn('callRevalidate failed', e);
  }
}
