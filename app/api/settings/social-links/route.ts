import { NextRequest, NextResponse } from 'next/server';
import { getSocialLinks, updateSocialLinks } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

function normalizeInviteUrl(value: unknown, service: 'whatsapp' | 'telegram'): string | null {
  if (typeof value !== 'string' || value.trim() === '') return '';
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:') return null;
    const host = url.hostname.toLowerCase();
    const validHost = service === 'whatsapp'
      ? host === 'chat.whatsapp.com' || host === 'www.whatsapp.com' || host === 'whatsapp.com'
      : host === 't.me' || host === 'telegram.me' || host === 'www.telegram.me';
    return validHost ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    return NextResponse.json({ success: true, socialLinks: await getSocialLinks() });
  } catch (error) {
    console.error('Error reading social links:', error);
    return NextResponse.json({ success: false, error: 'Impossible de charger les liens' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const body = await request.json();
    const whatsapp = normalizeInviteUrl(body.whatsapp, 'whatsapp');
    const telegram = normalizeInviteUrl(body.telegram, 'telegram');
    if (whatsapp === null || telegram === null) {
      return NextResponse.json({ success: false, error: 'Utilisez un lien HTTPS WhatsApp ou Telegram valide.' }, { status: 400 });
    }
    const socialLinks = await updateSocialLinks({ whatsapp, telegram });
    return NextResponse.json({ success: true, socialLinks });
  } catch (error) {
    console.error('Error saving social links:', error);
    return NextResponse.json({ success: false, error: 'Impossible d’enregistrer les liens' }, { status: 500 });
  }
}
