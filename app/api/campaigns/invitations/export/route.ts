import { NextRequest, NextResponse } from 'next/server';
import { getInvitations, getCampaigns } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId') || undefined;

    const invitations = await getInvitations(campaignId);
    const campaigns = await getCampaigns();
    const campMap = new Map(campaigns.map((c) => [c.id, c.title]));

    const rows = [
      ['ID', 'Email', 'Campagne ID', 'Nom Campagne', 'Statut', 'Date Envoi', 'Lien Invitation'].join(';')
    ];

    for (const inv of invitations) {
      const campTitle = campMap.get(inv.campaignId) || inv.campaignId;
      rows.push([
        inv.id,
        inv.email,
        inv.campaignId,
        `"${campTitle.replace(/"/g, '""')}"`,
        inv.status,
        inv.sentAt,
        inv.campaignLink,
      ].join(';'));
    }

    const csvContent = '\uFEFF' + rows.join('\r\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="invitations_emails_${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting invitations:', error);
    return NextResponse.json({ success: false, error: 'Erreur export CSV' }, { status: 500 });
  }
}
