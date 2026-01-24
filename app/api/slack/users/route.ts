import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  const { data: auth } = await supabaseServer
    .from("slack_auth")
    .select("access_token")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // Added console log for slack_auth presence
  console.log("[API /slack/users] slack_auth found:", !!auth);

  if (!auth) {
    return NextResponse.json({ error: "no slack auth" }, { status: 401 });
  }

  const res = await fetch("https://slack.com/api/users.list", {
    headers: {
      Authorization: `Bearer ${auth.access_token}`,
    },
  });

  const data = await res.json();

  if (!data.ok) {
    return NextResponse.json(data, { status: 400 });
  }

  const users = data.members
    .filter((u: any) => !u.is_bot && !u.deleted)
    .map((u: any) => ({
      id: u.id,
      name: u.real_name || u.name,
      email: u.profile?.email ?? "",
    }));

  // Added console log for number of users returned from Slack API
  console.log("[API /slack/users] Slack users count:", users.length);

  return NextResponse.json(users);
}
