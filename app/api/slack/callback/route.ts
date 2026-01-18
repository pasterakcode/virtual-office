import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Missing OAuth code" },
        { status: 400 }
      );
    }

    // 🔐 Exchange code for tokens
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
      return NextResponse.json(
        { error: "Slack OAuth failed", details: data },
        { status: 400 }
      );
    }

    // 🔑 Dane, które MOGĄ być null — i to jest OK
    const userAccessToken = data.access_token ?? null; // xoxp-
    const botAccessToken = data.bot?.bot_access_token ?? null; // xoxb-

    const teamId = data.team?.id ?? null;
    const teamName = data.team?.name ?? null;

    // 💾 ZAWSZE zapisujemy wiersz
    const { error } = await supabaseServer.from("slack_auth").insert({
      team_id: teamId,
      team_name: teamName,

      user_access_token: userAccessToken,
      bot_access_token: botAccessToken,

      // pomocniczo – debug
      raw_oauth_response: data,
    });

    if (error) {
      console.error("SUPABASE INSERT ERROR", error);
      return NextResponse.json(
        { error: "Database insert failed", details: error },
        { status: 500 }
      );
    }

    // 🚀 Redirect do Admin Panelu
    return NextResponse.redirect(
      new URL("/admin", process.env.NEXT_PUBLIC_APP_URL!)
    );
  } catch (e) {
    console.error("SLACK CALLBACK CRASH", e);
    return NextResponse.json(
      { error: "Slack callback crashed" },
      { status: 500 }
    );
  }
}
