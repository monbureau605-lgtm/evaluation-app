import { NextRequest, NextResponse } from 'next/server';
import { resetToSeedData } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    await resetToSeedData();
    return NextResponse.json({ success: true, message: 'Données réinitialisées avec succès' });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json({ success: false, error: 'Erreur réinitialisation' }, { status: 500 });
  }
}
