import { NextRequest, NextResponse } from 'next/server';
import { translateTextToArabic } from '@/lib/server-translator';
import { requireAdmin } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ success: true, translation: '' });
    }

    const translated = await translateTextToArabic(text);
    return NextResponse.json({ success: true, translation: translated });
  } catch (err) {
    console.error('Translation error:', err);
    return NextResponse.json({ success: false, error: 'Erreur de traduction' }, { status: 500 });
  }
}
