import { createHmac, timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const COOKIE_NAME = 'admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function secret(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function sign(value: string): string {
  return createHmac('sha256', secret('ADMIN_SESSION_SECRET')).update(value).digest('hex');
}

export function verifyAdminCredentials(username: unknown, password: unknown): boolean {
  const expectedUser = secret('ADMIN_USERNAME');
  const expectedPassword = secret('ADMIN_PASSWORD');
  if (typeof username !== 'string' || typeof password !== 'string') return false;
  const actualUser = Buffer.from(username.trim());
  const actualPassword = Buffer.from(password);
  const userBuffer = Buffer.from(expectedUser);
  const passwordBuffer = Buffer.from(expectedPassword);
  return actualUser.length === userBuffer.length && actualPassword.length === passwordBuffer.length
    && timingSafeEqual(actualUser, userBuffer) && timingSafeEqual(actualPassword, passwordBuffer);
}

export function createAdminSession(): { value: string; maxAge: number } {
  const expires = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = String(expires);
  return { value: `${payload}.${sign(payload)}`, maxAge: SESSION_TTL_SECONDS };
}

export function isAdminRequest(request: NextRequest): boolean {
  const value = request.cookies.get(COOKIE_NAME)?.value;
  if (!value) return false;
  const [expires, signature, extra] = value.split('.');
  if (!expires || !signature || extra || !/^\d+$/.test(expires) || Number(expires) <= Date.now() / 1000) return false;
  const expected = Buffer.from(sign(expires));
  const actual = Buffer.from(signature);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function requireAdmin(request: NextRequest): NextResponse | null {
  return isAdminRequest(request)
    ? null
    : NextResponse.json({ success: false, error: 'Authentification administrateur requise' }, { status: 401 });
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
