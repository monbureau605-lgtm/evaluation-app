import { NextRequest, NextResponse } from 'next/server';
import { setActiveCampaign, updateCampaign } from '@/lib/db';
import { translateTextToArabic } from '@/lib/server-translator';
import { requireAdmin } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const { campaignId } = await req.json();
    if (!campaignId) {
      return NextResponse.json({ success: false, error: 'Identifiant de campagne manquant' }, { status: 400 });
    }
    let updated = await setActiveCampaign(campaignId);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Campagne introuvable' }, { status: 404 });
    }

    // If campaign is missing Arabic translations, automatically generate and save them
    if (!updated.titleAr || !updated.descriptionAr) {
      const nextTitleAr = updated.titleAr || (await translateTextToArabic(updated.title));
      const nextDescAr = updated.descriptionAr || (await translateTextToArabic(updated.description));
      const enriched = await updateCampaign(campaignId, {
        titleAr: nextTitleAr,
        descriptionAr: nextDescAr,
      });
      if (enriched) updated = enriched;
    }

    return NextResponse.json({ success: true, activeCampaign: updated });
  } catch (error) {
    console.error('Error switching campaign:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
