import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "no code" }, { status: 400 });
    }

    const res = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        redirect_uri: process.env.SLACK_REDIRECT_URI!,
      }),
    });

    const data = await res.json();

    console.log("SLACK OAUTH RESPONSE", data);

    if (!data.ok) {
      return NextResponse.json(data, { status: 400 });
    }

    /**
     * 🔑 STABILNA ZASADA:
     * - access_token = token używany przez aplikację
     * - na dziś: bierzemy data.access_token
     */
    const accessToken = data.access_token ?? null;

    const { error } = await supabaseServer.from("slack_auth").insert({
      team_id: data.team?.id ?? null,
      team_name: data.team?.name ?? null,

      // 🔥 KLUCZOWE – przywracamy to pole
      access_token: accessToken,

      // opcjonalnie, NIE używane teraz
      user_access_token: accessToken,
      bot_access_token: null,
    });

    if (error) {
      console.error("SUPABASE ERROR", error);
      return NextResponse.json(error, { status: 500 });
    }

    return NextResponse.redirect(
      new URL("/admin", process.env.NEXT_PUBLIC_APP_URL!)
    );
  } catch (e) {
    console.error("CALLBACK CRASH", e);
    return NextResponse.json(
      { error: "callback crashed" },
      { status: 500 }
    );
  }
}
