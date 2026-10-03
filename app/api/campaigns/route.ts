import { NextRequest, NextResponse } from 'next/server';
import { getCampaigns, getActiveCampaign, createCampaign, updateCampaign, deleteCampaign } from '@/lib/db';
import { translateTextToArabic } from '@/lib/server-translator';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  try {
    const campaigns = await getCampaigns();
    const active = await getActiveCampaign();
    return NextResponse.json({
      success: true,
      campaigns,
      activeCampaign: active,
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const body = await req.json();
    if (!body.title || !body.description) {
      return NextResponse.json(
        { success: false, error: 'Titre et description requis' },
        { status: 400 }
      );
    }
    const images = Array.isArray(body.images)
      ? body.images.filter((img: string) => typeof img === 'string' && img.trim() !== '').slice(0, 3)
      : undefined;

    // Automatically translate to Arabic if not supplied
    let titleAr = typeof body.titleAr === 'string' && body.titleAr.trim() !== '' ? body.titleAr.trim() : '';
    let descriptionAr = typeof body.descriptionAr === 'string' && body.descriptionAr.trim() !== '' ? body.descriptionAr.trim() : '';

    if (!titleAr && body.title) {
      titleAr = await translateTextToArabic(body.title);
    }
    if (!descriptionAr && body.description) {
      descriptionAr = await translateTextToArabic(body.description);
    }

    const newCamp = await createCampaign({
      title: body.title,
      description: body.description,
      titleAr,
      descriptionAr,
      currency: body.currency || 'MAD',
      videoUrl: body.videoUrl || undefined,
      images,
    });
    return NextResponse.json({ success: true, campaign: newCamp }, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors de la création' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const body = await req.json();
    const { id, title, description, titleAr, descriptionAr, currency, active, videoUrl, images } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Identifiant de campagne manquant' }, { status: 400 });
    }

    const filteredImages = Array.isArray(images)
      ? images.filter((img: string) => typeof img === 'string' && img.trim() !== '').slice(0, 3)
      : undefined;

    // Automatically translate if Arabic text was not explicitly provided or is blank
    let nextTitleAr = typeof titleAr === 'string' && titleAr.trim() !== '' ? titleAr.trim() : undefined;
    let nextDescAr = typeof descriptionAr === 'string' && descriptionAr.trim() !== '' ? descriptionAr.trim() : undefined;

    if (!nextTitleAr && title) {
      nextTitleAr = await translateTextToArabic(title);
    }
    if (!nextDescAr && description) {
      nextDescAr = await translateTextToArabic(description);
    }

    const updated = await updateCampaign(id, {
      title,
      description,
      titleAr: nextTitleAr,
      descriptionAr: nextDescAr,
      currency,
      active,
      videoUrl,
      images: filteredImages,
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Campagne introuvable' }, { status: 404 });
    }

    return NextResponse.json({ success: true, campaign: updated });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json({ success: false, error: 'Erreur mise à jour campagne' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Identifiant de campagne requis' }, { status: 400 });
    }

    const result = await deleteCampaign(id);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Erreur lors de la suppression' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Campagne supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur suppression campagne' }, { status: 500 });
  }
}
