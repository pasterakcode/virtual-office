import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

type Presence = "online" | "busy" | "offline";

export async function POST() {
  // 1️⃣ Pobierz OBA tokeny Slacka
  const { data: auth, error: authError } = await supabaseServer
    .from("slack_auth")
    .select("access_token, bot_access_token")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (
    authError ||
    !auth?.access_token ||
    !auth?.bot_access_token
  ) {
    return NextResponse.json(
      { error: "Missing Slack tokens" },
      { status: 401 }
    );
  }

  const userToken = auth.access_token;      // xoxp- → custom status
  const botToken = auth.bot_access_token;   // xoxb- → presence

  // 2️⃣ Pobierz wszystkie biurka
  const { data: desks, error: desksError } = await supabaseServer
    .from("desks")
    .select("id");

  if (desksError || !desks) {
    return NextResponse.json(
      { error: "Cannot load desks" },
      { status: 500 }
    );
  }

  // 3️⃣ Aktualizuj presence + status dla każdego usera
  for (const desk of desks) {
    /* ---------- PRESENCE (BOT TOKEN) ---------- */
    const presenceRes = await fetch(
      `https://slack.com/api/users.getPresence?user=${desk.id}`,
      {
        headers: {
          Authorization: `Bearer ${botToken}`,
        },
      }
    );

    const presenceData = await presenceRes.json();

    let presence: Presence = "offline";

    if (presenceData.ok && presenceData.presence === "active") {
      presence = presenceData.dnd?.dnd_enabled
        ? "busy"
        : "online";
    }

    /* ---------- CUSTOM STATUS (USER TOKEN) ---------- */
    const profileRes = await fetch(
      `https://slack.com/api/users.profile.get?user=${desk.id}`,
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    const profileData = await profileRes.json();

    const status_text =
      profileData?.profile?.status_text || null;

    const status_emoji =
      profileData?.profile?.status_emoji || null;

    /* ---------- UPDATE DB ---------- */
    await supabaseServer
      .from("desks")
      .update({
        presence,
        status_text,
        status_emoji,
      })
      .eq("id", desk.id);
  }

  return NextResponse.json({ ok: true });
}
