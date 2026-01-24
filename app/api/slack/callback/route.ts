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

    // Save Slack auth info to supabase slack_auth table
    const { error } = await supabaseServer
      .from("slack_auth")
      .insert({
        team_id: data.team.id,
        team_name: data.team.name,
        access_token: data.access_token, // bot token
        bot_access_token: data.access_token, // duplicate for clarity
        user_access_token: data.authed_user?.access_token ?? null,
      });

    if (error) {
      console.error("[SUPABASE ERROR]", error);
      return NextResponse.json(
        { error: "Failed to save Slack installation" },
        { status: 500 }
      );
    }

    // Create or get user by Slack team id or user id (custom logic)
    // For demo, we create a user with email as team_name@slack.local
    const email = `${data.team.name.replace(/\s+/g, '').toLowerCase()}@slack.local`;

    // Generate magic link for this user
    const { data: magicLinkData, error: magicLinkError } =
  await supabaseServer.auth.admin.generateLink({
    type: "magiclink",
    email,
  });


    if (magicLinkError) {
      console.error("[SUPABASE MAGIC LINK ERROR]", magicLinkError);
      return NextResponse.json(
        { error: "Failed to generate magic link" },
        { status: 500 }
      );
    }

    // Set session cookie with magic link token (simulate login)
    // Note: Supabase Admin API does not directly create session tokens,
    // so we simulate login by redirecting user to magic link URL.

    // Redirect user to magic link URL to complete login
   // 1. Pobierz magic link URL
const magicLink = magicLinkData.properties.action_link;

// 2. Server-side "kliknięcie" magic linka
const magicResponse = await fetch(magicLink, {
  method: "GET",
  redirect: "manual",
});

// 3. Przenieś cookie z odpowiedzi Supabase do przeglądarki
const setCookie = magicResponse.headers.get("set-cookie");

const response = NextResponse.redirect(new URL("/", appUrl));

if (setCookie) {
  response.headers.set("set-cookie", setCookie);
}

return response;

  } catch (e) {
    console.error("[CALLBACK CRASH]", e);
    return NextResponse.json(
      { error: "Slack callback crashed" },
      { status: 500 }
    );
  }
}
