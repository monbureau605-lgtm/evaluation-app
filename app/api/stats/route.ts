import { NextRequest, NextResponse } from 'next/server';
import { calculateGlobalStats, calculateProductStats, getEvaluations, getActiveCampaign } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId') || undefined;

    const globalStats = await calculateGlobalStats(campaignId);
    const productStats = await calculateProductStats(campaignId);
    const recentEvaluations = (await getEvaluations(campaignId)).slice(-20).reverse();
    const activeCampaign = await getActiveCampaign();

    return NextResponse.json({
      success: true,
      globalStats,
      productStats,
      recentEvaluations,
      activeCampaign,
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors du calcul des statistiques' }, { status: 500 });
  }
}
