export const dynamic = "force-dynamic";

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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const clientId = process.env.SLACK_CLIENT_ID;
    const clientSecret = process.env.SLACK_CLIENT_SECRET;
    const redirectUri = process.env.SLACK_REDIRECT_URI;
    const appUrl = process.env.APP_URL;

    if (!clientId || !clientSecret || !redirectUri || !appUrl) {
      console.error("[SLACK CALLBACK] Missing env vars", {
        SLACK_CLIENT_ID: !!clientId,
        SLACK_CLIENT_SECRET: !!clientSecret,
        SLACK_REDIRECT_URI: !!redirectUri,
        APP_URL: !!appUrl,
      });

      return NextResponse.json(
        { error: "Slack OAuth misconfigured" },
        { status: 500 }
      );
    }

    const res = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    const data = await res.json();

    console.log("[SLACK CALLBACK] response", data);

    if (!data.ok) {
      return NextResponse.json(data, { status: 400 });
    }

    const { error } = await supabaseServer.from("slack_auth").insert({
      team_id: data.team.id,
      team_name: data.team.name,
      access_token: data.access_token,
      scope: data.scope,
      installed_at: new Date().toISOString(),
    });

    if (error) {
      console.error("[SUPABASE ERROR]", error);
      return NextResponse.json(
        { error: "Failed to save Slack installation" },
        { status: 500 }
      );
    }

    return NextResponse.redirect(
      new URL("/admin", appUrl)
    );
  } catch (e) {
    console.error("[CALLBACK CRASH]", e);
    return NextResponse.json(
      { error: "Slack callback crashed" },
      { status: 500 }
    );
  }
}
