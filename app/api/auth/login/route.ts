import { NextRequest, NextResponse } from 'next/server';
import { createAdminSession, verifyAdminCredentials, ADMIN_COOKIE_NAME } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (verifyAdminCredentials(username, password)) {
      const session = createAdminSession();
      const response = NextResponse.json({
        success: true,
        user: { username: 'admin', role: 'administrator' },
        message: 'Connexion réussie',
      });

      // Set auth cookie
      response.cookies.set(ADMIN_COOKIE_NAME, session.value, {
        httpOnly: true,
        path: '/',
        maxAge: session.maxAge,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: 'Identifiant ou mot de passe incorrect' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Configuration administrateur indisponible' }, { status: 503 });
  }
}
