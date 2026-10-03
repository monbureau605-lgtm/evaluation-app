import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct, updateProduct, deleteProduct, getActiveCampaign } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId') || undefined;
    const products = await getProducts(campaignId);
    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const body = await req.json();
    if (!body.name || !body.description) {
      return NextResponse.json(
        { success: false, error: 'Nom et description sont requis' },
        { status: 400 }
      );
    }

    const active = await getActiveCampaign();
    const images: string[] = Array.isArray(body.images) && body.images.length > 0
      ? body.images.filter((img: string) => typeof img === 'string' && img.trim() !== '').slice(0, 3)
      : [
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop'
        ];

    const newProduct = await createProduct({
      name: body.name.trim(),
      description: body.description.trim(),
      category: body.category?.trim() || 'Général',
      suggestedPrice: body.suggestedPrice !== undefined ? Number(body.suggestedPrice) : undefined,
      images,
      videoUrl: typeof body.videoUrl === 'string' ? body.videoUrl.trim() : undefined,
      campaignId: body.campaignId || active.id,
    });

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors de la création du produit' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const body = await req.json();
    const { id, name, description, category, suggestedPrice, images, videoUrl, campaignId } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Identifiant du produit manquant' }, { status: 400 });
    }

    const filteredImages = Array.isArray(images)
      ? images.filter((img: string) => typeof img === 'string' && img.trim() !== '').slice(0, 3)
      : undefined;

    const updated = await updateProduct(id, {
      name,
      description,
      category,
      suggestedPrice: suggestedPrice !== undefined ? Number(suggestedPrice) : undefined,
      images: filteredImages,
      videoUrl: typeof videoUrl === 'string' ? videoUrl.trim() : undefined,
      campaignId,
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Produit introuvable' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors de la mise à jour du produit' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Identifiant du produit requis' }, { status: 400 });
    }

    const ok = await deleteProduct(id);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Produit introuvable' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ success: false, error: 'Erreur suppression produit' }, { status: 500 });
  }
}
