import { NextRequest, NextResponse } from 'next/server';
import { getParticipantProgress, getActiveCampaign } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId') || req.headers.get('x-visitor-id');
    const campaignId = searchParams.get('campaignId') || (await getActiveCampaign()).id;

    if (!sessionId) {
      return NextResponse.json({ success: true, validatedProductIds: [], evaluations: [] });
    }

    const progress = await getParticipantProgress(sessionId, campaignId);
    return NextResponse.json({
      success: true,
      ...progress,
    });
  } catch (error) {
    console.error('Error getting participant progress:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
