import { NextRequest, NextResponse } from 'next/server';
import { addProductInterest, getProductById } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const productId = typeof body.productId === 'string' ? body.productId.trim() : '';
    const campaignId = typeof body.campaignId === 'string' ? body.campaignId.trim() : '';
    const participantSessionId = typeof body.participantSessionId === 'string'
      ? body.participantSessionId.trim()
      : '';

    if (!productId || !campaignId || participantSessionId.length < 8 || participantSessionId.length > 100) {
      return NextResponse.json({ success: false, error: 'Informations de clic invalides.' }, { status: 400 });
    }

    const product = await getProductById(productId);
    if (!product || product.campaignId !== campaignId) {
      return NextResponse.json({ success: false, error: 'Produit introuvable dans cette campagne.' }, { status: 404 });
    }

    const result = await addProductInterest({ productId, campaignId, participantSessionId });
    return NextResponse.json({ success: true, alreadyRegistered: !result.created });
  } catch (error) {
    console.error('Error recording product interest:', error);
    return NextResponse.json({ success: false, error: 'Impossible d’enregistrer votre intérêt.' }, { status: 500 });
  }
}
