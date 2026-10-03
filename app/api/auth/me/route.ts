import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  if (isAdminRequest(req)) {
    return NextResponse.json({
      authenticated: true,
      user: { username: 'admin', role: 'administrator' },
    });
  }
  return NextResponse.json({
    authenticated: false,
  });
}
