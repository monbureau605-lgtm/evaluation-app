import { NextRequest, NextResponse } from 'next/server';
import { getEvaluations, getProducts, getActiveCampaign } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId') || undefined;
    const active = await getActiveCampaign();
    const products = await getProducts(campaignId);
    const productMap = new Map(products.map((p) => [p.id, p.name]));

    const evaluations = await getEvaluations(campaignId);

    // CSV headers
    const rows = [
      ['ID Evaluation', 'Campagne', 'ID Produit', 'Nom Produit', 'Note (sur 5)', 'Prix estime (MAD)', 'ID Participant', 'Date'].join(';')
    ];

    for (const e of evaluations) {
      const prodName = productMap.get(e.productId) || 'Produit inconnu';
      rows.push([
        e.id,
        e.campaignId,
        e.productId,
        `"${prodName.replace(/"/g, '""')}"`,
        e.rating,
        e.estimatedPrice,
        e.participantSessionId,
        e.createdAt,
      ].join(';'));
    }

    const csvContent = '\uFEFF' + rows.join('\r\n'); // Include UTF-8 BOM for Excel compatibility

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="evaluations_${active.id}_${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error generating CSV export:', error);
    return NextResponse.json({ success: false, error: 'Erreur export CSV' }, { status: 500 });
  }
}
