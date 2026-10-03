import { NextRequest, NextResponse } from 'next/server';
import { getInvitations, getInvitationBatches, addInvitations, deleteInvitation, clearInvitations, getActiveCampaign } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId') || undefined;

    const invitations = await getInvitations(campaignId);
    const batches = await getInvitationBatches(campaignId);
    const active = await getActiveCampaign();

    return NextResponse.json({
      success: true,
      invitations,
      batches,
      totalCount: invitations.length,
      activeCampaign: active,
    });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const body = await req.json();
    const { campaignId, subject, emails, baseUrl, fileName } = body;

    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Veuillez fournir au moins une adresse email valide' },
        { status: 400 }
      );
    }

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = Array.from(
      new Set(
        emails
          .map((e: string) => (typeof e === 'string' ? e.trim().toLowerCase() : ''))
          .filter((e: string) => emailRegex.test(e))
      )
    );

    if (validEmails.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Aucune adresse email valide détectée' },
        { status: 400 }
      );
    }

    const activeCampaign = await getActiveCampaign();
    const finalCampaignId = campaignId || activeCampaign.id;
    const finalSubject = subject?.trim() || `💎 Invitation : Évaluez notre nouvelle collection`;
    const finalBaseUrl = baseUrl || req.nextUrl.origin;

    const result = await addInvitations({
      campaignId: finalCampaignId,
      subject: finalSubject,
      emails: validEmails,
      baseUrl: finalBaseUrl,
      fileName: fileName || undefined,
    });

    return NextResponse.json({
      success: true,
      message: `${result.count} invitation(s) envoyée(s) avec succès`,
      batch: result.batch,
      invitations: result.invitations,
      count: result.count,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating invitations:', error);
    return NextResponse.json({ success: false, error: "Erreur lors de l'envoi des invitations" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const campaignId = searchParams.get('campaignId');

    if (id) {
      const ok = await deleteInvitation(id);
      return NextResponse.json({ success: ok });
    }

    if (campaignId) {
      await clearInvitations(campaignId);
      return NextResponse.json({ success: true, message: 'Invitations supprimées pour cette campagne' });
    }

    return NextResponse.json({ success: false, error: 'Paramètre id ou campaignId requis' }, { status: 400 });
  } catch (error) {
    console.error('Error deleting invitations:', error);
    return NextResponse.json({ success: false, error: 'Erreur suppression' }, { status: 500 });
  }
}
