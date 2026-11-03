import { NextResponse } from 'next/server';
import { isUserAdmin } from '@/lib/auth';

export async function GET() {
  const authenticated = isUserAdmin();
  return NextResponse.json({ authenticated });
}

