import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET() {
  try {
    // Return the latest saved Slack workspace info from slack_auth table
    const { data, error } = await supabaseServer
      .from('slack_auth')
      .select('team_name')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return NextResponse.json({ team_name: null });
    }

    return NextResponse.json({ team_name: data.team_name });
  } catch (e) {
    console.error('[API slack workspace] error', e);
    return NextResponse.json({ team_name: null });
  }
}
