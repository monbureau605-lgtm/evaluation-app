import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Déconnexion effectuée' });
  response.cookies.delete('admin_session');
  return response;
}
