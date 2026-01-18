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

    /**
     * Slack OAuth v2 response contains:
     * - data.access_token           → USER token (xoxp-)
     * - data.bot.bot_access_token   → BOT token  (xoxb-)
     */
    const userAccessToken = data.access_token;
    const botAccessToken = data.bot?.bot_access_token;

    if (!userAccessToken || !botAccessToken) {
      return NextResponse.json(
        {
          error: "Missing Slack tokens",
          userAccessTokenExists: !!userAccessToken,
          botAccessTokenExists: !!botAccessToken,
        },
        { status: 500 }
      );
    }

    // 💾 Save tokens in Supabase
    const { error } = await supabaseServer.from("slack_auth").insert({
      team_id: data.team.id,
      team_name: data.team.name,

      // USER TOKEN → custom status
      user_access_token: userAccessToken,

      // BOT TOKEN → presence
      bot_access_token: botAccessToken,
    });

    if (error) {
      console.error("SUPABASE INSERT ERROR", error);
      return NextResponse.json(
        { error: "Database error", details: error },
        { status: 500 }
      );
    }

    // 🚀 Redirect back to Admin panel
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
