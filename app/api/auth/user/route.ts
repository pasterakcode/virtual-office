import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(req: Request) {
  try {
    // Normally here you would authenticate the request,
    // for example by checking a cookie or session.
    // For now, just attempt to obtain the user from Supabase auth.

    const { data: { user }, error } = await supabaseServer.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (e) {
    console.error('[auth/user] error', e);
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 });
  }
}
