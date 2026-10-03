import { NextRequest, NextResponse } from 'next/server';
import { addEvaluation, getEvaluations, getActiveCampaign, getProductById } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId') || undefined;
    const productId = searchParams.get('productId') || undefined;

    const evaluations = await getEvaluations(campaignId, productId);
    return NextResponse.json({ success: true, count: evaluations.length, evaluations });
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, rating, estimatedPrice, criteria, campaignId, participantSessionId } = body;

    if (!productId) {
      return NextResponse.json({ success: false, error: 'Produit manquant' }, { status: 400 });
    }

    const product = await getProductById(productId);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Produit non trouvé' }, { status: 404 });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { success: false, error: 'Veuillez attribuer une note entre 1 et 5 étoiles' },
        { status: 400 }
      );
    }

    const numPrice = Number(estimatedPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      return NextResponse.json(
        { success: false, error: 'Veuillez saisir un prix valide supérieur à 0' },
        { status: 400 }
      );
    }

    const activeCampaign = await getActiveCampaign();
    const finalCampaignId = campaignId || product.campaignId || activeCampaign.id;
    const finalSessionId = participantSessionId || req.headers.get('x-visitor-id') || 'visitor-anon';

    const saved = await addEvaluation({
      campaignId: finalCampaignId,
      productId,
      rating: numRating,
      estimatedPrice: numPrice,
      criteria: criteria && typeof criteria === 'object' ? {
        design: Number(criteria.design) || numRating,
        quality: Number(criteria.quality) || numRating,
        originality: Number(criteria.originality) || numRating,
        purchaseIntent: Number(criteria.purchaseIntent) || numRating,
      } : undefined,
      participantSessionId: finalSessionId,
    });

    return NextResponse.json({
      success: true,
      message: 'Évaluation enregistrée avec succès',
      evaluation: saved,
    });
  } catch (error) {
    console.error('Error submitting evaluation:', error);
    return NextResponse.json({ success: false, error: "Erreur lors de l'enregistrement" }, { status: 500 });
  }
}
