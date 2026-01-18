import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

type Presence = "online" | "busy" | "offline";

export async function POST() {
  // 1️⃣ Pobierz token Slacka
  const { data: auth, error: authError } = await supabaseServer
    .from("slack_auth")
    .select("access_token")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (authError || !auth?.access_token) {
    return NextResponse.json(
      { error: "No Slack access token" },
      { status: 401 }
    );
  }

  const token = auth.access_token;

  // 2️⃣ Pobierz wszystkie biurka (Slack users)
  const { data: desks, error: desksError } = await supabaseServer
    .from("desks")
    .select("id");

  if (desksError || !desks) {
    return NextResponse.json(
      { error: "Cannot load desks" },
      { status: 500 }
    );
  }

  // 3️⃣ Sprawdź presence każdego usera
  for (const desk of desks) {
    const res = await fetch(
      `https://slack.com/api/users.getPresence?user=${desk.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!data.ok) continue;

    let presence: Presence = "offline";

    if (data.presence === "active") {
      presence = data.dnd?.dnd_enabled ? "busy" : "online";
    }

    // 4️⃣ Zapisz presence do Supabase
    await supabaseServer
      .from("desks")
      .update({ presence })
      .eq("id", desk.id);
  }

  return NextResponse.json({ ok: true });
}
